import 'dart:ui';
import 'package:flame/components.dart';

/// The Stage-1 map: a single flat meadow rendered as one batched layer with a
/// light grid overlay. We deliberately do NOT create a component per tile
/// (512×512 = 262,144 tiles); this draws one rect plus the grid lines.
class MeadowComponent extends PositionComponent {
  MeadowComponent({required this.gridTiles, required this.tileSize})
      : super(position: Vector2.zero(), size: Vector2.all(gridTiles * tileSize));

  final int gridTiles;
  final double tileSize;

  final Paint _grass = Paint()..color = const Color(0xFF3E6B34);
  final Paint _grid = Paint()
    ..color = const Color(0x33223A18)
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.0;

  @override
  void render(Canvas canvas) {
    final extent = gridTiles * tileSize;
    canvas.drawRect(Rect.fromLTWH(0, 0, extent, extent), _grass);
    for (int i = 0; i <= gridTiles; i++) {
      final p = i * tileSize;
      canvas.drawLine(Offset(p, 0), Offset(p, extent), _grid);
      canvas.drawLine(Offset(0, p), Offset(extent, p), _grid);
    }
  }
}
