import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface FilterDropdownProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onClose: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedFilter,
  onSelectFilter,
  onClose,
}) => {
  const { colors } = useTheme();
  const filters = ['All', 'Favorites'];

  const handleSelect = (filter: string) => {
    onSelectFilter(filter);
    onClose();
  };

  return (
    <View style={styles.dropdownContainer}>
      {/* Filter Options */}
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={styles.dropdownItem}
          onPress={() => handleSelect(filter)}
        >
          <Text 
            style={[
              styles.dropdownItemText,
              selectedFilter === filter && styles.selectedText,
              { color: colors.textPrimary }
            ]}
          >
            {filter}
          </Text>
          {filter === 'All' && (
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ChevronDownIcon size={20} color={colors.textPrimary} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
  },
  selectedText: {
    fontWeight: '600',
  },
});
