import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme/colors';
import { Category } from '../types';

interface Props {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryBar: React.FC<Props> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                isActive
                  ? { backgroundColor: category.colorHex }
                  : { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive
                    ? { color: theme.colors.textPrimary }
                    : { color: theme.colors.textSecondary },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  categoryButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
