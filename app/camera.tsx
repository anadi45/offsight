import { CameraView, useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LanguageSelector } from '@/components/language-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { extractTextFromImage } from '@/src/features/translation/utils/ocr';
import { translateText } from '@/src/features/translation/utils/translation';
import { getSelectedLanguage, SUPPORTED_LANGUAGES } from '@/src/utils/storage';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  async function loadSelectedLanguage() {
    const language = await getSelectedLanguage();
    setSelectedLanguage(language);
  }

  function getLanguageName(code: string | null): string {
    if (!code) return 'Not selected';
    const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return language?.name || code;
  }

  async function handleLanguageSelected(languageCode: string) {
    setSelectedLanguage(languageCode);
    // Language is already saved by LanguageSelector component
  }

  if (!permission) {
    // Camera permissions are still loading
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera permissions...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="Grant Permission" />
      </ThemedView>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function handleTakePhoto() {
    if (!cameraRef.current || !selectedLanguage) {
      return;
    }

    try {
      setIsProcessing(true);
      setTranslatedText(null);

      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      // Extract text from image using OCR
      const detectedText = await extractTextFromImage(photo.uri);
      
      // Translate the detected text
      const translation = await translateText(detectedText, selectedLanguage);
      
      setTranslatedText(translation);
      setShowResult(true);
    } catch (error) {
      console.error('Error processing photo:', error);
      // TODO: Show error message to user
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageSelector(true)}>
            <ThemedText style={styles.languageText} lightColor="white" darkColor="white">
              {getLanguageName(selectedLanguage)}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <ThemedText style={styles.text} lightColor="white" darkColor="white">
                Flip
              </ThemedText>
            </TouchableOpacity>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.closeButton}>
                <ThemedText style={styles.text} lightColor="white" darkColor="white">
                  Close
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={handleTakePhoto}
            disabled={isProcessing || !selectedLanguage}>
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onLanguageSelected={handleLanguageSelected}
      />
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResult(false)}>
        <ThemedView style={styles.resultModalOverlay}>
          <ThemedView style={styles.resultModalContent}>
            <View style={styles.resultHeader}>
              <ThemedText type="title" style={styles.resultTitle}>
                Translation
              </ThemedText>
              <TouchableOpacity onPress={() => setShowResult(false)} style={styles.closeResultButton}>
                <ThemedText style={styles.closeResultButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            {translatedText && (
              <ThemedText style={styles.resultText}>{translatedText}</ThemedText>
            )}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowResult(false)}>
              <ThemedText style={styles.dismissButtonText}>Dismiss</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  languageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeResultButton: {
    padding: 5,
  },
  closeResultButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
  },
  dismissButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

