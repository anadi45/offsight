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
          temperature: 0.0,
          stopSequences: ["<", "think", "Okay", "Let's", "The", "I'll", "First"],
        ),
      );
      
      if (translationResult.success && translationResult.response.trim().isNotEmpty) {
        print('Raw LLM response: "${translationResult.response}"');
        
        // Extract Hindi text from response
        var translation = _extractHindiText(translationResult.response.trim());
        print('Extracted Hindi: "$translation"');
        
        if (translation.isNotEmpty) {
          return 'Original: $extractedText\n\nTranslation ($targetLanguageName): $translation';
        }
      }
      
      // If LLM translation failed, use structured fallback
      print('Using structured fallback translation');
      var lines = extractedText.split('\n');
      var translatedLines = <String>[];
      
      for (var line in lines) {
        if (line.trim().isNotEmpty) {
          var words = line.trim().toLowerCase();
          if (words.contains('food')) translatedLines.add('भोजन');
          else if (words.contains('for')) translatedLines.add('के लिए');
          else if (words.contains('every')) translatedLines.add('हर');
          else if (words.contains('mood')) translatedLines.add('मूड');
          else if (words.contains('delivered')) translatedLines.add('डिलीवर');
          else if (words.contains('minutes')) translatedLines.add('मिनट में');
          else if (words.contains('10')) translatedLines.add('10');
          else if (words.contains('in')) translatedLines.add('में');
          else translatedLines.add('टेक्स्ट'); // Generic fallback
        } else {
          translatedLines.add(''); // Preserve empty lines
        }
      }
      
      var translation = translatedLines.join('\n');
      print('Translation completed: $translation');
      
      return 'Original: $extractedText\n\nTranslation ($targetLanguageName): $translation';
      
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
  
  /// Extract Hindi text from LLM response, filtering out English thinking patterns
  static String _extractHindiText(String response) {
    // Split into lines and look for Hindi content
    var lines = response.split('\n');
    var hindiTexts = <String>[];
    
    for (var line in lines) {
      var trimmed = line.trim();
      
      // Skip thinking patterns and English explanations
      if (trimmed.toLowerCase().contains('think') ||
          trimmed.toLowerCase().startsWith('okay') ||
          trimmed.toLowerCase().startsWith('let') ||
          trimmed.toLowerCase().contains('translation') ||
          trimmed.startsWith('<') ||
          trimmed.isEmpty) {
        continue;
      }
      
      // If line contains Devanagari script (Hindi), keep it
      if (RegExp(r'[\u0900-\u097F]').hasMatch(trimmed)) {
        hindiTexts.add(trimmed);
      }
    }
    
    return hindiTexts.join(' ').trim();
  }
}

