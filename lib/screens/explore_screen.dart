import 'package:flutter/material.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Explore',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'This app includes example code to help you get started.',
            ),
            const SizedBox(height: 30),
            _CollapsibleSection(
              title: 'Camera Translation',
              child: const Text(
                'Use the camera to capture text from images and translate it to your selected language.',
              ),
            ),
            _CollapsibleSection(
              title: 'Language Selection',
              child: const Text(
                'Choose from 13 supported languages for translation.',
              ),
            ),
            _CollapsibleSection(
              title: 'Features',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• Real-time camera preview'),
                  const Text('• Text extraction from images'),
                  const Text('• Multi-language translation'),
                  const Text('• Persistent language preferences'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CollapsibleSection extends StatefulWidget {
  final String title;
  final Widget child;

  const _CollapsibleSection({
    required this.title,
    required this.child,
  });

  @override
  State<_CollapsibleSection> createState() => _CollapsibleSectionState();
}

class _CollapsibleSectionState extends State<_CollapsibleSection> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Column(
        children: [
          ListTile(
            title: Text(widget.title),
            trailing: Icon(
              _isExpanded ? Icons.expand_less : Icons.expand_more,
            ),
            onTap: () {
              setState(() {
                _isExpanded = !_isExpanded;
              });
            },
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: widget.child,
            ),
        ],
      ),
    );
  }
}

