import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { AppText, AppButton } from '.';

interface Props {
  visible: boolean;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  onClose: () => void;
  onConfirm: (start: Date | null, end: Date | null) => void;
  title?: string;
}

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parse = (s: string): Date => {
  const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
};

const DateRangePickerModal: React.FC<Props> = ({
  visible,
  initialStartDate = null,
  initialEndDate = null,
  onClose,
  onConfirm,
  title = 'Tarih Aralığı Seçin',
}) => {
  const [start, setStart] = useState<Date | null>(initialStartDate || null);
  const [end, setEnd] = useState<Date | null>(initialEndDate || null);

  useEffect(() => {
    if (visible) {
      setStart(initialStartDate || null);
      setEnd(initialEndDate || null);
    }
  }, [visible, initialStartDate, initialEndDate]);

  const onDayPress = (day: DateData) => {
    const d = parse(day.dateString);
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (start && !end) {
      if (d >= start) {
        setEnd(d);
      } else {
        setStart(d);
        setEnd(null);
      }
    }
  };

  const markedDates = useMemo(() => {
    const marks: any = {};
    if (start && end) {
      const current = new Date(start);
      while (current <= end) {
        const key = fmt(current);
        marks[key] = {
          selected: true,
          marked: false,
          startingDay: key === fmt(start),
          endingDay: key === fmt(end),
          color: '#9DB4C0',
          textColor: '#111827',
        };
        current.setDate(current.getDate() + 1);
      }
    } else if (start && !end) {
      const key = fmt(start);
      marks[key] = {
        selected: true,
        startingDay: true,
        endingDay: true,
        color: '#9DB4C0',
        textColor: '#111827',
      };
    }
    return marks;
  }, [start, end]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText variant="title" style={styles.title}>{title}</AppText>
          <Calendar
            onDayPress={onDayPress}
            markingType="period"
            markedDates={markedDates}
            enableSwipeMonths
            theme={{
              backgroundColor: '#EEF7FA',
              calendarBackground: '#EEF7FA',
              textSectionTitleColor: '#5A7C89',
              monthTextColor: '#424242',
              dayTextColor: '#374151',
              arrowColor: '#5A7C89',
              todayTextColor: '#D87070',
              selectedDayBackgroundColor: '#9DB4C0',
              selectedDayTextColor: '#111827',
            }}
            style={styles.calendar}
          />
          <View style={styles.actions}>
            <AppButton title="İptal" variant="secondary" onPress={onClose} style={styles.btnSecondary} />
            <AppButton
              title="Uygula"
              variant="primary"
              onPress={() => onConfirm(start, end)}
              style={styles.btnPrimary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '95%',
    backgroundColor: '#EEF7FA',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    textAlign: 'center',
    color: '#424242',
    marginBottom: 4,
  },
  calendar: {
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#C2DEE6',
    borderColor: '#C2DEE6',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#9DB4C0',
  },
});

export default DateRangePickerModal;
