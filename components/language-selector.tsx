import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SUPPORTED_LANGUAGES, getSelectedLanguage, saveSelectedLanguage, type Language } from '@/src/utils/storage';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelected: (languageCode: string) => void;
}

export function LanguageSelector({ visible, onClose, onLanguageSelected }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadSavedLanguage();
    }
  }, [visible]);

  async function loadSavedLanguage() {
    try {
      const savedLanguage = await getSelectedLanguage();
      setSelectedLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageSelect(language: Language) {
    setSelectedLanguage(language.code);
    await saveSelectedLanguage(language.code);
    onLanguageSelected(language.code);
    onClose();
  }

  function renderLanguageItem({ item }: { item: Language }) {
    const isSelected = selectedLanguage === item.code;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageSelect(item)}>
        <ThemedText style={styles.languageName}>{item.name}</ThemedText>
        {isSelected && (
          <ThemedText style={styles.checkmark}>✓</ThemedText>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <ThemedView style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Select Translation Language
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={SUPPORTED_LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
          )}
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedLanguageItem: {
    backgroundColor: '#007AFF',
  },
  languageName: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

