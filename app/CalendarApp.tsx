import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Set to October 2025
const TODAY = new Date();

// Sample events for October 2025
const sampleEvents = [
  {
    id: 1,
    title: "Philosophy",
    description: "Video call link: https://meet.google.com/ich-hjrb-rpq",
    start: `2025-10-06 08:00`,
    end: `2025-10-06 09:30`,
    color: "#0092fb3d",
  },
  {
    id: 7,
    title: "Create your first Website",
    start: `2025-10-06 00:00`,
    end: `2025-10-06 23:59`,
    color: "#ff002637",
    isEvent: true,
  },
  {
    id: 8,
    title: "Robotics",
    start: `2025-10-07 00:00`,
    end: `2025-10-07 23:59`,
    color: "#ff4d0043",
    isEvent: true,
  },
  // {
  //   id: 9,
  //   title: "AI",
  //   start: `2025-10-07 13:00`,
  //   end: `2025-10-07 14:59`,
  //   color: "#00ff2243",
  //   isEvent: true,
  // },
  // {
  //   id: 10,
  //   title: "UX|UI",
  //   start: `2025-10-07 15:00`,
  //   end: `2025-10-07 17:59`,
  //   color: "#00c8ff43",
  //   isEvent: true,
  // },
  // ... other events
];

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [showViewMenu, setShowViewMenu] = useState(false);

  const hours = Array.from({ length: 19 }, (_, i) => 5 + i); // 5AM - 11PM

  // -------------------------------
  // Utility functions
  // -------------------------------

  // Get all days of the current month
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  // Get the 7 days of the week for a given date
  const getWeekDays = (date: Date): Date[] => {
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  };

  // Format a date as YYYY-MM-DD
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  // Get events for a specific date
  const getEventsForDate = (date: Date) =>
    sampleEvents.filter(
      (event) => event.start.split(" ")[0] === formatDate(date)
    );

  // Get position of an event in the day/week grid
  const getEventPosition = (event: any) => {
    const [, startTime] = event.start.split(" ");
    const [startHour, startMin] = startTime.split(":").map(Number);
    const startMinutes = (startHour - 6) * 60 + startMin;

    const [, endTime] = event.end.split(" ");
    const [endHour, endMin] = endTime.split(":").map(Number);
    const endMinutes = (endHour - 6) * 60 + endMin;

    const duration = endMinutes - startMinutes;
    return {
      top: (startMinutes / 60) * 60,
      height: (duration / 60) * 60,
    };
  };

  // Navigation
  const goToToday = () => setCurrentDate(TODAY);
  const changeDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() + direction);
    else if (view === "week")
      newDate.setDate(newDate.getDate() + direction * 7);
    else if (view === "month") newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Display text for header
  const getDisplayText = () => {
    if (view === "day") return currentDate.toDateString();

    if (view === "week") {
      const weekDays = getWeekDays(currentDate);
      const firstDay = weekDays[0];
      const lastDay = weekDays[6];

      // Check if the week spans two months
      if (firstDay.getMonth() !== lastDay.getMonth()) {
        const firstMonth = firstDay.toLocaleString("default", {
          month: "long",
        });
        const secondMonth = lastDay.toLocaleString("default", {
          month: "long",
        });
        const year = firstDay.getFullYear(); // Assuming the week is within the same year
        return `${firstMonth} - ${secondMonth} ${year}`;
      } else {
        return currentDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      }
    }
    if (view === "month")
      return currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

    return "";
  };

  // ========================================
  // =============== MONTH VIEW =============
  // ========================================

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <View style={styles.monthContainer}>
        {/* Weekday header */}
        <View style={styles.weekDaysHeader}>
          {weekDays.map((day, i) => (
            <View key={i} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Month grid */}
        <View style={styles.monthGrid}>
          {days.map((day, i) => {
            const events = day
              ? getEventsForDate(day).filter((e) => e.isEvent)
              : [];
            const isToday = day && formatDate(day) === formatDate(TODAY);

            return (
              <TouchableOpacity
                key={i}
                style={styles.monthDayCell}
                onPress={() => day && (setCurrentDate(day), setView("day"))}
              >
                {day && (
                  <>
                    <View
                      style={[styles.dayNumber, isToday && styles.todayNumber]}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          isToday && styles.todayNumberText,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </View>
                    <View style={styles.monthEventTagsHorizontal}>
                      {events.map((event, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.monthEventDot,
                            { backgroundColor: event.color },
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ========================================
  // ================ WEEK VIEW =============
  // ========================================

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <View style={styles.weekContainer}>
        {/* All-day events section */}
        <View style={styles.allDaySection}>
          {weekDays.map((day, i) => {
            const events = getEventsForDate(day).filter((e) => e.isEvent);
            const isToday = formatDate(day) === formatDate(TODAY);

            return (
              <TouchableOpacity
                key={i}
                style={styles.allDayCell}
                onPress={() => {
                  setCurrentDate(day);
                  setView("day");
                }}
              >
                <View style={styles.weekDayHeader}>
                  <Text style={styles.weekDayLabel}>{dayNames[i]}</Text>
                  <View
                    style={[
                      styles.weekDayNumber,
                      isToday && styles.todayCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayNumberText,
                        isToday && styles.todayText,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </View>
                {events.map((event, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.allDayEvent,
                      { backgroundColor: event.color },
                    ]}
                  >
                    <Text style={styles.allDayEventText} numberOfLines={1}>
                      {event.title}
                    </Text>
                  </View>
                ))}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Timed events */}
        <ScrollView style={styles.timeGridScroll}>
          <View style={styles.timeGrid}>
            <View style={styles.timeColumn}>
              {hours.map((hour) => (
                <View key={hour} style={styles.timeSlot}>
                  <Text style={styles.timeText}>
                    {hour % 12 || 12} {hour < 12 ? "AM" : "PM"}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {weekDays.map((day, i) => {
                const events = getEventsForDate(day).filter((e) => !e.isEvent);

                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.dayColumn}
                    onPress={() => {
                      setCurrentDate(day);
                      setView("day");
                    }}
                  >
                    {hours.map((_, idx) => (
                      <View key={idx} style={styles.hourCell} />
                    ))}
                    {events.map((event, idx) => {
                      const pos = getEventPosition(event);
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.event,
                            {
                              top: pos.top,
                              height: pos.height,
                              backgroundColor: event.color,
                            },
                          ]}
                        >
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          {event.description && (
                            <Text
                              style={styles.eventDescription}
                              numberOfLines={2}
                            >
                              {event.description}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // ========================================
  // ================ DAY VIEW ==============
  // ========================================

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const allDayEvents = events.filter((e) => e.isEvent);
    const timedEvents = events.filter((e) => !e.isEvent);
    const weekDays = getWeekDays(currentDate);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <View style={styles.dayContainer}>
        {/* Week day headers */}
        <View style={styles.dayWeekHeader}>
          {weekDays.map((day, i) => {
            const isToday = formatDate(day) === formatDate(TODAY);
            const isSelected = formatDate(day) === formatDate(currentDate);

            return (
              <TouchableOpacity
                key={i}
                style={styles.dayHeaderCell}
                onPress={() => setCurrentDate(day)}
              >
                <Text style={styles.dayHeaderLabel}>{dayNames[i]}</Text>
                <View
                  style={[
                    styles.dayHeaderNumber,
                    isToday && styles.todayCircle,
                    isSelected && styles.selectedDayCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayHeaderNumberText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <View style={styles.eventSection}>
            {allDayEvents.map((event, idx) => (
              <View
                key={idx}
                style={[
                  styles.dayAllDayEvent,
                  { backgroundColor: event.color },
                ]}
              >
                <Text style={styles.dayAllDayEventText}>{event.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Timed events */}
        <ScrollView style={styles.dayTimeScroll}>
          <View style={styles.dayTimeGrid}>
            <View style={styles.timeColumn}>
              {hours.map((hour) => (
                <View key={hour} style={styles.timeSlot}>
                  <Text style={styles.timeText}>
                    {hour % 12 || 12} {hour < 12 ? "AM" : "PM"}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dayEventsColumn}>
              {hours.map((_, idx) => (
                <View key={idx} style={styles.hourCell} />
              ))}
              {timedEvents.map((event, idx) => {
                const pos = getEventPosition(event);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayEvent,
                      {
                        top: pos.top,
                        height: pos.height,
                        backgroundColor: event.color,
                      },
                    ]}
                  >
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={3}>
                        {event.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // ========================================
  // ================ RENDER =================
  // ========================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      {/* Controls: Today, Navigation, View */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateDisplay}>{getDisplayText()}</Text>
          <TouchableOpacity onPress={() => changeDate(1)}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* View selection */}
        <View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setShowViewMenu(!showViewMenu)}
          >
            <Text style={styles.viewButtonText}>
              {view.charAt(0).toUpperCase() + view.slice(1)} ▼
            </Text>
          </TouchableOpacity>
          {showViewMenu && (
            <View style={styles.viewMenu}>
              {["day", "week", "month"].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.viewMenuItem}
                  onPress={() => {
                    setView(v as any);
                    setShowViewMenu(false);
                  }}
                >
                  <Text style={styles.viewMenuText}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Render views */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: "100%",
  },
  header: {
    backgroundColor: "#FFF",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  todayButtonText: {
    fontSize: 14,
    color: "#333",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navArrow: {
    fontSize: 24,
    color: "#666",
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#333",
  },
  viewMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    zIndex: 1000,
  },
  viewMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  viewMenuText: {
    fontSize: 14,
    color: "#333",
  },
  // ============== MONTH ==============
  monthContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  weekDaysHeader: {
    flexDirection: "row",
  },
  weekDayCell: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  weekDayText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  monthDayCell: {
    width: width / 7,
    height: 80,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  todayNumber: {
    backgroundColor: "#FF6B35",
  },
  dayNumberText: {
    fontSize: 12,
    color: "#333",
  },
  todayNumberText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  monthEventTagsHorizontal: {
    flexDirection: "row", // horizontal layout
    flexWrap: "wrap", // wrap if too many dots
    marginTop: 4,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  monthEventDot: {
    width: 8,
    height: 8,
    borderRadius: 4, // makes it circular
    marginRight: 2, // horizontal spacing between dots
    marginBottom: 2, // spacing for wrap
  },

  monthEventTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 1,
  },
  monthEventText: {
    fontSize: 10,
    color: "#333",
  },

  // ============== DAY ==============
  weekContainer: {
    flex: 1,
  },
  allDaySection: {
    flexDirection: "row",
    borderBottomWidth: 0.2,
    borderBottomColor: "#E0E0E0",
    paddingLeft: 60,
  },
  allDayCell: {
    flex: 1,
    padding: 4,
  },
  weekDayHeader: {
    alignItems: "center",
    marginBottom: 4,
  },
  weekDayLabel: {
    fontSize: 12,
    color: "#666",
  },
  weekDayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  // ============== DAY ==============
  todayCircle: {
    backgroundColor: "#FF6B35",
  },
  selectedDayCircle: {
    backgroundColor: "#2196F3",
  },
  weekDayNumberText: {
    fontSize: 14,
    color: "#333",
  },
  todayText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  selectedDayText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  allDayEvent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 2,
  },
  allDayEventText: {
    fontSize: 10,
    color: "#333",
  },
  timeGridScroll: {
    flex: 1,
  },
  timeGrid: {
    flexDirection: "row",
  },
  timeColumn: {
    width: 60,
  },
  timeSlot: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderRightColor: "#E0E0E0",
    borderTopColor: "#E0E0E0",
  },
  timeText: {
    fontSize: 11,
    color: "#666",
  },
  daysGrid: {
    flex: 1,
    flexDirection: "row",
  },
  dayColumn: {
    flex: 1,
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  hourCell: {
    height: 60,
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
  },
  event: {
    position: "absolute",
    left: 2,
    right: 2,
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
  },
  eventDescription: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  dayContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  dayWeekHeader: {
    flexDirection: "row",
    // borderBottomWidth: 1,
    // borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
    backgroundColor: "#FFF",
    paddingLeft: 60,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  dayHeaderNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  dayHeaderNumberText: {
    fontSize: 14,
    color: "#333",
  },
  eventSection: {
    padding: 8,
    borderBottomWidth: 0.2,
    borderBottomColor: "#E0E0E0",
  },
  dayAllDayEvent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  dayAllDayEventText: {
    fontSize: 14,
    color: "#333",
  },
  dayTimeScroll: {
    flex: 1,
  },
  dayTimeGrid: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  dayEventsColumn: {
    flex: 1,
    position: "relative",
  },
  dayEvent: {
    position: "absolute",
    left: 8,
    right: 8,
    borderRadius: 4,
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
});

export default CalendarApp;
