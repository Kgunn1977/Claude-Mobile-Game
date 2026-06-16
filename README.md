# Colony Game — Developer Guide & Handoff

A mobile **colony-management survival builder** (Banished spine + light RimWorld
people + ONI-style resource accounting), **Android-first**, built with
**Flutter + Flame**. This README is the entry point for whoever works on it next.

> **Design source of truth:** [`docs/project-overview.md`](docs/project-overview.md)
> (consolidated). Companions: `vision.md`, `tech-stack.md`, `game-spec.md`,
> `stage1-build-brief.md`, and deep research on `banished.md` / `rimworld.md` /
> `oxygen-not-included.md`. **If code and docs disagree, project-overview wins.**

---

## 1. Current status

| Stage | What | State |
|---|---|---|
| 0 | Toolchain: Flutter+Flame project + cloud APK pipeline | ✅ done |
| 1 | "It opens": 512×512 meadow map (pan/zoom), swipe pages, sim clock + speeds, auto-pause | ✅ done |
| 2 | Place buildings (drag-ghost), Banished headcount jobs, in-app updater | ✅ done |
| 3 | **The economy** (harvest by distance, conversions, calories, firewood heating, working-home rule) | ⬜ next |
| 4 | Real data screens + save/load | ⬜ |

Current app version is in [`lib/version.dart`](lib/version.dart) (`kAppVersion`);
the build number is stamped by CI.

**What works today:** a meadow you pan/zoom; a clock (1 in-game day = 10 real
min at 1×) with Pause/1×/2×/5× and auto-pause on focus loss; placing the 6
buildings with a draggable ghost (footprint + overlap validation); resource
nodes seeded on the map; **optimal, specialization-aware job assignment**; and an
in-app updater. There is **no economy yet** — placement is free, nothing is
produced or consumed.

---

## 2. Develop on desktop (recommended now)

Cloud builds still work, but locally you get instant runs and hot reload.

1. **Install Flutter** (stable) + Android SDK: <https://docs.flutter.dev/get-started/install>.
   Run `flutter doctor` until Android is green.
