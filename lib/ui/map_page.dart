import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import '../game/colony_game.dart';
import '../model/types.dart';
import '../state/colony_state.dart';

/// Map page: Flame canvas + day/time + speed + building placement.
/// Normal: drag = pan, pinch = zoom. While placing: one-finger drag/tap moves
/// the ghost, pinch still zooms, and Place/Cancel commit or abort.
class MapPage extends StatefulWidget {
  const MapPage({super.key, required this.game, required this.state});
  final ColonyGame game;
  final ColonyState state;

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  bool get _placing => widget.state.ghostType != null;
  static const double _t = ColonyGame.tileSize;

  void _startPlacing(BuildingType type) {
    // drop the ghost at the current view centre
    final c = widget.game.cameraCenterTile();
    final d = kBuildings[type]!;
    widget.state.setGhost(type, _clampX(c.$1 - d.w ~/ 2, d.w),
        _clampY(c.$2 - d.h ~/ 2, d.h));
    setState(() {});
  }

  int _clampX(int x, int w) => x.clamp(0, ColonyState.grid - w);
  int _clampY(int y, int h) => y.clamp(0, ColonyState.grid - h);

  void _moveGhost(Offset localPoint) {
    final type = widget.state.ghostType;
    if (type == null) return;
    final w = widget.game.screenToWorld(localPoint);
    final d = kBuildings[type]!;
    final gx = _clampX((w.x / _t).floor() - d.w ~/ 2, d.w);
    final gy = _clampY((w.y / _t).floor() - d.h ~/ 2, d.h);
    widget.state.setGhost(type, gx, gy);
  }

  void _confirm() {
    final type = widget.state.ghostType;
    if (type == null) return;
    final s = widget.state;
    if (s.place(type, s.ghostX, s.ghostY)) {
      s.clearGhost();
      setState(() {});
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text("Can't build there"),
          duration: Duration(milliseconds: 900)));
    }
  }

  void _cancel() {
    widget.state.clearGhost();
    setState(() {});
  }

  Future<void> _openBuildMenu() async {
    final pick = await showModalBottomSheet<BuildingType>(
      context: context,
      backgroundColor: const Color(0xFF1A2114),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
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
        ]),
      ),
    );
    if (pick != null) _startPlacing(pick);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onScaleStart: (_) => widget.game.onScaleStart(),
          onScaleUpdate: (d) {
            if (_placing) {
              if (d.pointerCount >= 2) {
                widget.game.onScaleUpdate(d.scale, Offset.zero); // zoom only
              } else {
                _moveGhost(d.localFocalPoint); // drag the ghost
              }
            } else {
              widget.game.onScaleUpdate(d.scale, d.focalPointDelta);
            }
          },
          onTapUp: (d) {
            if (_placing) _moveGhost(d.localPosition);
          },
          child: GameWidget(game: widget.game),
        ),

        // Day / time (24h)
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

        // Bottom controls
        SafeArea(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
              child: _placing ? _placingBar() : _normalBar(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _normalBar() => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
              onTap: _openBuildMenu, child: _panel(const Text('🔨 Build'))),
          _SpeedBar(game: widget.game),
        ],
      );

  Widget _placingBar() => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: _cancel,
            child: _panel(const Text('✕ Cancel',
                style: TextStyle(color: Color(0xFFE76A5A)))),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _confirm,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              decoration: BoxDecoration(
                  color: const Color(0xFF9ED35A),
                  borderRadius: BorderRadius.circular(10)),
              child: Text('✓ Place ${kBuildings[widget.state.ghostType!]!.name}',
                  style: const TextStyle(
                      color: Colors.black, fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      );
}

Widget _panel(Widget child) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
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
        return _panel(Row(mainAxisSize: MainAxisSize.min, children: [
          _btn('⏸', paused, () => game.setPaused(true)),
          _btn('1×', !paused && speed == 1, () => game.setSpeed(1)),
          _btn('2×', !paused && speed == 2, () => game.setSpeed(2)),
          _btn('5×', !paused && speed == 5, () => game.setSpeed(5)),
        ]));
      },
    );
  }

  Widget _btn(String label, bool active, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
              color: active ? const Color(0xFF9ED35A) : Colors.transparent,
              borderRadius: BorderRadius.circular(8)),
          child: Text(label,
              style: TextStyle(
                  color: active ? Colors.black : Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
        ),
      );
}
