import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../model/types.dart';
import '../state/colony_state.dart';
import '../version.dart';

/// Data screen: Banished-style job assignment (headcount per role) plus a
/// colonist roster. Rebuilds whenever the colony state changes.
class DataPage extends StatelessWidget {
  const DataPage({super.key, required this.state});

  final ColonyState state;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF11160E),
      child: SafeArea(
        child: AnimatedBuilder(
          animation: state,
          builder: (context, _) {
            return ListView(
              // top padding clears the floating Map/Data tabs
              padding: const EdgeInsets.fromLTRB(16, 64, 16, 40),
              children: [
                _header('Jobs'),
                Text('Population ${state.population}   ·   Idle ${state.idle}',
                    style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 10),
                for (final r in Role.values) _jobRow(r),
                const SizedBox(height: 24),
                _header('Colonists'),
                for (final c in state.colonists) _colonistRow(c),
                const SizedBox(height: 24),
                _header('Buildings'),
                Text(
                  state.buildings.isEmpty
                      ? 'None yet — tap “Build” on the map.'
                      : state.buildings
                          .map((b) => kBuildings[b.type]!.name)
                          .join(', '),
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 24),
                _header('App'),
                Text('Version $kAppVersion',
                    style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => launchUrl(Uri.parse(kReleasesUrl),
                      mode: LaunchMode.externalApplication),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                    decoration: BoxDecoration(
                        color: const Color(0xFF1D2618),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF9ED35A))),
                    child: const Text('⬇  Get the latest build',
                        style: TextStyle(
                            color: Color(0xFF9ED35A),
                            fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                    'Opens the Releases page — download & install the newest APK.',
                    style: TextStyle(color: Colors.white38, fontSize: 12)),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _header(String t) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(t.toUpperCase(),
            style: const TextStyle(
                color: Color(0xFF9ED35A),
                fontSize: 13,
                letterSpacing: 1.5,
                fontWeight: FontWeight.w700)),
      );

  Widget _jobRow(Role r) {
    final count = state.jobCounts[r]!;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Expanded(
              child: Text(r.label,
                  style: const TextStyle(color: Colors.white, fontSize: 16))),
          _step(Icons.remove, () => state.setJobCount(r, count - 1)),
          SizedBox(
              width: 34,
              child: Text('$count',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w700))),
          _step(Icons.add, () => state.setJobCount(r, count + 1)),
        ],
      ),
    );
  }

  Widget _step(IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 2),
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
              color: const Color(0xFF1D2618),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white24)),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      );

  Widget _colonistRow(Colonist c) {
    // show the colonist's best skill as a hint
    final best = Role.values
        .reduce((a, b) => (c.skills[a]! >= c.skills[b]!) ? a : b);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
              child: Text(c.name,
                  style: const TextStyle(color: Colors.white, fontSize: 15))),
          Text(c.job?.label ?? 'idle',
              style: TextStyle(
                  color: c.job == null ? Colors.white38 : const Color(0xFF9ED35A),
                  fontSize: 13)),
          const SizedBox(width: 10),
          Text('best: ${best.label} ${c.skills[best]}',
              style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }
}
