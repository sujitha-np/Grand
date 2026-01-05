import React, { useState } from 'react';
import {
  Platform,
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../theme';

export type DatePickerProps = {
  visible: boolean;
  value?: Date | null;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}) => {
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState<Date>(value ?? new Date());

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View
          style={[styles.overlay, { backgroundColor: colors.overlayLight }]}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundSecondary,
                shadowColor: colors.black,
              },
            ]}
          >
            <DateTimePicker
              value={selected}
              mode="date"
              display="spinner"
              onChange={(_, d) => d && setSelected(d)}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={isDark ? 'dark' : 'light'}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={onCancel}
              >
                <Text style={[styles.btnText, { color: colors.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => onConfirm(selected)}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: colors.white,
                      fontWeight: typography.fontWeight.semiBold,
                    },
                  ]}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return visible ? (
    <DateTimePicker
      value={selected}
      mode="date"
      display="calendar"
      onChange={(event, d) => {
        if (event.type === 'set' && d) {
          onConfirm(d);
        } else {
          onCancel();
        }
      }}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
    />
  ) : null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 12,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[2],
  },
  btn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    marginLeft: spacing[2],
  },
  btnText: {
    fontSize: typography.fontSize.base,
  },
});

export default DatePicker;
