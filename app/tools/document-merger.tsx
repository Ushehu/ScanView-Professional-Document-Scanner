import { View, Text, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDocuments } from '@/hooks/useDocuments';
import { Document, Page } from '@/types';

export default function DocumentMergerScreen() {
  const router = useRouter();
  const { documents, createDocument } = useDocuments();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [mergedName, setMergedName] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  const toggleDocument = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(docId => docId !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const handleMerge = async () => {
    if (selectedDocs.length < 2) {
      Alert.alert('Select Documents', 'Please select at least 2 documents to merge');
      return;
    }

    if (!mergedName.trim()) {
      Alert.alert('Document Name', 'Please enter a name for the merged document');
      return;
    }

    try {
      setIsMerging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get all selected documents
      const selectedDocuments = documents.filter(doc => selectedDocs.includes(doc.id));
      
      // Combine all pages from selected documents
      const allPages: Page[] = [];
      let allText = '';
      
      selectedDocuments.forEach((doc, index) => {
        doc.pages.forEach((page, pageIndex) => {
          allPages.push({
            ...page,
            id: `${index}-${pageIndex}`,
          });
        });
        
        if (doc.extractedText) {
          allText += (allText ? '\n\n' : '') + doc.extractedText;
        }
      });

      // Create merged document
      await createDocument(mergedName.trim(), allPages, allText || undefined);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '✅ Success',
        `Merged ${selectedDocs.length} documents into "${mergedName}"`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Merge error:', error);
      Alert.alert('Error', 'Failed to merge documents');
    } finally {
      setIsMerging(false);
    }
  };

  const DocumentCard = ({ doc }: { doc: Document }) => {
    const isSelected = selectedDocs.includes(doc.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleDocument(doc.id)}
        className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center ${
          isSelected ? 'border-2 border-blue-500' : 'border border-gray-200'
        }`}
      >
        {/* Checkbox */}
        <View
          className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
            isSelected ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>

        {/* Thumbnail */}
        {doc.thumbnail && (
          <Image
            source={{ uri: doc.thumbnail }}
            className="w-16 h-16 rounded-lg mr-3"
            resizeMode="cover"
          />
        )}

        {/* Info */}
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
            {doc.name}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}
          </Text>
        </View>

        {/* Selected Badge */}
        {isSelected && (
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-600 font-bold text-xs">Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
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
              <Text className="text-gray-900 text-xl font-bold">Document Merger</Text>
              <Text className="text-gray-500 text-sm">
                {selectedDocs.length} selected
              </Text>
            </View>
          </View>
          {selectedDocs.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedDocs([]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold text-sm">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Instructions */}
        {documents.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <View className="bg-pink-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Ionicons name="albums" size={48} color="#EC4899" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">No Documents</Text>
            <Text className="text-gray-500 text-center mb-6">
              Scan some documents first to merge them
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/camera')}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Go to Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-900 font-bold ml-2">How to Merge</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                1. Select 2 or more documents{'\n'}
                2. Enter a name for the merged document{'\n'}
                3. Tap "Merge Documents" button
              </Text>
            </View>

            {/* Merged Document Name */}
            {selectedDocs.length >= 2 && (
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-900 font-bold mb-2">Merged Document Name</Text>
                <TextInput
                  value={mergedName}
                  onChangeText={setMergedName}
                  placeholder="Enter name for merged document..."
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-base"
                />
                <Text className="text-gray-500 text-xs mt-2">
                  Total pages: {selectedDocs.reduce((sum, id) => {
                    const doc = documents.find(d => d.id === id);
                    return sum + (doc?.pages.length || 0);
                  }, 0)}
                </Text>
              </View>
            )}

            {/* Documents List */}
            <Text className="text-gray-900 font-bold mb-3">Select Documents to Merge</Text>
            {documents.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Merge Button */}
      {selectedDocs.length >= 2 && (
        <View className="bg-white border-t border-gray-100 p-4">
          <TouchableOpacity
            onPress={handleMerge}
            disabled={isMerging || !mergedName.trim()}
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              isMerging || !mergedName.trim() ? 'bg-gray-300' : 'bg-pink-600'
            }`}
          >
            <Ionicons name="albums" size={20} color="white" />
            <Text className="text-white font-bold ml-2">
              {isMerging ? 'Merging...' : `Merge ${selectedDocs.length} Documents`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}