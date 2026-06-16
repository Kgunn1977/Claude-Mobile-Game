import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../update_service.dart';
import '../version.dart';

/// Checks GitHub Releases and, if a newer build exists, hands the APK to the
/// system browser to download (in the background — you can switch apps), then
/// you tap the finished file to install.
class UpdateButton extends StatefulWidget {
  const UpdateButton({super.key});
  @override
  State<UpdateButton> createState() => _UpdateButtonState();
}

enum _S { idle, checking, upToDate, available, launched, error }

class _UpdateButtonState extends State<UpdateButton> {
  final _svc = UpdateService();
  _S _s = _S.idle;
  LatestRelease? _rel;
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
    } catch (_) {
      setState(() {
        _s = _S.error;
        _msg = 'Check failed.';
      });
    }
  }

  Future<void> _download() async {
    await launchUrl(Uri.parse(_rel!.apkUrl),
        mode: LaunchMode.externalApplication);
    setState(() => _s = _S.launched);
  }

  @override
  Widget build(BuildContext context) {
    final (label, onTap, busy, primary) = switch (_s) {
      _S.idle => ('Check for updates', _check, false, false),
      _S.checking => ('Checking…', null, true, false),
      _S.upToDate => ("You're on the latest (Build $kBuildNumber)", _check, false, false),
      _S.available => ('⬇ Download Build ${_rel!.build}', _download, false, true),
      _S.launched => ('Downloading… check again', _check, false, false),
      _S.error => ('$_msg  Tap to retry', _check, false, false),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
            decoration: BoxDecoration(
              color: primary ? const Color(0xFF9ED35A) : const Color(0xFF1D2618),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF9ED35A)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
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
                      color: primary ? Colors.black : const Color(0xFF9ED35A),
                      fontWeight: FontWeight.w700)),
            ]),
          ),
        ),
        if (_s == _S.launched)
          const Padding(
            padding: EdgeInsets.only(top: 8),
            child: Text(
                'Downloading in your browser — switch apps freely. When it '
                'finishes, open the file to install (allow “install unknown '
                'apps” once if asked).',
                style: TextStyle(color: Colors.white54, fontSize: 12)),
          ),
      ],
    );
  }
}
