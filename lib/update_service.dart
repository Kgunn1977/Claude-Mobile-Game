import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'version.dart';

class LatestRelease {
  LatestRelease(this.build, this.name, this.apkUrl);
  final int build;
  final String name;
  final String apkUrl;
}

/// Checks the public GitHub Releases for a newer build and downloads the APK.
/// (Repo is public, so no auth needed.)
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

  /// Streams the APK to a file, reporting 0..1 progress.
  Future<File> download(String url, void Function(double) onProgress) async {
    final dir =
        await getExternalStorageDirectory() ?? await getTemporaryDirectory();
    final file = File('${dir.path}/colony-latest.apk');
    final resp = await http.Client().send(http.Request('GET', Uri.parse(url)));
    final total = resp.contentLength ?? 0;
    var got = 0;
    final sink = file.openWrite();
    await for (final chunk in resp.stream) {
      sink.add(chunk);
      got += chunk.length;
      if (total > 0) onProgress(got / total);
    }
    await sink.close();
    return file;
  }
}
