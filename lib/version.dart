/// Bump kAppVersion for humans; kBuildNumber is stamped by CI with the GitHub
/// Actions run number so the app can tell if a newer build exists.
const String kAppVersion = '0.4.0 — Stage 2';
const int kBuildNumber = 0; // overwritten in CI

const String kReleasesUrl =
    'https://github.com/Kgunn1977/Claude-Mobile-Game/releases/latest';
const String kRepoApiLatest =
    'https://api.github.com/repos/Kgunn1977/Claude-Mobile-Game/releases/latest';
