import 'package:flutter/material.dart';

/// The six v1 jobs (each maps 1:1 to a colonist skill).
enum Role { cook, builder, miner, logger, forager, laborer }

extension RoleInfo on Role {
  String get label => switch (this) {
        Role.cook => 'Cook',
        Role.builder => 'Builder',
        Role.miner => 'Miner',
        Role.logger => 'Logger',
        Role.forager => 'Forager',
        Role.laborer => 'Laborer',
      };
}

/// The six v1 buildings. Footprints are in grid tiles.
enum BuildingType { kitchen, sawmill, choppingBlock, woodHouse, stoneHouse, storage }

class BuildingDef {
  const BuildingDef(this.name, this.w, this.h, this.color, this.purpose);
  final String name;
  final int w;
  final int h;
  final Color color;
  final String purpose;
}

const Map<BuildingType, BuildingDef> kBuildings = {
  BuildingType.kitchen:
      BuildingDef('Kitchen', 2, 2, Color(0xFFE08A3C), 'Berries → Meals (Cook)'),
  BuildingType.sawmill:
      BuildingDef('Sawmill', 2, 3, Color(0xFF8A5A2B), 'Logs → Lumber (Laborer)'),
  BuildingType.choppingBlock: BuildingDef(
      'Chopping Block', 2, 2, Color(0xFFB88746), 'Logs → Firewood (Laborer)'),
  BuildingType.woodHouse: BuildingDef(
      'Wood House', 2, 2, Color(0xFFD9C152), 'Houses 4 · full heat cost'),
  BuildingType.stoneHouse: BuildingDef(
      'Stone House', 2, 2, Color(0xFF9AA0A6), 'Houses 4 · half heat cost'),
  BuildingType.storage: BuildingDef(
      'Storage Area', 3, 3, Color(0xFF4F8FD0), 'Stores goods · distance anchor'),
};

/// Natural resource deposits scattered on the map (infinite supply in v1).
enum NodeType { tree, stone, berry }

extension NodeInfo on NodeType {
  Color get color => switch (this) {
        NodeType.tree => const Color(0xFF2E7D32),
        NodeType.stone => const Color(0xFFB0B0B0),
        NodeType.berry => const Color(0xFFC2407A),
      };
  String get label => switch (this) {
        NodeType.tree => 'Tree',
        NodeType.stone => 'Stone',
        NodeType.berry => 'Berries',
      };
}
