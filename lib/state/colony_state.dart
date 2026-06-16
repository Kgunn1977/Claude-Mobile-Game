import 'dart:math';
import 'package:flutter/foundation.dart';
import '../model/types.dart';

class Colonist {
  Colonist(this.name, this.skills, {this.job});
  final String name;
  final Map<Role, int> skills; // 0..10 per role
  Role? job;
}

class PlacedBuilding {
  PlacedBuilding(this.type, this.gx, this.gy);
  final BuildingType type;
  final int gx, gy; // top-left tile of the footprint
}

class ResourceNode {
  ResourceNode(this.type, this.gx, this.gy);
  final NodeType type;
  final int gx, gy;
}

/// The whole colony's data, kept separate from rendering and UI. The Flame game
/// reads it to draw; the data screens read/write it. Notifies listeners on change.
class ColonyState extends ChangeNotifier {
  static const int grid = 512;

  final List<Colonist> colonists = [];
  final List<PlacedBuilding> buildings = [];
  final List<ResourceNode> nodes = [];
  final Map<Role, int> jobCounts = {for (final r in Role.values) r: 0};

  ColonyState() {
    _seed();
  }

  int get population => colonists.length;
  int get assignedTotal => jobCounts.values.fold(0, (a, b) => a + b);
  int get idle => population - assignedTotal;

  // --- jobs (Banished-style headcount per role; game auto-assigns who) ---
  void setJobCount(Role r, int n) {
    if (n < 0) n = 0;
    final others = assignedTotal - jobCounts[r]!;
    if (others + n > population) n = population - others; // never over-assign
    jobCounts[r] = n;
    _autoAssign();
    notifyListeners();
  }

  void _autoAssign() {
    for (final c in colonists) {
      c.job = null;
    }
    final pool = List<Colonist>.from(colonists);
    for (final r in Role.values) {
      var need = jobCounts[r]!;
      // best-skilled free colonists fill each role first
      pool.sort((a, b) => (b.skills[r] ?? 0).compareTo(a.skills[r] ?? 0));
      for (final c in pool) {
        if (need <= 0) break;
        if (c.job == null) {
          c.job = r;
          need--;
        }
      }
    }
  }

  // --- building placement ---
  bool canPlace(BuildingType t, int gx, int gy) {
    final d = kBuildings[t]!;
    if (gx < 0 || gy < 0 || gx + d.w > grid || gy + d.h > grid) return false;
    for (final b in buildings) {
      final bd = kBuildings[b.type]!;
      final overlap = gx < b.gx + bd.w &&
          gx + d.w > b.gx &&
          gy < b.gy + bd.h &&
          gy + d.h > b.gy;
      if (overlap) return false;
    }
    return true;
  }

  bool place(BuildingType t, int gx, int gy) {
    if (!canPlace(t, gx, gy)) return false;
    buildings.add(PlacedBuilding(t, gx, gy));
    notifyListeners();
    return true;
  }

  // --- starting colony ---
  void _seed() {
    final rng = Random(7);
    const names = ['Mara', 'Tomas', 'Devi', 'Cole', 'Ines', 'Silas'];
    for (final name in names) {
      final skills = {for (final r in Role.values) r: rng.nextInt(8)};
      colonists.add(Colonist(name, skills));
    }
    // Scatter resource nodes around the map centre so they're easy to find.
    void scatter(NodeType type, int count) {
      for (int i = 0; i < count; i++) {
        nodes.add(ResourceNode(type, 200 + rng.nextInt(112), 200 + rng.nextInt(112)));
      }
    }
    scatter(NodeType.tree, 24);
    scatter(NodeType.stone, 12);
    scatter(NodeType.berry, 16);
  }
}
