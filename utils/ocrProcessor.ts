/**
 * OCR Processor - Working Version
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

interface OCRResponse {
  text: string;
  confidence: number;
  processingTime: number;
  error?: string;
}

export const initializeOCR = async (): Promise<boolean> => {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Supabase not configured');
      return false;
    }
    console.log('✅ OCR initialized');
    return true;
  } catch (error) {
    console.error('❌ OCR init error:', error);
    return false;
  }
};

export const extractTextFromImage = async (imageUri: string): Promise<string> => {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    console.log('🔍 Starting OCR...');

    // Compress image - Ultra aggressive
    console.log('🗜️ Compressing...');
    const compressed = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 600 } }],
      { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
    );

    const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const sizeKB = Math.round(base64.length * 0.75 / 1024);
    console.log(`📦 Size: ${sizeKB}KB`);

    // If still too large, compress more
    if (sizeKB > 850) {
      console.warn('⚠️ Still large, compressing more...');
      const tiny = await ImageManipulator.manipulateAsync(
        compressed.uri,
        [{ resize: { width: 450 } }],
        { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }
      );
      const tinyBase64 = await FileSystem.readAsStringAsync(tiny.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return await sendToOCR(tinyBase64);
    }

    return await sendToOCR(base64);
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw error;
  }
};

async function sendToOCR(base64: string): Promise<string> {
  console.log('📤 Sending to OCR...');
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/ocr-processor`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: `data:image/jpeg;base64,${base64}` }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OCR failed: ${response.status} - ${error}`);
  }

  const data: OCRResponse = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  console.log(`✅ OCR complete! ${data.text.length} chars`);
  return data.text.trim() || 'No text found';
}

export const cleanupOCR = async () => {};
export const isOCRAvailable = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);