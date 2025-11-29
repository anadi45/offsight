import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/language_provider.dart';
import '../widgets/language_selector.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);

    void handleCameraPress() {
      if (languageProvider.hasSelectedLanguage) {
        context.go('/camera');
      } else {
        showDialog(
          context: context,
          builder: (context) => LanguageSelector(
            onLanguageSelected: (languageCode) {
              languageProvider.setSelectedLanguage(languageCode);
              Navigator.of(context).pop();
              context.go('/camera');
            },
          ),
        );
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Offsight'),
        actions: [
          IconButton(
            icon: const Icon(Icons.explore),
            onPressed: () => context.go('/explore'),
          ),
        ],
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: handleCameraPress,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text(
            'Camera Translation',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

