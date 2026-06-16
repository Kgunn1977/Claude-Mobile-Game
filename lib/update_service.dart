import 'dart:convert';
import 'package:http/http.dart' as http;
import 'version.dart';

class LatestRelease {
  LatestRelease(this.build, this.name, this.apkUrl);
  final int build;
  final String name;
  final String apkUrl;
}

/// Checks the public GitHub Releases for a newer build. (Repo is public, so no
/// auth.) The actual APK download is handed to the system browser/downloader so
/// it survives the app losing focus.
class UpdateService {
  Future<LatestRelease?> check() async {
    final r = await http.get(Uri.parse(kRepoApiLatest),
        headers: {'Accept': 'application/vnd.github+json'});
    if (r.statusCode != 200) return null;
    final j = jsonDecode(r.body) as Map<String, dynamic>;
    final tag = (j['tag_name'] ?? '').toString(); // e.g. build-7
    final m = RegExp(r'(\d+)').firstMatch(tag);
    final build = m != null ? int.parse(m.group(1)!) : 0;
    String? apk;
    for (final a in (j['assets'] as List? ?? const [])) {
      final name = (a as Map)['name']?.toString() ?? '';
      if (name.toLowerCase().endsWith('.apk')) {
        apk = a['browser_download_url']?.toString();
      }
    }
    if (apk == null) return null;
    return LatestRelease(build, (j['name'] ?? tag).toString(), apk);
  }
}
