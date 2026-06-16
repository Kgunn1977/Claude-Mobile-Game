import 'package:flutter/material.dart';

/// Placeholder page to the right of the map, so paging is demonstrably working.
/// Real data screens (totals, rates, assignments) arrive in later stages.
class DataPage extends StatelessWidget {
  const DataPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF11160E),
      child: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Data\n\nColony readouts will live here.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white60, fontSize: 18, height: 1.5),
          ),
        ),
      ),
    );
  }
}
