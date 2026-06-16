import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import '../update_service.dart';
import '../version.dart';

/// One-tap updater: checks GitHub Releases, and if a newer build exists,
/// downloads the APK and hands it to Android's installer.
class UpdateButton extends StatefulWidget {
  const UpdateButton({super.key});
  @override
  State<UpdateButton> createState() => _UpdateButtonState();
}

enum _S { idle, checking, upToDate, available, downloading, opening, error }

class _UpdateButtonState extends State<UpdateButton> {
  final _svc = UpdateService();
  _S _s = _S.idle;
  LatestRelease? _rel;
  double _progress = 0;
  String _msg = '';

  Future<void> _check() async {
    setState(() => _s = _S.checking);
    try {
      final r = await _svc.check();
      if (r == null) {
        setState(() {
          _s = _S.error;
          _msg = "Couldn't reach Releases.";
        });
      } else if (r.build > kBuildNumber) {
        setState(() {
          _rel = r;
          _s = _S.available;
        });
      } else {
        setState(() => _s = _S.upToDate);
      }
    } catch (e) {
      setState(() {
        _s = _S.error;
        _msg = 'Check failed.';
      });
    }
  }

  Future<void> _downloadAndInstall() async {
    setState(() {
      _s = _S.downloading;
      _progress = 0;
    });
    try {
      final file =
          await _svc.download(_rel!.apkUrl, (p) => setState(() => _progress = p));
      setState(() => _s = _S.opening);
      await OpenFilex.open(file.path); // Android install prompt
      setState(() => _s = _S.available); // back to available if they cancel
    } catch (e) {
      setState(() {
        _s = _S.error;
        _msg = 'Download failed.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final (label, onTap, busy) = switch (_s) {
      _S.idle => ('Check for updates', _check, false),
      _S.checking => ('Checking…', null, true),
      _S.upToDate => ("You're on the latest (Build $kBuildNumber)", _check, false),
      _S.available => ('⬇ Install Build ${_rel!.build}', _downloadAndInstall, false),
      _S.downloading =>
        ('Downloading ${(_progress * 100).floor()}%', null, true),
      _S.opening => ('Opening installer…', null, true),
      _S.error => ('$_msg  Tap to retry', _check, false),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
            decoration: BoxDecoration(
              color: _s == _S.available
                  ? const Color(0xFF9ED35A)
                  : const Color(0xFF1D2618),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF9ED35A)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (busy)
                  const Padding(
                    padding: EdgeInsets.only(right: 10),
                    child: SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Color(0xFF9ED35A))),
                  ),
                Text(label,
                    style: TextStyle(
                        color: _s == _S.available
                            ? Colors.black
                            : const Color(0xFF9ED35A),
                        fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ),
        if (_s == _S.downloading)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: LinearProgressIndicator(
                value: _progress,
                backgroundColor: const Color(0xFF1D2618),
                color: const Color(0xFF9ED35A)),
          ),
        if (_s == _S.opening || _s == _S.available && _progress > 0)
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Text('If install is blocked, allow “install unknown apps”.',
                style: TextStyle(color: Colors.white38, fontSize: 12)),
          ),
      ],
    );
  }
}
