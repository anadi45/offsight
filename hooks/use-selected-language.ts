import { getSelectedLanguage, saveSelectedLanguage } from '@/src/utils/storage';
import { useEffect, useState } from 'react';

export function useSelectedLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    try {
      const language = await getSelectedLanguage();
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Error loading selected language:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateLanguage(languageCode: string) {
    try {
      await saveSelectedLanguage(languageCode);
      setSelectedLanguage(languageCode);
    } catch (error) {
      console.error('Error updating selected language:', error);
    }
  }

  return {
    selectedLanguage,
    loading,
    updateLanguage,
    refreshLanguage: loadLanguage,
  };
}

