import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import '../game/colony_game.dart';
import '../model/types.dart';
import '../state/colony_state.dart';

/// The map: Flame canvas + day/time readout + speed controls + a build palette.
/// Drag = pan, pinch = zoom; in build mode, a tap places the selected building.
class MapPage extends StatefulWidget {
  const MapPage({super.key, required this.game, required this.state});

  final ColonyGame game;
  final ColonyState state;

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  BuildingType? _placing;

  void _onTapUp(TapUpDetails d) {
    if (_placing == null) return;
    final w = widget.game.screenToWorld(d.localPosition);
    final gx = (w.x / ColonyGame.tileSize).floor();
    final gy = (w.y / ColonyGame.tileSize).floor();
    if (widget.state.place(_placing!, gx, gy)) {
      setState(() => _placing = null);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text("Can't build there"),
            duration: Duration(milliseconds: 900)),
      );
    }
  }

  Future<void> _openBuildMenu() async {
    final pick = await showModalBottomSheet<BuildingType>(
      context: context,
      backgroundColor: const Color(0xFF1A2114),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(14),
              child: Text('Build',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700)),
            ),
            for (final t in BuildingType.values)
              ListTile(
                leading: Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                        color: kBuildings[t]!.color,
                        borderRadius: BorderRadius.circular(5))),
                title: Text(kBuildings[t]!.name,
                    style: const TextStyle(color: Colors.white)),
                subtitle: Text(
                    '${kBuildings[t]!.w}×${kBuildings[t]!.h}  ·  ${kBuildings[t]!.purpose}',
                    style: const TextStyle(color: Colors.white54, fontSize: 12)),
                onTap: () => Navigator.pop(context, t),
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (pick != null) setState(() => _placing = pick);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onScaleStart: (_) => widget.game.onScaleStart(),
          onScaleUpdate: (d) =>
              widget.game.onScaleUpdate(d.scale, d.focalPointDelta),
          onTapUp: _onTapUp,
          child: GameWidget(game: widget.game),
        ),

        // Day / time readout (24h clock)
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: ValueListenableBuilder<double>(
              valueListenable: widget.game.clock,
              builder: (_, days, __) {
                final day = days.floor() + 1;
                final mins = ((days - days.floor()) * 1440).floor();
                final hh = (mins ~/ 60).toString().padLeft(2, '0');
                final mm = (mins % 60).toString().padLeft(2, '0');
                return _panel(Text('Day $day   ·   $hh:$mm'));
              },
            ),
          ),
        ),

        // Placement banner (top-center) while building
        if (_placing != null)
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Padding(
                padding: const EdgeInsets.only(top: 10),
                child: _panel(Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Tap a tile to place ${kBuildings[_placing!]!.name}'),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: () => setState(() => _placing = null),
                      child: const Text('Cancel',
                          style: TextStyle(
                              color: Color(0xFFE76A5A),
                              fontWeight: FontWeight.w700)),
                    ),
                  ],
                )),
              ),
            ),
          ),

        // Build button (bottom-left)
        SafeArea(
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Padding(
              padding: const EdgeInsets.only(left: 12, bottom: 16),
              child: GestureDetector(
                onTap: _openBuildMenu,
                child: _panel(const Text('🔨 Build')),
              ),
            ),
          ),
        ),

        // Speed controls (bottom-center)
        SafeArea(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _SpeedBar(game: widget.game),
            ),
          ),
        ),
      ],
    );
  }
}

Widget _panel(Widget child) => Container(
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
        return _panel(Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _btn('⏸', paused, () => game.setPaused(true)),
            _btn('1×', !paused && speed == 1, () => game.setSpeed(1)),
            _btn('2×', !paused && speed == 2, () => game.setSpeed(2)),
            _btn('5×', !paused && speed == 5, () => game.setSpeed(5)),
          ],
        ));
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
          child: Text(label,
              style: TextStyle(
                  color: active ? Colors.black : Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
        ),
      );
}
