import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Page } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  page: Page;
  pageNumber: number;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PageThumbnail({ page, pageNumber, onPress, onEdit, onDelete }: Props) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Page Number Badge */}
        <View className="absolute top-2 left-2 bg-blue-600 rounded-full w-8 h-8 items-center justify-center z-10">
          <Text className="text-white font-bold text-xs">{pageNumber}</Text>
        </View>

        {/* Image */}
        <View className="w-32 h-40 bg-gray-100">
          <Image
            source={{ uri: page.croppedUri || page.uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text className="text-gray-900 font-semibold text-base">Page {pageNumber}</Text>
            <View className="flex-row items-center gap-1 mt-2">
              <Ionicons name="color-filter-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs">
                {page.filter}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text className="text-gray-400 text-xs">
                {new Date(page.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            {onEdit && (
              <TouchableOpacity 
                className="bg-blue-50 px-3 py-2 rounded-lg flex-row items-center gap-1"
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Ionicons name="create-outline" size={16} color="#3b82f6" />
                <Text className="text-blue-600 text-xs font-semibold">Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                className="bg-red-50 px-3 py-2 rounded-lg flex-row items-center gap-1"
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text className="text-red-600 text-xs font-semibold">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}