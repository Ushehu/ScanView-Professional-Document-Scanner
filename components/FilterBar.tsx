import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FilterType } from '../types';
import { FILTERS } from '../constants/Filters';

interface Props {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterBar({ selectedFilter, onFilterChange }: Props) {
  return (
    <View className="bg-gray-900/95 py-5 border-t border-gray-800">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6"
        contentContainerStyle={{ gap: 12 }}
      >
        {FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              className={`items-center min-w-[90px] py-3 px-4 rounded-2xl ${
                isSelected 
                  ? 'bg-blue-600' 
                  : 'bg-gray-800'
              }`}
              style={isSelected ? {
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 6,
              } : {}}
              onPress={() => onFilterChange(filter.id)}
              activeOpacity={0.7}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                isSelected ? 'bg-white/20' : 'bg-gray-700'
              }`}>
                <Text className="text-2xl">{filter.icon}</Text>
              </View>
              <Text 
                className={`text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}
              >
                {filter.name}
              </Text>
              {isSelected && (
                <View className="absolute -top-1 -right-1 bg-white w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-blue-600 text-xs font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}