2. **Clone** and `cd` in.
3. **Generate the native platform folders** (they're *not* committed — see §5):
   ```bash
   flutter create --platforms=android --org com.example --project-name colony_game .
   ```
   This writes `android/` without touching `lib/` or `pubspec.yaml`.
4. `flutter pub get`
5. Run on an emulator or a USB device: `flutter run`  (hot reload with `r`).
6. Build an APK like CI does: `flutter build apk --debug`
   → `build/app/outputs/flutter-apk/app-debug.apk`.

> If `flutter create` ever clobbers `pubspec.yaml`/`lib`, `git checkout -- pubspec.yaml lib`
> to restore (CI does exactly this).

---

## 3. Phone-only loop (how it worked before desktop)

No computer needed: **push → GitHub Actions builds a debug APK → installs on the
phone.** Two ways to get a build onto the device:

- **In-app (preferred):** open the game → **Data → App → Check for updates**. If a
  newer build exists, **Download Build N** hands the APK to the system browser
  (downloads in the background, with a notification); tap the file to install.
- **Manual:** the repo **Releases** page (each build is published there) or the
  Actions run's **`app-debug-apk`** artifact.

The repo is **public** so release assets download without auth (required for the
in-app updater).

---

## 4. CI pipeline — `.github/workflows/build.yml`

Runs on every push (and manual dispatch). Steps, in order:

1. Checkout, set up Java 17 + Flutter (stable).
2. **`flutter create --platforms=android .`** — generates `android/` (we don't
   commit it; keeps the repo to just our source).
3. **`git checkout -- pubspec.yaml analysis_options.yaml lib`** — restore our
   authored files in case `create` touched them, so our deps/code always win.
4. **Stamp build number** — `sed` writes `github.run_number` into
   `lib/version.dart` (`kBuildNumber`) so the app knows its own build.
5. **Patch Android manifest** — injects `INTERNET`, `REQUEST_INSTALL_PACKAGES`,
   and the `url_launcher` `<queries>` block (since the manifest is regenerated
   each run).
6. `flutter pub get` → `flutter build apk --debug`.
7. Upload the APK as the `app-debug-apk` artifact.
8. **Publish a GitHub Release** (`build-<run_number>`) with the APK attached —
   this is what the in-app updater reads via the Releases API.

Requires `permissions: contents: write` (already set) for the release step.

---

## 5. Repo layout

```
lib/
  main.dart                 app shell: PageView (Map|Data) + tabs + lifecycle auto-pause
  version.dart              kAppVersion / kBuildNumber (CI-stamped) / release URLs
  game/
    colony_game.dart        Flame game: sim clock, camera pan/zoom, screen↔world
    meadow.dart             batched 512×512 meadow + grid (NO component-per-tile)
    entities_layer.dart     draws resource nodes, placed buildings, placement ghost
  model/
    types.dart              enums + data: Role(6), BuildingType(6)+footprints, NodeType(3)
  state/
    colony_state.dart       THE MODEL: colonists, buildings, nodes, jobCounts;
                            building placement + Hungarian job assignment
  ui/
    map_page.dart           map overlays: clock, speed bar, build menu, drag-place
    data_page.dart          jobs (headcount steppers), roster, buildings, App/updater
    update_button.dart      in-app update check + browser-handoff download
  update_service.dart       GitHub Releases "latest" check
docs/                       design + research (source of truth)
.github/workflows/build.yml cloud build → artifact + Release
analysis_options.yaml       minimal (no external lint pkg, so CI never blocks)
```

**Generated, NOT committed** (in `.gitignore`): `android/`, `build/`,
`.dart_tool/`, `pubspec.lock`. They're recreated locally/CI by `flutter create`.

---

## 6. Architecture & conventions

- **Keep simulation, rendering, and UI separate.** `ColonyState` (a
  `ChangeNotifier`) is the model; the Flame game reads it to draw and writes
  placements; Flutter widgets read/write it for the data screens. Heavy logic
  must never live in widgets.
- **Small, isolated, well-commented files** — this codebase is often edited by an
  AI one system at a time. Prefer a new file/class over a sprawling one.
- **Content is data.** Buildings/roles/nodes live in `model/types.dart`. Add
  content there, not by branching logic.
- **Bump `kAppVersion`** in `lib/version.dart` on meaningful changes (the build
  number auto-increments via CI).
- **Map performance:** never make one component per tile (262,144 tiles). The
  meadow is one batched layer + grid lines.

### Key parameters (starter values, meant to be tuned)
- Map: **512×512** tiles, `tileSize = 16` (in `colony_game.dart`).
- Time: **1 day = 600 s** at 1× (`secondsPerDay`); speeds 1/2/5×.
- Colonists: **6 founders**, skills 0–7 (seeded `Random(7)` in `colony_state._seed`).
- Buildings: footprints/colors/purpose in `kBuildings` (`types.dart`).

---

## 7. Gotchas & decisions (read before changing these)

- **Job assignment** (`colony_state._autoAssign`) is the **Hungarian algorithm**
  maximizing *(skill + specialization bonus)*, so each job goes to the colonist
  whose **best skill** it is — not just the highest raw number. It was verified
  against brute force. Don't revert to per-role greedy (it mis-assigns).
- **Gesture conflict:** a pannable map and horizontal page-swipe both want
  horizontal drags. Resolved with explicit **Map/Data tabs** (top-right) +
  PageView. While placing a building, one-finger drag moves the ghost and pinch
  still zooms (see `map_page.dart`).
- **Updater:** downloads via the **system browser** (background-safe). It can't be
  an in-app silent install without more Android plumbing; browser handoff was the
  reliable, free choice. Needs the repo public.
- **Free-only constraint:** no paid services. No Shorebird → **every update is a
  full APK** (~66 MB debug). To shrink: `--split-per-abi` (~25–30 MB, ship
  `arm64-v8a`) and/or a signed `--release` build (~10–15 MB); if you split, teach
  `update_service` to pick the `arm64-v8a` asset.
- **Branch:** active/default branch is `claude/mobile-story-rpg-html-p7o9x5`
  (legacy name from a prior project). CI builds on any push.

---

## 8. What to build next — Stage 3 (the economy)

Per `docs/project-overview.md` §3 (spec) and §4 (plan). Make the colony *live*:

1. **Harvest** resource nodes, rate weighted by **travel distance** to the nearest
   Storage Area × worker skill (Banished model — compute as math, don't animate
   walking yet). §3.11.
2. **Conversions:** Sawmill (Logs→Lumber), Chopping Block (Logs→Firewood),
   Kitchen (Berries→Meals). §3.7, §3.9.
3. **Calories:** each worker burns 1000 kcal/day, 4000 kcal "belly"; Berry 500,
   Meal 3000 (4 Berries→1 Meal). §3.9.
4. **Housing + heating:** homes only "work" while heated with Firewood; **no
   heated home → can't eat → starve.** Stone House = ½ firewood of Wood House. §3.10.
5. **Lose condition:** starving/freezing needs teeth (no health system yet). §3.12.

Resources are **single global totals** (no hauling sim in v1). Open tunables are
listed in project-overview §5 — sane defaults are fine; tune later.

### Suggested early hardening (not yet done)
- Add `flutter test` unit tests (assignment, placement, calorie math). The job
  logic was validated by porting to JS; bake equivalents into Dart tests.
- Consider a `flutter analyze` CI step once lints are clean.

---

## 9. Quick reference

```bash
flutter create --platforms=android .   # first time / after clone (makes android/)
flutter pub get
flutter run                            # dev with hot reload
flutter build apk --debug              # what CI ships
```
Push to the working branch → CI builds → Release published → in-app "Check for
updates" picks it up.
