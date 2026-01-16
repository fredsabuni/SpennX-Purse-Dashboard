"use client"

import * as React from "react"
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Box } from "@mui/material";

export interface CalendarProps {
  selected?: Date | null
  onChange?: (date: Date | null) => void
  selectsRange?: boolean
  startDate?: Date | null
  endDate?: Date | null
  onRangeChange?: (dates: [Date | null, Date | null]) => void
  monthsShown?: number
  inline?: boolean
  className?: string
}

export function Calendar({
  selected,
  onChange,
  selectsRange = false,
  startDate,
  endDate,
  onRangeChange,
  className,
}: CalendarProps) {

  const handleDateChange = (newDate: Date | null) => {
    if (selectsRange && onRangeChange) {
      if ((!startDate && !endDate) || (startDate && endDate)) {
        onRangeChange([newDate, null]);
      } else if (startDate && !endDate) {
        if (newDate && newDate < startDate) {
            onRangeChange([newDate, null]);
        } else {
            onRangeChange([startDate, newDate]);
        }
      } else {
        onRangeChange([newDate, null]);
      }
    } else {
      onChange?.(newDate);
    }
  }

  const value = selectsRange ? (endDate || startDate || null) : (selected || null);

  // Custom day renderer to highlight ranges
  function ServerDay(props: PickersDayProps) {
    const { day, outsideCurrentMonth, ...other } = props;

    let isSelected = false;
    let isRangeStart = false;
    let isRangeEnd = false;
    let isInRange = false;

    if (selectsRange && startDate) {
        const time = day.getTime();
        const start = startDate.getTime();
        const end = endDate?.getTime();

        if (time === start) isRangeStart = true;
        if (end && time === end) isRangeEnd = true;
        if (end && time > start && time < end) isInRange = true;
    }

    const dayStyle = {
        ...(isInRange && {
            borderRadius: 0,
            backgroundColor: 'rgba(49, 124, 255, 0.1)',
            '&:hover': {
                backgroundColor: 'rgba(49, 124, 255, 0.2)',
            },
        }),
        ...(isRangeStart && {
            borderRadius: '50% 0 0 50%',
            backgroundColor: '#317CFF',
            color: 'white',
        }),
        ...(isRangeEnd && {
            borderRadius: '0 50% 50% 0',
            backgroundColor: '#317CFF',
            color: 'white',
        }),
        ...((isRangeStart && isRangeEnd) && {
             borderRadius: '50%',
        })
    };
    
    // MUI handles selected state for 'value', but we want custom range viz
    // So we can override styles if needed, or pass selected={false} to disable default selection logic if conflicting.
    // Actually, PickersDay 'selected' prop is controlled by DateCalendar usually. 
    // We can rely on css classes or style overrides.

    return (
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={dayStyle}
      />
    );
  }

  return (
    <Box className={className} sx={{ 
        '& .MuiDateCalendar-root': { width: '100%', maxHeight: 'none', margin: 0 },
        '& .MuiPickersCalendarHeader-root': { paddingLeft: 2, paddingRight: 2 },
    }}>
      <DateCalendar
        value={value}
        onChange={handleDateChange}
        views={['year', 'month', 'day']}
        showDaysOutsideCurrentMonth
        slots={{
            day: selectsRange ? ServerDay : undefined
        }}
      />
    </Box>
  )
}
Calendar.displayName = "Calendar"
