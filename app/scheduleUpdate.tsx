import BasicHeader from "@/components/app-headers/basic-header";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Image,
} from "react-native";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  color: string;
  isEvent?: boolean;
}

interface EventPosition {
  top: number;
  height: number;
}

type CalendarView = "day" | "week" | "month";

const TODAY = new Date();
const HOURS_IN_DAY = 24;
const HOUR_HEIGHT = 60;
const DAYS_IN_WEEK = 7;
const MONTH_GRID_HORIZONTAL_PADDING = 0;

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "Philosophy",
    description: "Video call link: https://meet.google.com/ich-hjrb-rpq",
    start: "2025-10-06 13:00",
    end: "2025-10-06 14:30",
    color: "#0095ffff",
  },
  {
    id: 7,
    title: "Create your first Website",
    start: "2025-10-06 00:00",
    end: "2025-10-06 23:59",
    color: "#ff0026ff",
    isEvent: true,
  },
  {
    id: 8,
    title: "Robotics",
    start: "2025-10-07 11:00",
    end: "2025-10-07 12:59",
    color: "#ff4d00ff",
    isEvent: true,
  },
  {
    id: 9,
    title: "UI",
    description: "Video call link: https://meet.google.com/ich-hjrb-rpq",
    start: "2025-10-10 11:00",
    end: "2025-10-10 12:30",
    color: "#ff6600ff",
  },
  {
    id: 10,
    title: "UX",
    description: "Video",
    start: "2025-10-10 11:00",
    end: "2025-10-10 12:30",
    color: "#0400ffff",
  },
  {
    id: 11,
    title: "Mobile",
    start: "2025-10-07 11:00",
    end: "2025-10-07 12:59",
    color: "#166fff98",
    isEvent: true,
  },
  {
    id: 12,
    title: "AU",
    description: "Video",
    start: "2025-10-10 11:00",
    end: "2025-10-10 12:30",
    color: "#ff0f0fff",
  },
  {
    id: 13,
    title: "EE",
    description: "Video",
    start: "2025-10-10 11:00",
    end: "2025-10-10 12:30",
    color: "#02a21dff",
  },
  {
    id: 14,
    title: "Meeting 1",
    description: "Video",
    start: "2025-10-13 09:00",
    end: "2025-10-13 10:30",
    color: "#ff0b0bff",
  },
  {
    id: 15,
    title: "Team Sync",
    description: "Video",
    start: "2025-10-13 14:00",
    end: "2025-10-13 15:30",
    color: "#4CAF50",
  },
  {
    id: 16,
    title: "Project Review",
    description: "Video",
    start: "2025-10-13 11:00",
    end: "2025-10-13 12:30",
    color: "#9C27B0",
  },
];

const WEEK_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (date: Date): (Date | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

const getWeekDays = (date: Date): Date[] => {
  const dayOfWeek = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);

  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return day;
  });
};

const getEventsForDate = (
  date: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  const dateStr = formatDate(date);
  return events.filter((event) => event.start.split(" ")[0] === dateStr);
};

const getEventPosition = (event: CalendarEvent): EventPosition => {
  const [, startTime] = event.start.split(" ");
  const [startHour, startMin] = startTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;

  const [, endTime] = event.end.split(" ");
  const [endHour, endMin] = endTime.split(":").map(Number);
  const endMinutes = endHour * 60 + endMin;

  const duration = endMinutes - startMinutes;

  return {
    top: (startMinutes / 60) * HOUR_HEIGHT,
    height: (duration / 60) * HOUR_HEIGHT,
  };
};

