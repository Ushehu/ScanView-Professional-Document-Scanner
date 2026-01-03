import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import PageThumbnail from '../../components/PageThumbnail';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { documents, updateDocument, deleteDocument } = useDocuments();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  
  const document = documents.find(doc => doc.id === id);

  if (!document) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-8">
        <View className="bg-red-50 w-20 h-20 rounded-full items-center justify-center mb-4">
          <Ionicons name="alert-circle" size={40} color="#ef4444" />
        </View>
        <Text className="text-gray-900 text-xl font-bold mb-2">Document Not Found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This document may have been deleted
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-xl"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-semibold">Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasText = document.extractedText && document.extractedText.trim().length > 0;
  const previewText = document.extractedText?.slice(0, 150);
  const needsTruncation = (document.extractedText?.length || 0) > 150;

  const handleShare = async () => {
    console.log('=== SHARE BUTTON PRESSED ===');
    
    try {
      if (document.pages.length > 0) {
        const canShare = await Sharing.isAvailableAsync();
        
        if (canShare) {
          // Share the first page image
          await Sharing.shareAsync(document.pages[0].uri, {
            mimeType: 'image/jpeg',
            dialogTitle: `Share ${document.name}`,
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleCopyText = async () => {
    if (document.extractedText) {
      try {
        await Clipboard.setStringAsync(document.extractedText);
        Alert.alert('✅ Copied', 'Text copied to clipboard');
      } catch (error) {
        Alert.alert('Error', 'Failed to copy text');
      }
    }
  };

  const handleShareText = async () => {
    if (document.extractedText) {
      try {
        await Share.share({
          message: document.extractedText,
          title: document.name,
        });
      } catch (error) {
        console.error('Error sharing text:', error);
      }
    }
  };

  const handleExportPDF = () => {
    Alert.alert(
      'PDF Export',
      'To enable PDF export, please install the required packages:\n\nnpx expo install expo-print expo-media-library\n\nThen add the utils/pdfGenerator.ts file.',
      [
        { text: 'OK' },
        { text: 'Share Image Instead', onPress: handleShare }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDocument(id);
            router.push('/(tabs)');
          }
        }
      ]
    );
  };

  const handleRename = () => {
    if (editing) {
      if (newName.trim()) {
        updateDocument(id, { name: newName.trim() });
      }
      setEditing(false);
    } else {
      setNewName(document.name);
      setEditing(true);
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (document.pages.length === 1) {
      Alert.alert('Cannot Delete', 'A document must have at least one page');
      return;
    }

    Alert.alert(
      'Delete Page',
      'Are you sure you want to delete this page?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedPages = document.pages.filter(p => p.id !== pageId);
            updateDocument(id, { pages: updatedPages });
          }
        }
      ]
    );
  };

  const handleEditPage = (pageId: string, imageUri: string) => {
    router.push({
      pathname: '/document/edit',
      params: { 
        imageUri,
        documentId: id,
        pageId
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            className="flex-row items-center gap-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            <Text className="text-blue-600 font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        {editing ? (
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 text-gray-900 text-2xl font-bold border-b-2 border-blue-600 pb-1"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleRename}
            />
            <TouchableOpacity onPress={handleRename}>
              <Text className="text-blue-600 font-semibold text-base">Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text className="text-gray-900 text-2xl font-bold">{document.name}</Text>
          </TouchableOpacity>
        )}
        
        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="layers-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm">
              {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm">
              {new Date(document.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Extracted Text Section */}
        {hasText ? (
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            {/* Text Header */}
            <View className="p-4 bg-purple-50 border-b border-purple-100 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-purple-500 p-2 rounded-lg">
                  <Ionicons name="document-text" size={20} color="white" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-bold">Extracted Text</Text>
                  <Text className="text-gray-600 text-xs">
                    {document.extractedText?.length || 0} characters
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleCopyText}
                  className="bg-white p-2 rounded-lg active:scale-95"
                >
                  <Ionicons name="copy" size={20} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShareText}
                  className="bg-white p-2 rounded-lg active:scale-95"
                >
                  <Ionicons name="share" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Text Content */}
            <View className="p-4">
              <Text className="text-gray-800 text-base leading-6">
                {showFullText ? document.extractedText : previewText}
                {!showFullText && needsTruncation && '...'}
              </Text>
              
              {needsTruncation && (
                <TouchableOpacity
                  onPress={() => setShowFullText(!showFullText)}
                  className="mt-3"
                >
                  <Text className="text-purple-600 font-semibold">
                    {showFullText ? 'Show Less' : 'Show More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <View className="items-center">
              <View className="bg-gray-100 p-4 rounded-full mb-3">
                <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-center font-semibold mb-1">
                No Text Extracted
              </Text>
              <Text className="text-gray-400 text-center text-sm">
                OCR was not performed on this document
              </Text>
            </View>
          </View>
        )}

        {/* Pages List */}
        <View className="gap-4">
          {document.pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              pageNumber={index + 1}
              onPress={() => handleEditPage(page.id, page.uri)}
              onEdit={() => handleEditPage(page.id, page.uri)}
              onDelete={() => handleDeletePage(page.id)}
            />
          ))}
        </View>

        {/* Add Page Button */}
        <TouchableOpacity
          className="bg-white rounded-xl p-6 mt-4 border-2 border-dashed border-gray-300 items-center"
          onPress={() => router.push('/(tabs)/camera')}
          activeOpacity={0.7}
        >
          <View className="bg-blue-50 w-16 h-16 rounded-full items-center justify-center mb-3">
            <Ionicons name="camera" size={28} color="#3b82f6" />
          </View>
          <Text className="text-gray-900 font-bold text-base">Add More Pages</Text>
          <Text className="text-gray-500 text-sm mt-1">Tap to scan another page</Text>
        </TouchableOpacity>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="bg-white px-6 py-4 border-t border-gray-100">
        {/* Share Image Button */}
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center gap-2 mb-3"
          style={{
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={22} color="#ffffff" />
          <Text className="text-white font-bold text-base">
            Share Image
          </Text>
        </TouchableOpacity>

        {/* Copy Text Button (if text exists) */}
        {hasText && (
          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-xl flex-row items-center justify-center gap-2 mb-3"
            onPress={handleCopyText}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={22} color="#ffffff" />
            <Text className="text-white font-bold text-base">
              Copy All Text
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Secondary Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity 
            className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center gap-2"
            onPress={() => router.push('/(tabs)/camera')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-semibold">Add Page</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center gap-2"
            onPress={handleExportPDF}
          >
            <Ionicons name="document-text-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-semibold">Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}