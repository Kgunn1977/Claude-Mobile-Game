import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../model/types.dart';
import '../state/colony_state.dart';
import 'colony_game.dart';

/// Draws resource nodes and placed buildings in world space, on top of the
/// meadow. Reads straight from ColonyState every frame, so placements appear
/// immediately. (A handful of shapes — cheap to redraw.)
class EntitiesLayer extends Component {
  EntitiesLayer(this.state) {
    priority = 1; // render above the meadow background
  }

  final ColonyState state;

  final Paint _stroke = Paint()
    ..color = Colors.black54
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.5;

  @override
  void render(Canvas canvas) {
    const t = ColonyGame.tileSize;

    for (final n in state.nodes) {
      canvas.drawCircle(
        Offset(n.gx * t + t / 2, n.gy * t + t / 2),
        t * 0.45,
        Paint()..color = n.type.color,
      );
    }

    for (final b in state.buildings) {
      final d = kBuildings[b.type]!;
      final rect = Rect.fromLTWH(b.gx * t, b.gy * t, d.w * t, d.h * t);
      canvas.drawRect(rect, Paint()..color = d.color);
      canvas.drawRect(rect, _stroke);
    }

    // placement ghost (green = valid, red = blocked)
    final g = state.ghostType;
    if (g != null) {
      final d = kBuildings[g]!;
      final rect = Rect.fromLTWH(
          state.ghostX * t, state.ghostY * t, d.w * t, d.h * t);
      final ok = state.canPlace(g, state.ghostX, state.ghostY);
      canvas.drawRect(
          rect, Paint()..color = (ok ? Colors.green : Colors.red).withOpacity(0.45));
      canvas.drawRect(
          rect,
          Paint()
            ..color = Colors.white
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.0);
    }
  }
}
