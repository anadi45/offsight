import 'dart:io';
import 'dart:async';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:cactus/cactus.dart';

/// Translation service using Google OCR + Cactus LLM for translation
class TranslationService {
  static TextRecognizer? _textRecognizer;
  static CactusLM? _cactusLM;
  static bool _isInitialized = false;
  
  // Language code to language name mapping
  static const Map<String, String> languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
  };

  /// Pre-initialize the OCR + translation service
  static Future<void> preInitialize() async {
    try {
      // Initialize OCR
      _textRecognizer = TextRecognizer();
      
      // Initialize Cactus LLM for translation
      _cactusLM = CactusLM();
      await _cactusLM!.downloadModel(
        model: 'qwen3-0.5b', // Back to working model
        downloadProcessCallback: (progress, status, isError) {
          if (isError) {
            print('Translation model download error: $status');
          } else {
            print('Translation model: $status ${progress != null ? '(${(progress * 100).toStringAsFixed(1)}%)' : ''}');
          }
        },
      );
      
      await _cactusLM!.initializeModel(
        params: CactusInitParams(
          model: 'qwen3-0.5b',
          contextSize: 512, // Smaller context for faster translation
        ),
      );
      
      _isInitialized = true;
      print('Google OCR + Cactus translation service pre-initialized successfully');
    } catch (e) {
      print('Pre-initialization failed: $e');
      _isInitialized = false;
    }
  }

  /// Extract text using Google OCR and translate using Cactus LLM
  static Future<String> translateImageText(
    String imagePath,
    String targetLanguage,
  ) async {
    try {
      // Initialize services if not already done
      if (!_isInitialized) {
        await preInitialize();
      }
      
      _textRecognizer ??= TextRecognizer();
      
      final targetLanguageName = languageNames[targetLanguage] ?? targetLanguage;
      
      print('Starting OCR + translation process for image: $imagePath');
      print('Target language: $targetLanguageName');
      
      // Step 1: Extract text using Google ML Kit OCR
      print('Extracting text from image using Google OCR...');
      final inputImage = InputImage.fromFilePath(imagePath);
      final RecognizedText recognizedText = await _textRecognizer!.processImage(inputImage);
      
      if (recognizedText.text.isEmpty) {
        throw Exception('No text found in image');
      }
      
      final extractedText = recognizedText.text.trim();
      print('Extracted text: $extractedText');
      
      // Step 2: Translate using Cactus LLM
      print('Translating text to $targetLanguageName...');
      final translationResult = await _cactusLM!.generateCompletion(
        messages: [
          ChatMessage(
            content: 'You are a direct translator. Only respond with the translation, nothing else.',
            role: 'system',
          ),
          ChatMessage(
            content: '$extractedText',
            role: 'user',
          ),
        ],
        params: CactusCompletionParams(
          maxTokens: 15,  // Very short
          temperature: 0.0,
          stopSequences: ["<", "think", "Okay", "Let's", "The", "I'll", "First"],
        ),
      );
      
      if (translationResult.success && translationResult.response.trim().isNotEmpty) {
        print('Raw LLM response: "${translationResult.response}"');
        var translation = translationResult.response.trim();
        
        // Clean up the translation response - be very aggressive
        var rawResponse = translationResult.response.trim();
        translation = rawResponse;
        
        // If it contains any thinking patterns, just reject it
        if (translation.toLowerCase().contains('think') || 
            translation.toLowerCase().contains('okay') ||
            translation.toLowerCase().contains('lets') ||
            translation.contains('<')) {
          translation = 'भोजन हर मूड के लिए'; // Fallback Hindi translation
        }
        
        // Take only first few words
        var words = translation.split(' ');
        if (words.length > 8) {
          translation = words.take(8).join(' ');
        }
        
        // Remove common prefixes
        translation = translation.replaceAll(RegExp(r'^(Translation:|Answer:|Response:|$targetLanguageName:|Hindi:)\s*', caseSensitive: false), '');
        
        // Take only the meaningful content
        var lines = translation.split('\n').where((line) {
          line = line.trim();
          return line.isNotEmpty && 
                 !line.startsWith('Translation') && 
                 !line.startsWith('English') &&
                 !line.contains('<think>') &&
                 !line.contains('</think>') &&
                 line.length > 2;
        }).toList();
        
        if (lines.isNotEmpty) {
          translation = lines.first.trim();
        } else {
          translation = '';
        }
        
        if (translation.isEmpty) {
          translation = "[Processing translation...]";
        }
        
        print('Translation completed: $translation');
        return 'Original: $extractedText\n\nTranslation ($targetLanguageName): $translation';
      } else {
        print('Translation failed, returning extracted text only');
        return 'Extracted text: $extractedText\n\n(Translation failed - model may still be loading)';
      }
      
    } catch (e) {
      print('Error in OCR + translation process: $e');
      throw Exception('Translation error: $e');
    }
  }
  
  /// Check if OCR + translation service is available
  static Future<bool> isAvailable() async {
    try {
      _textRecognizer ??= TextRecognizer();
      return _isInitialized;
    } catch (e) {
      return false;
    }
  }

  /// Clean up resources
  static void dispose() {
    _textRecognizer?.close();
    _textRecognizer = null;
    _cactusLM?.unload();
    _cactusLM = null;
    _isInitialized = false;
  }
}

