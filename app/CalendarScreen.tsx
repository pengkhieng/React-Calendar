import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';

type WeekViewProps = {
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
};

type DayViewProps = {
  selectedDate: string;
};

const CalendarScreen = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  return (
    <View style={styles.container}>
      {/* ---- Filter Bar ---- */}
      <View style={styles.filterContainer}>
        {(['day', 'week', 'month'] as const).map(mode => (
          <TouchableOpacity
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[styles.filterButton, viewMode === mode && styles.activeButton]}
          >
            <Text style={[styles.filterText, viewMode === mode && styles.activeText]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- Views ---- */}
      {viewMode === 'month' && (
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#007bff' },
          }}
        />
      )}

      {viewMode === 'week' && (
        <WeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

     {viewMode === 'day' && (
  <DayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
)}
    </View>
  );
};

/* -------------------------------
   WEEK VIEW (Grid layout)
--------------------------------*/
const WeekView: React.FC<WeekViewProps> = ({ selectedDate, setSelectedDate }) => {
  const startOfWeek = dayjs(selectedDate).startOf('week');
  const days = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  const timeSlots = Array.from({ length: 10 }).map((_, i) => `${8 + i}:00`);

  const events = [
    { title: 'Team Meeting', date: dayjs(selectedDate).format('YYYY-MM-DD'), time: '10:00' },
    { title: 'Lunch', date: dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'), time: '12:00' },
    { title: 'Design Review', date: dayjs(selectedDate).add(2, 'day').format('YYYY-MM-DD'), time: '15:00' },
    { title: 'Project Update', date: dayjs(selectedDate).add(4, 'day').format('YYYY-MM-DD'), time: '9:00' },
  ];

  return (
    <View style={styles.weekWrapper}>
      {/* ---- Header Row (Weekdays) ---- */}
      <View style={styles.weekHeaderRow}>
        <View style={styles.timeColumnHeader} /> {/* Empty top-left space */}
        {days.map(date => (
          <TouchableOpacity
            key={date.format('YYYY-MM-DD')}
            style={[styles.dayHeaderCell, date.isSame(selectedDate) && styles.activeDayHeader]}
            onPress={() => setSelectedDate(date.format('YYYY-MM-DD'))}
          >
            <Text style={styles.dayName}>{date.format('ddd')}</Text>
            <Text style={styles.dayNumber}>{date.format('D')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- Grid Body (Time x Days) ---- */}
      <ScrollView>
        {timeSlots.map(time => (
          <View key={time} style={styles.gridRow}>
            {/* Time column */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>{time}</Text>
            </View>

            {/* Day columns */}
            {days.map(date => {
              const event = events.find(
                e => e.date === date.format('YYYY-MM-DD') && e.time === time
              );
              return (
                <View key={date.toString()} style={styles.gridCell}>
                  {event && (
                    <View style={styles.eventCard}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

/* -------------------------------
   DAY VIEW
--------------------------------*/
const DayView: React.FC<DayViewProps & { setSelectedDate: React.Dispatch<React.SetStateAction<string>> }> = ({ selectedDate, setSelectedDate }) => {
  const startOfWeek = dayjs(selectedDate).startOf('week');
  const days = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));

  const hours = Array.from({ length: 12 }).map((_, i) => 8 + i); // 8:00 - 19:00

  const events = [
    { title: 'Team Meeting', time: '10:00' },
    { title: 'Lunch', time: '12:00' },
    { title: 'Project Review', time: '15:00' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Week Header */}
      <View style={styles.weekHeaderRow}>
        <View style={styles.timeColumnHeader} /> {/* Empty left corner */}
        {days.map(date => (
          <TouchableOpacity
            key={date.format('YYYY-MM-DD')}
            style={[styles.dayHeaderCell, date.isSame(selectedDate) && styles.activeDayHeader]}
            onPress={() => setSelectedDate(date.format('YYYY-MM-DD'))}
          >
            <Text style={styles.dayName}>{date.format('ddd')}</Text>
            <Text style={styles.dayNumber}>{date.format('D')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline Body */}
      <ScrollView style={{ flex: 1 }}>
        {hours.map(hour => {
          const event = events.find(e => e.time.startsWith(hour.toString()));
          return (
            <View key={hour} style={styles.gridRow}>
              {/* Time column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>{hour}:00</Text>
              </View>

              {/* Single day column */}
              <View style={styles.gridCell}>
                {event && (
                  <View style={styles.eventCard}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

/* -------------------------------
   STYLES
--------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },

  // Filter Bar
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeButton: { backgroundColor: '#007bff', borderColor: '#007bff' },
  filterText: { color: '#333', fontWeight: '500' },
  activeText: { color: '#fff' },

  /* WEEK VIEW */
  weekWrapper: { flex: 1 },
  weekHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  timeColumnHeader: { width: 60 },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  activeDayHeader: { backgroundColor: '#007bff22', borderBottomWidth: 2, borderBottomColor: '#007bff' },
  dayName: { fontSize: 12, color: '#333' },
  dayNumber: { fontSize: 14, fontWeight: 'bold', color: '#000' },

  gridRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#eee' },
  timeColumn: { width: 60, alignItems: 'center', justifyContent: 'center' },
  timeLabel: { fontSize: 12, color: '#888' },
  gridCell: {
    flex: 1,
    height: 60,
    borderLeftWidth: 0.5,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    backgroundColor: '#007bff',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  eventTitle: { color: '#fff', fontSize: 10, textAlign: 'center' },

  /* DAY VIEW */
  dayContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dayHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
});

export default CalendarScreen;
