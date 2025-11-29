import { CactusLM, type Message } from 'cactus-react-native';

// Language code to language name mapping for translation prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
};

let cactusLMInstance: CactusLM | null = null;

/**
 * Get or create a CactusLM instance with vision model
 */
async function getCactusLM(): Promise<CactusLM> {
  if (!cactusLMInstance) {
    // Use vision-capable model
    cactusLMInstance = new CactusLM({ model: 'lfm2-vl-450m' });
    
    // Download the model if not already downloaded
    try {
      await cactusLMInstance.download({
        onProgress: (progress) => {
          console.log(`Model download progress: ${Math.round(progress * 100)}%`);
        },
      });
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
    
    // Initialize the model
    try {
      await cactusLMInstance.init();
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    }
  }
  
  return cactusLMInstance;
}

/**
 * Translate text from an image using CactusLM vision model
 * This function extracts text from the image and translates it to the target language
 * @param imagePath - Path to the image file
 * @param targetLanguage - Target language code (e.g., 'es', 'fr')
 * @returns Promise with translated text
 */
export async function translateImageText(
  imagePath: string,
  targetLanguage: string
): Promise<string> {
  try {
    const cactusLM = await getCactusLM();
    const targetLanguageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    
    // Create a prompt that asks the model to extract text and translate it
    const messages: Message[] = [
      {
        role: 'user',
        content: `Extract all text from this image and translate it to ${targetLanguageName}. Only return the translated text, without any additional explanation or formatting.`,
        images: [imagePath],
      },
    ];
    
    const result = await cactusLM.complete({ messages });
    
    if (!result.success) {
      throw new Error('Translation failed');
    }
    
    return result.response.trim();
  } catch (error) {
    console.error('Error translating image text:', error);
    throw error;
  }
}


