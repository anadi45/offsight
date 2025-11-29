/**
 * Placeholder OCR function that extracts text from an image
 * For now, returns hardcoded text
 * @param imageUri - URI of the captured image
 * @returns Promise with detected text
 */
export async function extractTextFromImage(imageUri: string): Promise<string> {
  // TODO: Implement actual OCR using a library like react-native-image-picker + ML Kit or similar
  // For now, return hardcoded text
  return 'Hello World\nThis is a sample text\nDetected from image';
}

