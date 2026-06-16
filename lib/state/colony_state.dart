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

  // pending placement "ghost" the player drags before committing
  BuildingType? ghostType;
  int ghostX = 0, ghostY = 0;

  void setGhost(BuildingType t, int x, int y) {
    ghostType = t;
    ghostX = x;
    ghostY = y;
    notifyListeners();
  }

  void clearGhost() {
    ghostType = null;
    notifyListeners();
  }

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
    // Expand the headcounts into individual job slots.
    final slots = <Role>[];
    for (final r in Role.values) {
      for (int i = 0; i < jobCounts[r]!; i++) {
        slots.add(r);
      }
    }
    final p = colonists.length, s = slots.length;
    if (p == 0 || s == 0) return;

    // Each colonist's "best" role (their top skill) — used to prefer specialists.
    final bestRole = <int, Role>{};
    for (int i = 0; i < p; i++) {
      final sk = colonists[i].skills;
      bestRole[i] =
          Role.values.reduce((a, b) => (sk[a] ?? 0) >= (sk[b] ?? 0) ? a : b);
    }
    const specBonus = 4; // a job goes to whoever it's the *best* fit for

    // Optimal assignment maximising (skill + specialisation bonus) across all
    // roles at once, via the Hungarian algorithm. Square p×p cost matrix: real
    // slots in the first `s` columns, the rest are "idle". Minimise cost.
    final n = p;
    final cost = List.generate(
      n,
      (i) => List.generate(n, (j) {
        if (j >= s) return 20; // idle column
        final r = slots[j];
        final value =
            (colonists[i].skills[r] ?? 0) + (bestRole[i] == r ? specBonus : 0);
        return 20 - value;
      }),
    );
    final rowToCol = _hungarian(cost);
    for (int i = 0; i < p; i++) {
      final j = rowToCol[i];
      if (j >= 0 && j < s) colonists[i].job = slots[j];
    }
  }

  /// Classic O(n³) Hungarian assignment (minimisation). Returns, for each row
  /// (colonist), the column it's assigned to.
  static List<int> _hungarian(List<List<int>> a) {
    final n = a.length;
    const inf = 1 << 30;
    final u = List.filled(n + 1, 0);
    final v = List.filled(n + 1, 0);
    final pcol = List.filled(n + 1, 0); // row assigned to each column
    final way = List.filled(n + 1, 0);
    for (int i = 1; i <= n; i++) {
      pcol[0] = i;
      int j0 = 0;
      final minv = List.filled(n + 1, inf);
      final used = List.filled(n + 1, false);
      do {
        used[j0] = true;
        final i0 = pcol[j0];
        int delta = inf, j1 = -1;
        for (int j = 1; j <= n; j++) {
          if (used[j]) continue;
          final cur = a[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
        for (int j = 0; j <= n; j++) {
          if (used[j]) {
            u[pcol[j]] += delta;
            v[j] -= delta;
          } else {
            minv[j] -= delta;
          }
        }
        j0 = j1;
      } while (pcol[j0] != 0);
      do {
        final j1 = way[j0];
        pcol[j0] = pcol[j1];
        j0 = j1;
      } while (j0 != 0);
    }
    final rowToCol = List.filled(n, -1);
    for (int j = 1; j <= n; j++) {
      if (pcol[j] >= 1) rowToCol[pcol[j] - 1] = j - 1;
    }
    return rowToCol;
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
