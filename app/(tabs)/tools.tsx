import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  badge?: string;
  comingSoon?: boolean;
};

export default function ToolsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'scan' | 'edit' | 'convert'>('all');

  const handleToolPress = (toolName: string, action?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action) {
      action();
    } else {
      Alert.alert(
        toolName,
        'This feature is coming soon!',
        [{ text: 'OK' }]
      );
    }
  };

  const tools: Tool[] = [
    {
      id: '1',
      name: 'Text Extractor',
      description: 'Extract text from any image using OCR',
      icon: 'text',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      onPress: () => {
        Alert.alert(
          'Text Extractor',
          'Scan a document from the Camera tab to extract text automatically!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Camera', onPress: () => router.push('/(tabs)/camera') }
          ]
        );
      },
    },
    {
      id: '2',
      name: 'PDF Converter',
      description: 'Convert images to PDF documents',
      icon: 'document-text',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      onPress: () => {
        router.push('/tools/pdf-converter' as any);
      },
      badge: 'Pro',
    },
    {
      id: '3',
      name: 'QR Code Scanner',
      description: 'Scan and decode QR codes instantly',
      icon: 'qr-code',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      onPress: () => {
        router.push('/tools/qr-scanner' as any);
      },
    },
    {
      id: '4',
      name: 'Translator',
      description: 'Translate extracted text to any language',
      icon: 'language',
      color: '#10B981',
      bgColor: '#ECFDF5',
      onPress: () => {
        router.push('/tools/translator' as any);
      },
      badge: 'New',
    },
    {
      id: '5',
      name: 'Word Counter',
      description: 'Count words and characters in documents',
      icon: 'calculator',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      onPress: () => {
        router.push('/tools/word-counter' as any);
      },
    },
    {
      id: '6',
      name: 'Document Merger',
      description: 'Merge multiple documents into one',
      icon: 'albums',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      onPress: () => {
        router.push('/tools/document-merger' as any);
      },
    },
    {
      id: '7',
      name: 'Image Compressor',
      description: 'Reduce image size without quality loss',
      icon: 'resize',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      onPress: () => {
        router.push('/tools/image-compressor' as any);
      },
    },
    {
      id: '8',
      name: 'Cloud Backup',
      description: 'Backup documents to cloud storage',
      icon: 'cloud-upload',
      color: '#6366F1',
      bgColor: '#EEF2FF',
      onPress: () => router.push('/(tabs)/settings'),
    },
    {
      id: '9',
      name: 'Batch Scanner',
      description: 'Scan multiple pages at once',
      icon: 'camera-reverse',
      color: '#14B8A6',
      bgColor: '#F0FDFA',
      onPress: () => {
        router.push('/tools/batch-scanner' as any);
      },
    },
    {
      id: '10',
      name: 'Text Editor',
      description: 'Edit extracted text before saving',
      icon: 'create',
      color: '#F97316',
      bgColor: '#FFF7ED',
      onPress: () => {
        router.push('/tools/text-editor' as any);
      },
    },
    {
      id: '11',
      name: 'Signature Tool',
      description: 'Add digital signatures to documents',
      icon: 'pencil',
      color: '#A855F7',
      bgColor: '#FAF5FF',
      onPress: () => {
        router.push('/tools/signature' as any);
      },
      badge: 'Pro',
    },
    {
      id: '12',
      name: 'Smart Search',
      description: 'Search text across all documents',
      icon: 'search',
      color: '#0EA5E9',
      bgColor: '#F0F9FF',
      onPress: () => router.push('/(tabs)'),
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'apps' },
    { id: 'scan', name: 'Scanning', icon: 'scan' },
    { id: 'edit', name: 'Editing', icon: 'create' },
    { id: 'convert', name: 'Convert', icon: 'swap-horizontal' },
  ];

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <TouchableOpacity
      onPress={tool.onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <View 
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: tool.bgColor }}
        >
          <Ionicons name={tool.icon as any} size={28} color={tool.color} />
        </View>
        
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="text-gray-900 font-bold text-base">{tool.name}</Text>
            {tool.badge && (
              <View className={`ml-2 px-2 py-0.5 rounded-full ${
                tool.badge === 'Pro' ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                <Text className={`text-xs font-bold ${
                  tool.badge === 'Pro' ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {tool.badge}
                </Text>
              </View>
            )}
            {tool.comingSoon && (
              <View className="ml-2 px-2 py-0.5 rounded-full bg-gray-100">
                <Text className="text-xs font-semibold text-gray-600">Soon</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-sm mt-1">{tool.description}</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const CategoryChip = ({ category }: { category: typeof categories[0] }) => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(category.id as any);
      }}
      className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${
        selectedCategory === category.id ? 'bg-blue-600' : 'bg-gray-100'
      }`}
    >
      <Ionicons 
        name={category.icon as any} 
        size={16} 
        color={selectedCategory === category.id ? '#FFFFFF' : '#6B7280'} 
      />
      <Text className={`ml-2 font-semibold text-sm ${
        selectedCategory === category.id ? 'text-white' : 'text-gray-700'
      }`}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/images/logo.png')}
              className="w-10 h-10 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text className="text-gray-900 text-2xl font-bold">All Tools</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                {tools.length} powerful features
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-100"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
      >
        {categories.map((category) => (
          <CategoryChip key={category.id} category={category} />
        ))}
      </ScrollView>

      {/* Tools Grid */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-4">
          {/* Featured Section */}
          <View className="mb-6">
            <Text className="text-gray-900 text-lg font-bold mb-3">Featured Tools</Text>
            <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="bg-white/20 px-3 py-1 rounded-full self-start mb-3">
                    <Text className="text-white text-xs font-bold">✨ NEW</Text>
                  </View>
                  <Text className="text-white text-xl font-bold mb-2">
                    AI Text Scanner
                  </Text>
                  <Text className="text-white/90 text-sm mb-4">
                    Extract text with 99% accuracy using AI
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/camera')}
                    className="bg-white px-4 py-2 rounded-full self-start"
                  >
                    <Text className="text-blue-600 font-bold text-sm">Try Now</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-white/20 w-20 h-20 rounded-2xl items-center justify-center ml-4">
                  <Ionicons name="sparkles" size={40} color="white" />
                </View>
              </View>
            </View>
          </View>

          {/* All Tools */}
          <View className="mb-4">
            <Text className="text-gray-900 text-lg font-bold mb-3">All Tools</Text>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-gray-900 text-lg font-bold mb-3">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/camera')}
                className="bg-blue-600 rounded-2xl p-4 flex-1 min-w-[45%]"
                style={{
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="camera" size={32} color="white" />
                <Text className="text-white font-bold text-base mt-2">
                  Scan Document
                </Text>
                <Text className="text-white/80 text-xs mt-1">
                  Quick scan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                className="bg-purple-600 rounded-2xl p-4 flex-1 min-w-[45%]"
                style={{
                  shadowColor: '#7c3aed',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="folder-open" size={32} color="white" />
                <Text className="text-white font-bold text-base mt-2">
                  My Documents
                </Text>
                <Text className="text-white/80 text-xs mt-1">
                  View all
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}