import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentCard from '../../components/DocumentCard';
import { useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { documents, deleteDocument, loading, refreshDocuments, searchDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Auto-refresh when screen is focused (coming back from edit/detail)
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HOME SCREEN FOCUSED - Refreshing documents...');
      refreshDocuments();
      
      return () => {
        console.log('🏠 HOME SCREEN UNFOCUSED');
      };
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    await refreshDocuments();
    setTimeout(() => {
      setRefreshing(false);
      console.log('✅ Refresh complete, documents:', documents.length);
    }, 500);
  }, [refreshDocuments]);

  // Filter documents by search query or extracted text
  const filteredDocs = searchQuery 
    ? searchDocuments(searchQuery)
    : documents;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Document',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('🗑️ Deleting document:', id);
            await deleteDocument(id);
            console.log('✅ Document deleted');
          }
        }
      ]
    );
  };

  const QuickActionCard = ({ 
    iconName, 
    title, 
    onPress,
    iconComponent: IconComponent = Ionicons
  }: { 
    iconName: string; 
    title: string; 
    onPress: () => void;
    iconComponent?: any;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 items-center justify-center"
      style={{
        width: 100,
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-2">
        <IconComponent name={iconName} size={24} color="#3b82f6" />
      </View>
      <Text className="text-gray-800 text-xs font-semibold text-center">{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mb-4">
          <Image
            source={require('../../assets/images/logo.png')}
            className="w-10 h-10"
            resizeMode="contain"
          />
        </View>
        <Text className="text-gray-600 font-medium">Loading documents...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            {/* Logo */}
            <Image
              source={require('../../assets/images/logo.png')}
              className="w-10 h-10 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text className="text-gray-900 text-2xl font-bold">ScanView</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 text-gray-900 text-base ml-2"
              placeholder="Search documents and text..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Search Info */}
        {searchQuery && (
          <View className="mt-2 flex-row items-center">
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">
              Searching names and extracted text
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        {documents.length === 0 && (
          <View className="px-6 py-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              <QuickActionCard
                iconName="camera"
                title="Scan Document"
                onPress={() => router.push('/(tabs)/camera')}
              />
              <QuickActionCard
                iconName="image"
                title="Import Image"
                onPress={() => router.push('/(tabs)/camera')}
              />
              <QuickActionCard
                iconName="folder-open"
                title="My Documents"
                onPress={() => {}}
              />
            </View>
          </View>
        )}

        {/* Documents Section */}
        {documents.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 text-lg font-bold">
                {searchQuery ? 'Search Results' : 'Recent Documents'}
              </Text>
              {filteredDocs.length > 0 && (
                <Text className="text-gray-500 text-sm">{filteredDocs.length} items</Text>
              )}
            </View>

            {filteredDocs.length === 0 ? (
              <View className="items-center py-12">
                <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="search" size={40} color="#9ca3af" />
                </View>
                <Text className="text-gray-900 text-base font-semibold mb-1">No results found</Text>
                <Text className="text-gray-500 text-sm text-center">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'No documents match your search'}
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPress={() => {
                      console.log('📄 Opening document:', doc.id, doc.name);
                      router.push(`/document/${doc.id}`);
                    }}
                    onDelete={() => handleDelete(doc.id, doc.name)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <View className="items-center px-6 py-12">
            <View className="items-center mb-8">
              <View className="bg-blue-50 w-32 h-32 rounded-full items-center justify-center mb-6">
                <Image
                  source={require('../../assets/images/logo.png')}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-2">No Documents Yet</Text>
              <Text className="text-gray-500 text-center text-sm leading-5">
                Scan your first document to get started.{'\n'}
                All documents are saved securely on your device.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center gap-3"
              style={{
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => router.push('/(tabs)/camera')}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={24} color="#ffffff" />
              <Text className="text-white font-bold text-base">Scan Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      {documents.length > 0 && (
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center"
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={() => router.push('/(tabs)/camera')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}