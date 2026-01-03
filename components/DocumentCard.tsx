import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Document } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  document: Document;
  onPress: () => void;
  onDelete: () => void;
}

export default function DocumentCard({ document, onPress, onDelete }: Props) {
  const date = new Date(document.updatedAt);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  let dateText;
  if (isToday) {
    dateText = `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    dateText = `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden"
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
        {/* Thumbnail with Overlay */}
        <View className="w-28 h-36 bg-gradient-to-br from-blue-50 to-blue-100 relative">
          {document.thumbnail ? (
            <>
              <Image
                source={{ uri: document.thumbnail }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Page Count Badge */}
              <View className="absolute top-2 right-2 bg-blue-600 rounded-full px-2 py-1 flex-row items-center gap-1">
                <Ionicons name="document-text" size={12} color="#ffffff" />
                <Text className="text-white text-xs font-bold">{document.pages.length}</Text>
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center">
              <View className="bg-white/50 w-16 h-16 rounded-2xl items-center justify-center">
                <Ionicons name="document-text-outline" size={32} color="#3b82f6" />
              </View>
              <View className="absolute top-2 right-2 bg-blue-600 rounded-full px-2 py-1 flex-row items-center gap-1">
                <Ionicons name="document-text" size={12} color="#ffffff" />
                <Text className="text-white text-xs font-bold">{document.pages.length}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={2}>
              {document.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="layers-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-xs">
                {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs">{dateText}</Text>
            </View>
          </View>
        </View>

        {/* Action Menu */}
        <View className="justify-center pr-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}