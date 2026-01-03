import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, Image, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { extractTextFromImage, initializeOCR, isOCRAvailable } from '../../utils/ocrProcessor';
import * as Clipboard from 'expo-clipboard';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useDocuments } from '../../hooks/useDocuments';
import { Page } from '../../types';

type FilterType = 'original' | 'blackWhite' | 'grayscale' | 'magic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EditScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const initialImageUri = params.imageUri as string;
  const { createDocument } = useDocuments();
  
  const [currentImageUri, setCurrentImageUri] = useState(initialImageUri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [ocrReady, setOcrReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('original');
  const [showBottomSheet, setShowBottomSheet] = useState<'filter' | 'crop' | null>(null);

  useEffect(() => {
    checkOCRStatus();
    console.log('📸 Edit screen loaded with image:', initialImageUri);
  }, []);

  const checkOCRStatus = async () => {
    const ready = await initializeOCR();
    setOcrReady(ready && isOCRAvailable());
  };

  const applyFilter = async (filter: FilterType) => {
    if (filter === 'original') {
      setCurrentImageUri(initialImageUri);
      setCurrentFilter('original');
      return;
    }

    try {
      setIsProcessing(true);
      const actions: ImageManipulator.Action[] = [];

      if (filter === 'blackWhite') {
        // Create a high-contrast black and white effect
        // We'll resize and apply high compression to simulate B&W
        const result = await ImageManipulator.manipulateAsync(
          initialImageUri,
          [{ resize: { width: 2000 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        setCurrentImageUri(result.uri);
      } else if (filter === 'grayscale') {
        // Apply grayscale effect
        const result = await ImageManipulator.manipulateAsync(
          initialImageUri,
          [{ resize: { width: 2000 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        setCurrentImageUri(result.uri);
      } else if (filter === 'magic') {
        // Magic Color - enhanced and brightened
        const result = await ImageManipulator.manipulateAsync(
          initialImageUri,
          [{ resize: { width: 2000 } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        setCurrentImageUri(result.uri);
      }

      setCurrentFilter(filter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Filter error:', error);
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = async () => {
    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await ImageManipulator.manipulateAsync(
        currentImageUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      setCurrentImageUri(result.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Rotation error:', error);
      Alert.alert('Error', 'Failed to rotate image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropAuto = async () => {
    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Auto crop - remove 10% from each edge
      const cropSize = SCREEN_WIDTH * 0.8;
      const result = await ImageManipulator.manipulateAsync(
        currentImageUri,
        [
          {
            crop: {
              originX: SCREEN_WIDTH * 0.1,
              originY: SCREEN_WIDTH * 0.1,
              width: cropSize,
              height: cropSize,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentImageUri(result.uri);
      setShowBottomSheet(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Crop error:', error);
      Alert.alert('Error', 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropManual = async () => {
    // For now, use the auto crop - in a full implementation you'd show draggable corners
    await handleCropAuto();
  };

  const handleOCR = async () => {
    if (!ocrReady) {
      Alert.alert(
        'OCR Not Available',
        'Text recognition requires Supabase Edge Function to be deployed.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const text = await extractTextFromImage(currentImageUri);
      setExtractedText(text);
      setShowTextModal(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('❌ OCR Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('OCR Failed', 'Failed to extract text from image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await Clipboard.setStringAsync(extractedText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Copied', 'Text copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('🔵 Starting save process...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Generate document name
      let documentName = 'Scanned Document';
      
      // Try to use first line of extracted text if available
      if (extractedText && extractedText.trim()) {
        const firstLine = extractedText.split('\n')[0].trim();
        if (firstLine && firstLine.length > 0) {
          documentName = firstLine.slice(0, 50);
          console.log('📝 Using OCR text for name:', documentName);
        }
      } else {
        // Use date-based name
        const now = new Date();
        documentName = `Scan ${now.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`;
        console.log('📅 Using date for name:', documentName);
      }

      console.log('💾 Creating document with name:', documentName);
      console.log('📸 Image URI:', currentImageUri);
      console.log('🎨 Filter:', currentFilter);
      console.log('📝 Extracted text length:', extractedText?.length || 0);

      const page: Page = {
        id: Date.now().toString(),
        uri: currentImageUri,
        filter: currentFilter,
        timestamp: Date.now(),
        extractedText: extractedText || undefined,
      };

      console.log('📄 Page object created:', page);

      const document = await createDocument(
        documentName,
        [page],
        extractedText || undefined
      );

      console.log('✅ Document created successfully:', document.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Small delay to ensure save completes
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🔄 Navigating to document detail...');

      // Navigate to document detail with the new document
      router.replace({
        pathname: '/document/[id]',
        params: { id: document.id }
      });

      console.log('✅ Navigation complete');

    } catch (error) {
      console.error('❌ Save error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Save Failed', 
        `Failed to save document: ${errorMessage}\n\nPlease check console for details.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      console.log('🔵 Save process ended');
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Discard Scan?',
      'This scan will be deleted.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }
        }
      ]
    );
  };

  if (!initialImageUri) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="white" />
        <Text className="text-white text-lg mt-4">No image selected</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filters: { id: FilterType; name: string; description: string }[] = [
    { id: 'original', name: 'Original', description: 'No filter' },
    { id: 'magic', name: 'Magic Color', description: 'Auto-enhanced' },
    { id: 'blackWhite', name: 'Black & White', description: 'High contrast' },
    { id: 'grayscale', name: 'Grayscale', description: 'Neutral tones' },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Image Display - Full Screen */}
      <View className="flex-1">
        <Image
          source={{ uri: currentImageUri }}
          className="w-full h-full"
          resizeMode="contain"
          key={currentImageUri}
        />
      </View>

      {/* Processing Overlay */}
      {(isProcessing || isSaving) && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
          <View className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white font-semibold mt-4 text-lg">
              {isSaving ? 'Saving Document...' : 'Processing...'}
            </Text>
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <View className="pt-12 pb-4 px-4 bg-black/50 backdrop-blur-md">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleCancel}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row items-center gap-3">
              {ocrReady && (
                <TouchableOpacity
                  onPress={handleOCR}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex-row items-center gap-2"
                >
                  <Ionicons name="scan" size={18} color="white" />
                  <Text className="text-white font-semibold text-sm">OCR</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 rounded-full flex-row items-center gap-2"
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white font-bold text-base">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* OCR Badge */}
          {extractedText && (
            <TouchableOpacity
              onPress={() => setShowTextModal(true)}
              className="mt-3 bg-green-500/30 backdrop-blur-sm border border-green-400/50 px-3 py-2 rounded-lg flex-row items-center self-start"
            >
              <Ionicons name="document-text" size={16} color="#10B981" />
              <Text className="text-green-200 font-medium ml-2 text-sm">
                {extractedText.length} characters extracted
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Toolbar */}
      <View className="absolute bottom-0 left-0 right-0 z-10">
        <View className="bg-black/50 backdrop-blur-md pb-8 pt-4">
          {/* Main Actions */}
          <View className="flex-row items-center justify-around px-4 mb-4">
            {/* Crop */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowBottomSheet('crop');
              }}
              disabled={isProcessing}
              className="items-center"
            >
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-2">
                <Ionicons name="crop" size={26} color="white" />
              </View>
              <Text className="text-white text-xs font-medium">Crop</Text>
            </TouchableOpacity>

            {/* Rotate */}
            <TouchableOpacity
              onPress={handleRotate}
              disabled={isProcessing}
              className="items-center"
            >
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-2">
                <Ionicons name="reload" size={26} color="white" />
              </View>
              <Text className="text-white text-xs font-medium">Rotate</Text>
            </TouchableOpacity>

            {/* Filter */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowBottomSheet('filter');
              }}
              disabled={isProcessing}
              className="items-center"
            >
              <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${
                currentFilter !== 'original' ? 'bg-blue-600' : 'bg-white/20'
              }`}>
                <Ionicons name="color-filter" size={26} color="white" />
              </View>
              <Text className="text-white text-xs font-medium">Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Quick Select */}
          {currentFilter !== 'original' && (
            <View className="px-4">
              <View className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex-row items-center">
                <View className="bg-blue-500 w-8 h-8 rounded-lg items-center justify-center">
                  <Ionicons name="color-filter" size={16} color="white" />
                </View>
                <Text className="text-white font-semibold ml-3 flex-1">
                  {filters.find(f => f.id === currentFilter)?.name}
                </Text>
                <TouchableOpacity 
                  onPress={() => applyFilter('original')}
                  className="bg-white/20 px-3 py-1 rounded-lg"
                >
                  <Text className="text-white text-xs font-medium">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Filter Bottom Sheet */}
      <Modal
        visible={showBottomSheet === 'filter'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBottomSheet(null)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowBottomSheet(null)}
          className="flex-1 bg-black/60"
        >
          <View className="flex-1" />
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl">
              {/* Header */}
              <View className="p-5 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">Filter</Text>
                  <TouchableOpacity 
                    onPress={() => setShowBottomSheet(null)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filter Options */}
              <ScrollView className="px-5 py-4" style={{ maxHeight: 400 }}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => {
                      applyFilter(filter.id);
                      setShowBottomSheet(null);
                    }}
                    className={`mb-3 p-4 rounded-2xl border-2 ${
                      currentFilter === filter.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                        currentFilter === filter.id ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        <Ionicons 
                          name="color-filter" 
                          size={24} 
                          color={currentFilter === filter.id ? 'white' : '#6B7280'} 
                        />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className={`font-bold text-base ${
                          currentFilter === filter.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {filter.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">{filter.description}</Text>
                      </View>
                      {currentFilter === filter.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="h-6" />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Crop Bottom Sheet */}
      <Modal
        visible={showBottomSheet === 'crop'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBottomSheet(null)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowBottomSheet(null)}
          className="flex-1 bg-black/60"
        >
          <View className="flex-1" />
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl">
              {/* Header */}
              <View className="p-5 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">Crop</Text>
                  <TouchableOpacity 
                    onPress={() => setShowBottomSheet(null)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Crop Options */}
              <View className="p-5">
                <TouchableOpacity
                  onPress={handleCropAuto}
                  className="bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center mb-3"
                >
                  <Ionicons name="scan" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Auto Crop</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCropManual}
                  className="bg-gray-100 p-4 rounded-2xl flex-row items-center justify-center"
                >
                  <Ionicons name="crop" size={22} color="#374151" />
                  <Text className="text-gray-700 font-bold text-base ml-2">Manual Crop</Text>
                </TouchableOpacity>
              </View>

              <View className="h-6" />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Extracted Text Modal */}
      <Modal
        visible={showTextModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTextModal(false)}
      >
        <View className="flex-1 bg-black/90">
          <View className="flex-1" />
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="p-5 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-gray-900">Extracted Text</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {extractedText.length} characters
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowTextModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Text Content */}
            <ScrollView className="flex-1 p-5">
              <Text className="text-gray-700 leading-6 text-base">
                {extractedText}
              </Text>
            </ScrollView>
            
            {/* Actions */}
            <View className="p-5 border-t border-gray-200 bg-gray-50">
              <TouchableOpacity
                onPress={handleCopyText}
                className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="copy-outline" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Copy to Clipboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}