const organizeEventsIntoColumns = (
  events: CalendarEvent[]
): CalendarEvent[][] => {
  const eventColumns: CalendarEvent[][] = [];

  events.forEach((event) => {
    const pos = getEventPosition(event);
    let placed = false;

    for (const col of eventColumns) {
      const hasOverlap = col.some((existingEvent) => {
        const existingPos = getEventPosition(existingEvent);
        return !(
          pos.top + pos.height <= existingPos.top ||
          pos.top >= existingPos.top + existingPos.height
        );
      });

      if (!hasOverlap) {
        col.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      eventColumns.push([event]);
    }
  });

  return eventColumns;
};

const ScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(TODAY);
  const [view, setView] = useState<CalendarView>("month");
  const [showViewMenu, setShowViewMenu] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setContainerWidth(window.width);
    });

    return () => {
      clearInterval(timer);
      subscription?.remove();
    };
  }, []);

  const hours = useMemo(
    () => Array.from({ length: HOURS_IN_DAY }, (_, i) => i),
    []
  );

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const monthDays = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(TODAY));
  }, []);

  const changeDate = useCallback(
    (direction: number) => {
      const newDate = new Date(currentDate);

      if (view === "day") {
        newDate.setDate(newDate.getDate() + direction);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + direction * 7);
      } else if (view === "month") {
        newDate.setMonth(newDate.getMonth() + direction);
      }

      setCurrentDate(newDate);
    },
    [currentDate, view]
  );

  const getDisplayText = useCallback((): string => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
    }

    if (view === "week") {
      return currentDate.toLocaleString("default", {
        month: "long",
      });
    }

    if (view === "month") {
      return currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    return "";
  }, [currentDate, view]);

  const getTimeTrackPosition = useCallback((): number => {
    if (formatDate(currentTime) !== formatDate(currentDate)) {
      return -60;
    }

    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const totalMinutes = hour * 60 + minute;

    return (totalMinutes / 60) * HOUR_HEIGHT;
  }, [currentTime, currentDate]);

  const renderMonthView = () => {
    const cellWidth = (containerWidth - MONTH_GRID_HORIZONTAL_PADDING) / 7;

    return (
      <View style={styles.monthContainer}>
        <View style={styles.weekDaysHeader}>
          {WEEK_DAY_NAMES.map((day, i) => (
            <View key={i} style={[styles.weekDayCell, { width: cellWidth }]}>
              <Text
                style={[
                  styles.weekDayText,
                  (i === 0 || i === WEEK_DAY_NAMES.length - 1) && {
                    color: "#A6A6A6",
                  },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.monthGrid}>
          {monthDays.map((day, i) => {
            const events = day ? getEventsForDate(day, SAMPLE_EVENTS) : [];

            const isToday = day && formatDate(day) === formatDate(TODAY);
            const isSelected =
              day && formatDate(day) === formatDate(currentDate);

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.monthDayCell,
                  { width: cellWidth - 0.01, height: cellWidth / 1.4 },
                  i >= 7 && styles.monthDayCellBorder,
                ]}
                onPress={() => day && setCurrentDate(new Date(day))}
                disabled={!day}
              >
                {day && (
                  <>
                    <View
                      style={[
                        styles.dayNumber,
                        isToday && styles.todayNumber,
                        isSelected && styles.selectedDayCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          (isToday || isSelected) && styles.highlightedDayText,
                          (day.getDay() === 0 || day.getDay() === 6) && {
                            color: "#A6A6A6",
                          },
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </View>

                    <View style={styles.monthEventTagsHorizontal}>
                      {events.slice(0, 4).map((event) => (
                        <View
                          key={event.id}
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
        {/* Selected Date View */}
        {currentDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateText}>
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>

            <ScrollView style={styles.eventScroll}>
              {/* All-day Event */}
              {SAMPLE_EVENTS.some(
                (event) =>
                  event.start.split(" ")[0] === formatDate(currentDate) &&
                  event.isEvent
              ) ? (
                <View style={styles.allDayEvent}>
                  <Text style={styles.allDayEventTitle}>
                    {SAMPLE_EVENTS.find(
                      (event) =>
                        event.start.split(" ")[0] === formatDate(currentDate) &&
                        event.isEvent
                    )?.title || "All-day Event"}
                  </Text>
                </View>
              ) : null}

              {/* Event List */}
              {SAMPLE_EVENTS.filter(
                (event) =>
                  event.start.split(" ")[0] === formatDate(currentDate) &&
                  !event.isEvent
              ).map((event) => {
                const [startTime] = event.start.split(" ")[1].split(":");
                const [endTime] = event.end.split(" ")[1].split(":");
                return (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventTime}>
                      {startTime}:00 - {endTime}:00
                    </Text>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.description && (
                        <Text
                          style={styles.eventDescription}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {event.description}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Show Empty if no events */}
              {!SAMPLE_EVENTS.some(
                (event) => event.start.split(" ")[0] === formatDate(currentDate)
              ) && <Text style={styles.emptyText}>No events here</Text>}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    return (
      <View style={styles.weekContainer}>
        <View style={styles.allDaySection}>
          {weekDays.map((day, i) => {
            const events = getEventsForDate(day, SAMPLE_EVENTS).filter(
              (e) => e.isEvent
            );
            const isToday = formatDate(day) === formatDate(TODAY);
            const isSelected = formatDate(day) === formatDate(currentDate);

            return (
              <TouchableOpacity
                key={i}
                style={styles.allDayCell}
                onPress={() => setCurrentDate(new Date(day))}
              >
                <View style={styles.weekDayHeader}>
                  <Text
                    style={[
                      styles.weekDayLabel,
                      (i === 0 || i === WEEK_DAY_NAMES.length - 1) && {
                        color: "#A6A6A6",
                      },
                    ]}
                  >
                    {WEEK_DAY_NAMES[i]}
                  </Text>
                  <View
                    style={[
                      styles.weekDayNumber,
                      isToday && styles.todayCircle,
                      isSelected && styles.selectedDayCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayNumberText,
                        (isToday || isSelected) && styles.highlightedDayText,
                        (i === 0 || i === WEEK_DAY_NAMES.length - 1) && {
                          color: "#A6A6A6",
                        },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </View>

                {events.map((event) => (
                  <View
                    key={event.id}
                    style={[
                      styles.allDayEventBar,
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
                const events = getEventsForDate(day, SAMPLE_EVENTS).filter(
                  (e) => !e.isEvent
                );

                const eventColumns = organizeEventsIntoColumns(events);

                return (
                  <View key={i} style={styles.dayColumn}>
                    {hours.map((_, idx) => (
                      <View key={idx} style={styles.hourCell} />
                    ))}

                    {eventColumns.map((col, colIndex) =>
                      col.map((event) => {
                        const pos = getEventPosition(event);
                        const widthPercent = 100 / eventColumns.length;

                        return (
                          <TouchableOpacity
                            key={event.id}
                            style={[
                              styles.event,
                              {
                                top: pos.top,
                                height: pos.height,
                                left: `${colIndex * widthPercent}%`,
                                width: `${widthPercent}%`,
                                backgroundColor: event.color,
                              },
                            ]}
                          >
                            <Text style={styles.eventTitle} numberOfLines={1}>
                              {event.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                );
              })}
            </View>

            {formatDate(currentDate) === formatDate(TODAY) ? (
              <View style={[styles.timeTrack, { top: getTimeTrackPosition() }]}>
                <Text style={styles.timeTrackText}>
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
                <View style={styles.timeTrackLine} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate, SAMPLE_EVENTS);
    const allDayEvents = events.filter((e) => e.isEvent);
    const timedEvents = events.filter((e) => !e.isEvent);

    return (
      <View style={styles.dayContainer}>
        <View style={styles.dayWeekHeader}>
          {weekDays.map((day, i) => {
            const isToday = formatDate(day) === formatDate(TODAY);
            const isSelected = formatDate(day) === formatDate(currentDate);

            return (
              <TouchableOpacity
                key={i}
                style={styles.dayHeaderCell}
                onPress={() => setCurrentDate(new Date(day))}
              >
                <Text
                  style={[
                    styles.dayHeaderLabel,
                    (i === 0 || i === WEEK_DAY_NAMES.length - 1) && {
                      color: "#A6A6A6",
                    },
                  ]}
                >
                  {WEEK_DAY_NAMES[i]}
                </Text>
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
                      (isToday || isSelected) && styles.highlightedDayText,
                      (i === 0 || i === WEEK_DAY_NAMES.length - 1) && {
                        color: "#A6A6A6",
                      },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {allDayEvents.length > 0 && (
          <View style={styles.eventSection}>
            {allDayEvents.map((event) => (
              <View
                key={event.id}
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

              {(() => {
                const eventColumns = organizeEventsIntoColumns(timedEvents);

                return eventColumns.map((col, colIndex) =>
                  col.map((event) => {
                    const pos = getEventPosition(event);
                    const widthPercent = 100 / eventColumns.length;

                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.dayEvent,
                          {
                            top: pos.top,
                            height: pos.height,
                            left: `${colIndex * widthPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: event.color,
                          },
                        ]}
                      >
                        <Text style={styles.eventTitle} numberOfLines={1}>
                          {event.title}
                        </Text>
                        {event.description && (
                          <Text
                            style={styles.eventDescription}
                            numberOfLines={3}
                          >
                            {event.description}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                );
              })()}
            </View>

            {formatDate(currentDate) === formatDate(TODAY) && (
              <View style={[styles.timeTrack, { top: getTimeTrackPosition() }]}>
                <Text style={styles.timeTrackText}>
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
                <View style={styles.timeTrackLine} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.fullContainer}>
      <BasicHeader title="Schedule" isNavigateBack={false} onRightPress={()=>{
        Alert.alert("This feature is coming soon!");
      }} rightIcon={
      <View>
       <Image
        source={require('../../../assets/icons/tooltip.png')}
        style={{
    width: 24,
    height: 24
        }}
      />
      </View>
    }/>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>

          <Text
            style={styles.dateDisplay}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getDisplayText()}
          </Text>

          <TouchableOpacity onPress={() => changeDate(1)}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewMenuContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setShowViewMenu(!showViewMenu)}
          >
            <View style={styles.viewButtonContent}>
              <Text style={styles.viewButtonText}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </TouchableOpacity>

          {showViewMenu && (
            <View style={styles.viewMenu}>
              {(["day", "week", "month"] as CalendarView[]).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.viewMenuItem}
                  onPress={() => {
                    setView(v);
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

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container
  fullContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  // Header section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1DA1F2",
    padding: 10,
    paddingTop: 60,
    height: 120,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  infoIcon: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  // Control bar (navigation and view selector)
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    gap: 8,
    flexWrap: "wrap",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    flexShrink: 1,
  },
  todayButtonText: {
    fontSize: 14,
    color: "#333",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: 100,
  },
  navArrow: {
    fontSize: 24,
    color: "#666",
    paddingHorizontal: 6,
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    maxWidth: "100%",
  },
  viewMenuContainer: {
    position: "relative",
    flexShrink: 1,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    marginTop: 1,
  },
  viewMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 12,
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

  // Month view
  monthContainer: {
    flex: 1,
    borderRadius: 16,
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
    alignItems: "center",
    justifyContent: "center",
  },
  monthDayCellBorder: {
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  todayNumber: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
  },
  dayNumberText: {
    fontSize: 12,
    color: "#333",
  },
  highlightedDayText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  selectedDayCircle: {
    backgroundColor: "#2196F3",
    borderRadius: 16,
  },
  monthEventTagsHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  monthEventDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  // Selected Date View
  selectedDateContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  eventScroll: {
    flex: 1,
  },
  allDayEvent: {
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  allDayEventTitle: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "600",
  },
  eventList: {
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTime: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  eventContent: {
    flex: 1,
    borderTopColor: "#b9ca00ff",
  },
  eventTitle: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
  // Week view
  weekContainer: {
    flex: 1,
    backgroundColor: "#FFF",
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
  todayCircle: {
    backgroundColor: "#FF6B35",
  },
  weekDayNumberText: {
    fontSize: 14,
    color: "#333",
  },
  allDayEventBar: {
    borderRadius: 12,
    padding: 3,
    marginVertical: 1,
  },
  allDayEventText: {
    color: "#fff",
    fontSize: 12,
  },

  // Shared time grid (Week and Day views)
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

  // Event styles (Week and Day views)
  event: {
    position: "absolute",
    left: 2,
    right: 2,
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },

  // Day view
  dayContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
  },
  dayWeekHeader: {
    flexDirection: "row",
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
    color: "#FFF",
    fontWeight: "600",
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

  // Live time tracker
  timeTrack: {
    position: "absolute",
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeTrackLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ff5f5fff",
  },
  timeTrackText: {
    top: -10,
    fontSize: 12,
    color: "#ffffff",
    marginLeft: 4,
    backgroundColor: "#ff5454ff",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 12,
  },
});

export default ScheduleView;
