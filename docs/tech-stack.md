# Tech Stack

*Plain-language technical plan for the colony-builder. Written so a non-coder can follow it. This sits alongside the three game-research docs (banished.md, rimworld.md, oxygen-not-included.md).*

## Goal & hard constraints

- A **real native app** for **Android first**, **iPhone later** — installed and run on a phone, no browser, smooth animation.
- **All development happens through Claude on the user's phone.** Everything we build is plain text files Claude can read and edit; nothing requires the user to own or use a computer.
- **Everything used must be free of cost.** (See Costs below for the only unavoidable, external exceptions — none of which apply during development.)

## Glossary (terms used in this doc)

- **Native app** — a real installed app that runs directly on the phone hardware; fastest and smoothest, "real app" feel.
- **Engine** — the machinery under the hood that runs the clock, moves the workers, totals resources, and plays animations.
- **Sprite** — a small 2D image (a worker, a cart) drawn and animated on top of the map.
- **Build** — the step that turns our text files into the actual installable app (like turning a recipe into the finished dish).
- **Cloud build** — doing that build step on a rented internet computer, so the user needs no computer of their own — they just download the finished app file.
- **APK** — the Android app-install file. "Sideloading" means installing it directly on your own phone (no app store needed).
- **OTA / code push** — pushing a change into an already-installed app without reinstalling. (We are intentionally **not** using this — see Tradeoffs.)

## The stack (all free, open source)

- **Flutter** — Google's toolkit that turns one set of text files into a genuinely native app for **both Android and iPhone** (no separate rewrite). Free, open source.
- **Flame** — a 2D game engine that runs on top of Flutter; handles the **game loop** (ticking clock), **animated sprites**, the **map**, and hundreds of moving things at once. Free, open source.
- **Dart** — the programming language Flutter uses; one of the more readable ones. The user won't be reading much of it — Claude writes it and explains in plain English.
- **GitHub** — free online storage for our text files (the project's home).
- **GitHub Actions** — free **cloud build**: turns our text files into an installable APK over the internet, within generous free limits (effectively unlimited for a project like this). **Used instead of paid build services.**

## Why this fits the constraints

1. **It's a real app** — compiled native, no browser, smooth animation. What the user asked for.
2. **Everything is text files** — so Claude can write and edit all of it from the phone.
3. **Builds happen in the cloud (GitHub Actions)** — the user never needs a computer; they just get an APK to install.
4. **One codebase → Android now, iPhone later** — Flutter adds the iPhone target with no rewrite.

## The development & testing loop

1. Claude edits the text files (on the user's phone).
2. Changes are saved to GitHub.
3. **GitHub Actions** automatically does a free cloud build and produces an **APK**.
4. The user **downloads and installs the APK** on their phone and tests.
5. Repeat.

Each cycle is a few minutes (the cloud build time + install). This is the "install updates through an APK" loop the user already anticipated.

## Tradeoffs we accepted

- **No instant updates.** A paid tool (Shorebird) could push many changes straight into the installed app without reinstalling, but it costs money, so we **dropped it**. The cost: every change goes through a full build + APK install (a few minutes), rather than being instant.
- **iPhone is deferred and is the one eventual paid item** (see Costs). Android development and testing stay 100% free.

## Costs

**During all development and testing on the user's own Android phone: $0.** We build the APK with free tools and sideload it directly — no store account needed.

Unavoidable, external, optional costs (not caused by our tool choices, and none apply now):
- **Google Play developer account** — a **one-time $25 fee**, only if/when publishing to the Play Store. Not needed to build/test on your own phone.
- **Apple developer account** — **$99/year**, required by Apple to build/run *any* iOS app, even for testing. There is no free path to iPhone. Applies only if/when we do the iPhone port.

## Architecture shape (set by gameplay decisions so far)

- **Real-time simulation clock** that advances **only while the app is open**, with **pause + fast-forward** speeds. (Built as a steady "fixed-timestep" loop; fast-forward runs more ticks per second. Exact speed handling will be finalized when we design the engine.)
- Auto-pause when the app loses focus (e.g. a phone call), so no colony is lost.
- The heavy ticking/calculation runs **separately from the screens** so tapping buttons never stutters, even with a large map and many workers.
- **Mostly data screens** (panels, buttons, totals) built with Flutter's standard UI; the **map** is a Flame layer that is **static when viewed but redraws as things change**, with **animated sprites** (workers, carts, resource movement) on top.
- A **terrain-based travel-time calculator**: some terrain is faster to cross than others (RimWorld-style), used to make gathering slower the farther a resource is.

## Confirmed gameplay parameters (for engine sizing)

- **Map:** 512×512 grid of boxes (≈262,144 tiles). **Procedurally generated** (later; start with a fixed test map). Buildings occupy variable footprints (1 box up to several, e.g. 4×6).
- **Resources:** distributed as **deposit nodes** workers travel to; **infinite supply for v1**; running totals tracked and displayed intuitively.
- **Workers:** **individual, named**, with traits, lives, and friends/enemies — a **lighter** social model than RimWorld, to support colonies of **dozens to hundreds**. Workers **physically move** on the map.
- **Buildings:** some **auto-harvest**; some **speed up** the harvesting that workers are doing.

## Still open (to settle when we design the engine)

- Exact distance/pathfinding method across terrain (and whether it's measured node→building, building→storage, or both).
- How fast-forward is implemented (more ticks per second vs. larger time jumps).
- How "light" the worker social model is, concretely.
- Save-file format and structure.
