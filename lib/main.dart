import 'package:flutter/material.dart';
import 'game/colony_game.dart';
import 'state/colony_state.dart';
import 'ui/map_page.dart';
import 'ui/data_page.dart';

void main() => runApp(const ColonyApp());

class ColonyApp extends StatelessWidget {
  const ColonyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Colony',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true),
      home: const RootShell(),
    );
  }
}

/// Hosts the single shared game instance, the swipe-paged UI (Map | Data),
/// and lifecycle handling that auto-pauses the sim when the app loses focus.
class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> with WidgetsBindingObserver {
  late final ColonyState _state = ColonyState();
  late final ColonyGame _game = ColonyGame(_state);
  final PageController _pages = PageController();
  final ValueNotifier<int> _page = ValueNotifier<int>(0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pages.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Auto-pause whenever we're not the foreground app, so nothing runs in
    // the background and no colony is lost to a phone call.
    if (state != AppLifecycleState.resumed) _game.setPaused(true);
  }

  void _goTo(int i) {
    _pages.animateToPage(i,
        duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView(
            controller: _pages,
            onPageChanged: (i) => _page.value = i,
            children: [
              MapPage(game: _game, state: _state),
              DataPage(state: _state),
            ],
          ),
          // Reliable page tabs (top-right) — paging also works by swiping the
          // Data page; tabs guarantee navigation even while the map eats drags.
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: ValueListenableBuilder<int>(
                  valueListenable: _page,
                  builder: (_, page, __) => _Tabs(current: page, onTap: _goTo),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Tabs extends StatelessWidget {
  const _Tabs({required this.current, required this.onTap});
  final int current;
  final void Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.55),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white24),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _tab('Map', 0),
          _tab('Data', 1),
        ],
      ),
    );
  }

  Widget _tab(String label, int i) => GestureDetector(
        onTap: () => onTap(i),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: current == i ? const Color(0xFF9ED35A) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: current == i ? Colors.black : Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
}
