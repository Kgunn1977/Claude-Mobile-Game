# Stage 1 Build Brief — for Claude Code

*Paste this into a Claude Code session (the one with GitHub connected). It tells Claude Code exactly what to build and wire up. Keep scope tight: Stage 1's only job is to prove the toolchain works on the phone — "it opens." No game logic yet beyond a ticking clock.*

---

## Context

We are building a mobile colony-management game (a Banished-style survival builder), Android first, iPhone later. All development is phone-only: the user cannot run a local build, so **everything must build in the cloud via GitHub Actions and produce a downloadable APK** the user installs by hand.

Full design lives in separate spec docs (game-spec.md, tech-stack.md, vision.md, plus three research docs). For Stage 1 you do **not** need the game logic — only the items below.

## Tech stack (already decided — do not substitute)

- **Flutter** (Dart) for the app.
- **Flame** (2D engine, `flame` package) for the map/canvas and game loop.
- **GitHub Actions** for free cloud builds, producing a **debug APK uploaded as a build artifact** (debug so no signing/keystore is needed to install for testing).
- Standard Flutter UI widgets for on-screen controls/overlays.

## Stage 1 scope — "it opens"

Build the smallest app that proves the pipeline and the core shell:

1. **App launches** on Android to a single screen.
2. **Horizontal swipe-paged UI** (e.g. `PageView`): **Page 0 (leftmost) = the Map.** Add one placeholder page to the right (blank "Data" page) so swiping is demonstrably working.
3. **Map page** shows a **512 × 512 tile grid, all "meadow"** (a flat green tiled area), rendered with Flame.
   - The player can **pan** (drag) and **pinch-zoom** the map (Flame camera). Ensure the full grid is reachable.
   - Performance note: 262,144 tiles — do **not** create a component per tile. Render the meadow as a tiled background / single batched layer or a shader/colored area with a grid overlay. Keep it lightweight.
4. **A simulation clock** runs on the Flame game loop:
   - **1 in-game day = 10 real minutes at 1× speed** (600 seconds/day).
   - On-screen readout of the current **Day** and time-of-day (or day fraction).
   - **Speed controls: Pause, 1×, 2×, 5×** (buttons or a segmented control overlaid on the map). Changing speed changes how fast the day counter advances. Paused = frozen.
   - **Auto-pause when the app loses focus** (lifecycle handling), so nothing runs in the background.

That's all for Stage 1. No resources, no buildings, no workers yet.

## GitHub Actions requirement

Create `.github/workflows/build.yml` that, on every push to the main branch:
- checks out the repo,
- sets up Flutter (stable channel),
- runs `flutter pub get`,
- runs `flutter build apk --debug`,
- **uploads the resulting `app-debug.apk` as a workflow artifact** (so the user can download it from the Actions run page on github.com in a phone browser).

Use a current, well-supported setup (e.g. the official `subosito/flutter-action`). Make sure the artifact name is obvious (e.g. `app-debug-apk`).

## What to actually do, in order

1. Scaffold a new Flutter project in the connected GitHub repo (or the repo the user names).
2. Add the `flame` dependency.
3. Implement the Stage 1 scope above. Favor clarity and small files — this codebase will be edited often by an AI, so keep systems isolated and well-commented.
4. Add the GitHub Actions workflow.
5. Commit and push to the main branch.
6. Tell the user, in plain language: that the push will trigger a build, how to open the **Actions** tab on github.com in their phone browser, how to wait for the green check, and how to **download the `app-debug-apk` artifact** and install it (enabling "install from unknown sources" if prompted).

## Phone-friendly guidance for the user (Claude Code should restate this)

- The build runs automatically after each push; the user watches it on github.com → **Actions** tab.
- The installable file is under the finished run's **Artifacts** section.
- Debug APKs install without a Play Store account; the user may need to allow their browser/files app to "install unknown apps" once.

## Acceptance check for Stage 1

The user installs the APK and confirms: the app opens, shows a green meadow map they can pan/zoom, they can swipe to a second page and back, the Day counter advances, and Pause/1×/2×/5× visibly change the speed. If all true, Stage 1 is done and we proceed to Stage 2 (place buildings + assign jobs) back in the design chat.

## Hand-back

After Stage 1 works, design decisions and the next stage's scope continue in the main design chat (which holds the full specs). Claude Code's job each round is to implement the agreed scope, push, and confirm a clean build.
