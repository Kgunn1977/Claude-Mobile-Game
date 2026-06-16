# Colony Game

A mobile **colony-management survival builder** (Banished spine + light RimWorld
people + ONI-style resource accounting), built **Android-first** with
**Flutter + Flame**. All development is phone-only: builds run in the cloud via
GitHub Actions and produce a debug APK you install by hand.

> Full design lives in **`docs/`** — start with `docs/project-overview.md`
> (the consolidated source of truth), then `vision.md`, `tech-stack.md`, and the
> staged build plan. `banished.md` / `rimworld.md` / `oxygen-not-included.md`
> are deep research for when we grow past v1.

## How to get the app on your phone

1. Push triggers a build automatically. On **github.com**, open the repo →
   **Actions** tab → the latest **build-apk** run.
2. Wait for the green check, then open the run and download the
   **`app-debug-apk`** artifact (a `.zip`; extract the `.apk`).
3. Open the `.apk` on your phone to install (allow "install unknown apps" once
   if prompted — debug APKs need no Play Store account).

## Stage status

- **Stage 0 — Pipeline:** ✅ Flutter+Flame project + GitHub Actions debug-APK build.
- **Stage 1 — "It opens":** ✅ launches to a swipe-paged UI (Map | Data); a
  512×512 meadow you can **pan & pinch-zoom**; a **simulation clock**
  (1 day = 10 real min at 1×) with **Pause / 1× / 2× / 5×** and **auto-pause**
  when the app loses focus.
- **Stage 2+:** place buildings + assign jobs → the economy → readouts + save
  (see `docs/project-overview.md` §4).

## Project layout

```
lib/
  main.dart            app shell: swipe pages (Map|Data) + lifecycle auto-pause
  game/colony_game.dart Flame game: camera pan/zoom + simulation clock
  game/meadow.dart      batched 512×512 meadow + grid overlay
  ui/map_page.dart      map + day readout + speed controls
  ui/data_page.dart     placeholder data page
.github/workflows/build.yml   cloud build → app-debug-apk artifact
docs/                  design + research
```

The Android/iOS platform folders are **generated in CI** (`flutter create`), so
they aren't committed — only `pubspec.yaml`, `lib/`, and the workflow are.

## Tech notes

- Stack is locked: **Flutter (Dart) + Flame**, GitHub Actions, free tooling only.
- Keep systems **small, isolated, well-commented** — this codebase is edited by
  an AI one system at a time.
- The simulation runs on Flame's game loop, separate from the Flutter UI, and
  advances only while the app is foregrounded.
