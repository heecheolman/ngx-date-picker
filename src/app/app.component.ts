import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ko } from 'date-fns/locale';
import {
  addDays, addMonths, eachDayOfInterval,
  endOfMonth, endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid, isWithinInterval,
  parse, parseISO,
  startOfMonth, startOfWeek,
  subDays
} from 'date-fns';

enum Panels {
  range = 'range',
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
}

enum DayOfWeek {
  SUN,
  MON,
  TUE,
  WED,
  THU,
  FRI,
  SAT
}

interface IDateValue {
  from: any;
  to: any;
}

type PanelType = keyof typeof Panels;

const localeConfig = {
  locale: ko,
};

const weekStartConfig = {
  weekStartsOn: DayOfWeek.MON
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('datePicker') elementRef: ElementRef<any>;
  private now;

  @Input() dateValue: IDateValue = {
    from: null,
    to: null,
  };
  @Input() panel: PanelType = Panels.range;

  panels: PanelType[] = [
    Panels.range,
    Panels.week,
    Panels.month,
    Panels.quarter,
    Panels.year,
  ];
  currentPanel: PanelType;
  monthDays: any[] = [];
  current: any;
  hoverRange: any[] = [];
  theme = {
    primary: '#3297DB',
    secondary: '#2D3E50',
    ternary: '#93A0BD',
    border: '#e6e6e6',
    light: '#ffffff',
    dark: '#000000',
    hovers: {
      day: '#CCC',
      range: '#e6e6e6'
    }
  };
  future = true;
  past = true;

  constructor() {
  }

  ngOnInit(): void {
    this.initDateValue();
    this.updateCalendarDays();
    this.cssProps();
  }

  private initDateValue(): void {
    this.now = format(new Date(), 'yyyy-MM-dd', localeConfig);
    this.current = isValid(parse(this.dateValue.to, 'yyyy-MM-dd', new Date())) || this.now;
  }

  private updateCalendarDays() {
    const firstDayOfMonth = startOfMonth(new Date(this.current));
    const lastDayOfMonth = endOfMonth(new Date(this.current));
    const firstWeekDay = startOfWeek(new Date(firstDayOfMonth), weekStartConfig);
    const lastWeekDay = endOfWeek(new Date(lastDayOfMonth), weekStartConfig);
    const currentDate = new Date(this.current);

    const calendarDays = eachDayOfInterval({
      start: firstWeekDay,
      end: lastWeekDay,
    });
    const sliceWeek = (days: any[], start = 0, weekCollection = []) => {
      if (start >= 40) {
        return weekCollection;
      }
      const week = days
        .slice(start, start + 7)
        .map(date => ({
          date,
          selectable: this.future && isAfter(new Date(date), new Date(this.now))
            || this.past && isBefore(new Date(date), new Date(this.now))
            || isSameDay(new Date(date), new Date(this.now)),
          currentMonth: isSameMonth(currentDate, date)
        }));
      const months = [
        ...weekCollection,
        week,
      ];
      return sliceWeek(days, start + 7, months);
    };

    this.monthDays = sliceWeek(calendarDays);
  }

  onPanelChange(panel: Panels) {
    this.currentPanel = panel;
    this.dateValue = {
      from: null,
      to: null
    };
  }

  onChangeMonth(diffMonth: number) {
    this.current = addMonths(new Date(this.current), diffMonth);
    this.updateCalendarDays();
  }

  onSelectDay(date) {
    if (this.currentPanel === Panels.week) {
      this.dateValue.from = startOfWeek(date, { weekStartsOn: DayOfWeek.MON });
      this.dateValue.to = endOfWeek(date, { weekStartsOn: DayOfWeek.MON });
      return;
    }
    if ((this.dateValue.from && this.dateValue.to) || (!this.dateValue.from && !this.dateValue.to)) {
      this.dateValue.from = date;
      this.dateValue.to = null;
    } else if (this.dateValue.from && !this.dateValue.to) {
      if (isBefore(date, this.dateValue.from)) {
        this.dateValue.from = date;
      } else {
        this.dateValue.to = date;
        this.hoverRange = [];
      }
    }
  }

  onHoverizeDay(date) {
    if (this.currentPanel !== Panels.week &&
      (!(this.dateValue.from && !this.dateValue.to) || (isBefore(new Date(date), this.dateValue.from)))) {
      this.hoverRange = [];
      return;
    }
    this.hoverRange = this.currentPanel === Panels.week
      ? [startOfWeek(date, { weekStartsOn: DayOfWeek.MON }), endOfWeek(date, { weekStartsOn: DayOfWeek.MON })]
      : [this.dateValue.from, date];
  }

  cssProps() {
    const styles = {
      '--primary-color': this.theme.primary,
      '--hover-day-color': this.theme.hovers.day,
      '--hover-range-color': this.theme.hovers.range,
      '--secondary-color': this.theme.secondary,
      '--ternary-color': this.theme.ternary,
      '--normal-color': this.theme.light,
      '--contrast-color': this.theme.dark,
      '--border-color': this.theme.border
    };

    Object.entries(styles).map(([key, style]) => this.elementRef.nativeElement.style.setProperty(key, style));
  }

  dayCssProvider(day): any {
    const classObj: any = {
      'is-current-month': false,
      'is-selected': false,
      'is-disabled': false,
      'is-today': false,
      'is-first-range': false,
      'is-edge-range': false,
      'is-last-range': false,
      'is-in-range': false,
    };
    const dayDate = new Date(day.date);
    const nowDate = new Date(this.now);
    if (day.currentMonth) {
      classObj['is-current-month'] = true;
    }
    if (
      this.dateValue.from && this.dateValue.to &&
      isWithinInterval(dayDate, {
        start: new Date(this.dateValue.from),
        end: new Date(this.dateValue.to),
      })
    ) {
      classObj['is-selected'] = true;
    }
    if (!day.selectable) {
      classObj['is-disabled'] = true;
    }
    if (isSameDay(dayDate, nowDate)) {
      classObj['is-today'] = true;
    }
    if (
      (!this.dateValue.to && isSameDay(dayDate, new Date(this.dateValue.from))) ||
      (this.dateValue.to && !this.dateValue.from && isSameDay(dayDate, this.dateValue.from) && isSameDay(dayDate, this.dateValue.to)) ||
      (this.dateValue.to && this.dateValue.from && isSameDay(dayDate, this.dateValue.from))
    ) {
      classObj['is-first-range'] = true;
      classObj['is-edge-range'] = true;
    }
    if (this.dateValue.to && isSameDay(dayDate, this.dateValue.to)) {
      classObj['is-last-range'] = true;
      classObj['is-edge-range'] = true;
    }

    if (
      this.hoverRange.length === 2 &&
      isWithinInterval(dayDate, {
        start: new Date(this.hoverRange[0]),
        end: new Date(this.hoverRange[1])
      })
    ) {
      classObj['is-in-range'] = true;
    }
    return classObj;
  }
}
