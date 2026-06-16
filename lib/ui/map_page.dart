import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import '../game/colony_game.dart';

/// The map page: the Flame canvas plus a day readout and speed controls
/// overlaid on top. Pan = one-finger drag, zoom = pinch (handled by the
/// GestureDetector forwarding to the game's camera).
class MapPage extends StatelessWidget {
  const MapPage({super.key, required this.game});

  final ColonyGame game;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onScaleStart: (_) => game.onScaleStart(),
          onScaleUpdate: (d) => game.onScaleUpdate(d.scale, d.focalPointDelta),
          child: GameWidget(game: game),
        ),
        // Day / time readout (top-left)
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: ValueListenableBuilder<double>(
              valueListenable: game.clock,
              builder: (_, days, __) {
                final day = days.floor() + 1;
                final pct = ((days - days.floor()) * 100).floor();
                return _Panel(child: Text('Day $day   ·   $pct%'));
              },
            ),
          ),
        ),
        // Speed controls (bottom-center)
        SafeArea(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: _SpeedBar(game: game),
            ),
          ),
        ),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.55),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white24),
        ),
        child: DefaultTextStyle(
          style: const TextStyle(
              color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
          child: child,
        ),
      );
}

class _SpeedBar extends StatelessWidget {
  const _SpeedBar({required this.game});
  final ColonyGame game;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([game.pausedNotifier, game.speedNotifier]),
      builder: (context, _) {
        final paused = game.pausedNotifier.value;
        final speed = game.speedNotifier.value;
        return _Panel(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _btn('⏸', paused, () => game.setPaused(true)),
              _btn('1×', !paused && speed == 1, () => game.setSpeed(1)),
              _btn('2×', !paused && speed == 2, () => game.setSpeed(2)),
              _btn('5×', !paused && speed == 5, () => game.setSpeed(5)),
            ],
          ),
        );
      },
    );
  }

  Widget _btn(String label, bool active, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: active ? const Color(0xFF9ED35A) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: active ? Colors.black : Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
}
