import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';

export default function PDFConverterScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const pickImages = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const removeImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImages(images.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image to convert');
      return;
    }

    try {
      setIsConverting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Alert.alert(
        'PDF Export',
        'PDF export requires expo-print package.\n\nInstall it with:\nnpx expo install expo-print\n\nFor now, you can share individual images.',
        [
          { text: 'OK' },
          { 
            text: 'Share First Image', 
            onPress: async () => {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare && images[0]) {
                await Sharing.shareAsync(images[0]);
              }
            }
          }
        ]
      );

      // IMPLEMENTATION NOTE:
      // Once expo-print is installed, use this code:
      /*
      import * as Print from 'expo-print';
      
      const htmlContent = `
        <html>
          <body>
            ${images.map(uri => `
              <div style="page-break-after: always;">
                <img src="${uri}" style="width: 100%; height: auto;" />
              </div>
            `).join('')}
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
        UTI: 'com.adobe.pdf',
      });
      */

    } catch (error) {
      console.error('PDF conversion error:', error);
      Alert.alert('Error', 'Failed to convert to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-900 text-xl font-bold">PDF Converter</Text>
              <Text className="text-gray-500 text-sm">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </Text>
            </View>
          </View>
          <View className="bg-amber-100 px-3 py-1 rounded-full">
            <Text className="text-amber-700 font-bold text-xs">PRO</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {images.length === 0 ? (
          // Empty State
          <View className="flex-1 items-center justify-center py-12">
            <View className="bg-red-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Ionicons name="document-text" size={48} color="#EF4444" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">No Images Added</Text>
            <Text className="text-gray-500 text-center mb-8 px-6">
              Add images to convert them into a PDF document
            </Text>
            <TouchableOpacity
              onPress={pickImages}
              className="bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center"
            >
              <Ionicons name="images" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Add Images</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Instructions */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-900 font-bold ml-2">How it Works</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                1. Add one or more images{'\n'}
                2. Reorder images if needed{'\n'}
                3. Tap "Convert to PDF" to create your document
              </Text>
            </View>

            {/* Images Grid */}
            <Text className="text-gray-900 font-bold mb-3">Images to Convert</Text>
            {images.map((uri, index) => (
              <View key={index} className="bg-white rounded-2xl p-3 mb-3 flex-row items-center">
                <View className="bg-red-50 px-2 py-1 rounded-lg mr-3">
                  <Text className="text-red-600 font-bold">{index + 1}</Text>
                </View>
                
                <Image
                  source={{ uri }}
                  className="w-16 h-16 rounded-lg mr-3"
                  resizeMode="cover"
                />
                
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">Image {index + 1}</Text>
                  <Text className="text-gray-500 text-sm">Page {index + 1} of PDF</Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="bg-red-50 w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity
              onPress={pickImages}
              className="bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center mb-4"
            >
              <Ionicons name="add-circle" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold ml-2">Add More Images</Text>
            </TouchableOpacity>

            {/* Package Info */}
            <View className="bg-amber-50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text className="text-amber-900 font-bold ml-2">Setup Required</Text>
              </View>
              <Text className="text-amber-700 text-sm mb-3">
                To enable PDF export, install expo-print:
              </Text>
              <View className="bg-gray-900 rounded-lg p-3">
                <Text className="text-green-400 font-mono text-xs">
                  npx expo install expo-print
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {images.length > 0 && (
        <View className="bg-white border-t border-gray-100 p-4">
          <TouchableOpacity
            onPress={convertToPDF}
            disabled={isConverting}
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              isConverting ? 'bg-gray-300' : 'bg-red-600'
            }`}
          >
            {isConverting ? (
              <>
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold ml-2">Converting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="document-text" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Convert to PDF ({images.length} {images.length === 1 ? 'page' : 'pages'})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}