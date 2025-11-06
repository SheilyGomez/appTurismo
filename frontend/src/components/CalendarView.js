// components/CalendarView.js
import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarView({ markedDates, onDayPress }) {
  // markedDates es un objeto { '2025-11-05': { marked: true, dots: [...], selected: true }, ... }
  return (
    <View style={{ padding: 8 }}>
      <Calendar
        onDayPress={day => onDayPress(day)}
        markedDates={markedDates}
      />
    </View>
  );
}
