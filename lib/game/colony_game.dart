import 'package:flame/components.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import '../state/colony_state.dart';
import 'entities_layer.dart';
import 'meadow.dart';

/// Stage 1 game: a pan/zoomable meadow and a simulation clock.
/// The clock advances only while the app is open and not paused; speed and
/// day are exposed via ValueNotifiers so lightweight Flutter overlays can show
/// them without rebuilding the whole tree.
class ColonyGame extends FlameGame {
  ColonyGame(this.state);

  final ColonyState state;

  static const int gridTiles = 512;
  static const double tileSize = 16.0;
  static const double secondsPerDay = 600.0; // 1 in-game day = 10 real min at 1x

  static const double minZoom = 0.05;
  static const double maxZoom = 4.0;

  // --- simulation clock ---
  double _elapsedDays = 0;
  double _speed = 1.0; // 1, 2, or 5
  bool _paused = false;

  /// Elapsed days (fractional). Overlays listen to this for the day readout.
  final ValueNotifier<double> clock = ValueNotifier<double>(0);
  final ValueNotifier<double> speedNotifier = ValueNotifier<double>(1.0);
  final ValueNotifier<bool> pausedNotifier = ValueNotifier<bool>(false);

  double _zoomAtScaleStart = 1.0;

  double get fieldSize => gridTiles * tileSize;

  @override
  Color backgroundColor() => const Color(0xFF0E120D);

  @override
  Future<void> onLoad() async {
    world.add(MeadowComponent(gridTiles: gridTiles, tileSize: tileSize));
    world.add(EntitiesLayer(state));
    camera.viewfinder.zoom = 0.5;
    camera.viewfinder.position = Vector2(fieldSize / 2, fieldSize / 2);
  }

  /// Screen point (from a Flutter gesture) → world position, for tap-to-place.
  Vector2 screenToWorld(Offset p) =>
      camera.globalToLocal(Vector2(p.dx, p.dy));

  @override
  void update(double dt) {
    super.update(dt);
    if (!_paused) {
      _elapsedDays += dt * _speed / secondsPerDay;
      clock.value = _elapsedDays;
    }
  }

  // --- clock controls ---
  void setSpeed(double s) {
    _speed = s;
    _paused = false;
    speedNotifier.value = s;
    pausedNotifier.value = false;
  }

  void togglePause() => setPaused(!_paused);

  void setPaused(bool p) {
    _paused = p;
    pausedNotifier.value = p;
  }

  // --- camera gestures (driven by a Flutter GestureDetector on the map page) ---
  void onScaleStart() => _zoomAtScaleStart = camera.viewfinder.zoom;

  void onScaleUpdate(double scale, Offset focalPointDelta) {
    final z = (_zoomAtScaleStart * scale).clamp(minZoom, maxZoom);
    camera.viewfinder.zoom = z;
    // Screen-space drag → world-space pan (divide by zoom). Move opposite the
    // drag so content follows the finger.
    camera.viewfinder.position +=
        Vector2(-focalPointDelta.dx, -focalPointDelta.dy) / z;
  }
}
