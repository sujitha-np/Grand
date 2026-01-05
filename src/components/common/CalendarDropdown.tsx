import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { typography } from '../../theme';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

interface CalendarDropdownProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  allowFutureDates?: boolean;
  allowPastDates?: boolean; // Allow selecting past dates (for pending orders)
  minDate?: Date; // Minimum selectable date (dates before this are disabled)
  maxDate?: Date; // Maximum selectable date
}

import { useTheme } from '../../hooks/useTheme';

export const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
  allowFutureDates = false,
  allowPastDates = false,
  minDate,
  maxDate,
}) => {
  const { colors, isDark } = useTheme();
  
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(today);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateDisabled = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    dateToCheck.setHours(0, 0, 0, 0);

    // Check minDate first if provided
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (dateToCheck < min) {
        return true;
      }
    }

    // If allowPastDates is true, only check maxDate restriction
    if (allowPastDates) {
      if (maxDate) {
        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);
        return dateToCheck > max;
      }
      return false; // All dates allowed if no maxDate
    }

    // If maxDate is provided, disable dates beyond it
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      
      // Disable if before today OR after maxDate (unless minDate handles it)
      if (!minDate) {
        return dateToCheck < today || dateToCheck > max;
      }
      return dateToCheck > max;
    }

    if (allowFutureDates) {
      // If minDate is not set, use today as the minimum
      if (!minDate) {
        return dateToCheck < today;
      }
      return false; // minDate already handled
    }
    
    return dateToCheck > today;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={[styles.calendarContainer, { 
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.borderLight 
    }]}>
      {/* Header with Month/Year and Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <ChevronLeftIcon size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthYear, { color: colors.textPrimary }]}>
          {monthNames[currentMonth.getMonth()]}, {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <ChevronRightIcon size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={[styles.dayNameText, { color: colors.textTertiary }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day !== null ? (
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isSelected(day) && { backgroundColor: colors.primary },
                  isToday(day) && !isSelected(day) && { ...styles.todayDay, borderColor: colors.textPrimary },
                  isDateDisabled(day) && styles.disabledDay,
                ]}
                onPress={() => !isDateDisabled(day) && handleSelectDate(day)}
                disabled={isDateDisabled(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.textPrimary },
                    isSelected(day) && styles.selectedDayText,
                    isToday(day) && !isSelected(day) && styles.todayDayText,
                    isDateDisabled(day) && { color: colors.textPlaceholder },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyDay} />
            )}
          </View>
        ))}
      </View>

      {/* Footer with Clear and Today buttons */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <TouchableOpacity onPress={onClose} style={styles.footerButton}>
          <Text style={[styles.clearText, { color: colors.info }]}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleToday} style={styles.footerButton}>
          <Text style={[styles.todayText, { color: colors.textTertiary }]}>Today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: 4,
  },
  monthYear: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayNameText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  emptyDay: {
    flex: 1,
  },
  selectedDay: {
    // backgroundColor handled inline
  },
  todayDay: {
    borderWidth: 1,
    // borderColor handled inline
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayText: {
    fontWeight: '600',
  },
  disabledDayText: {
    // color handled inline
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
  },
  todayText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
  },
});
