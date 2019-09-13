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
  isValid,
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
  @ViewChild('datePicker') elementRef: ElementRef<any>
  private now;

  @Input() dateValue: IDateValue = {
    from: null,
    to: null,
  };
  @Input() panel: PanelType = Panels.week;

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
    console.log('this.monthDays :: ', this.monthDays);
  }

  onPanelChange(panel: Panels) {
    this.currentPanel = panel;
    console.log('this.currentPanel :: ', this.currentPanel);
  }

  onChangeMonth(diffMonth: number) {
    this.current = addMonths(new Date(this.current), diffMonth);
    this.updateCalendarDays();
  }

  onSelectDay(date) {
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
    this.hoverRange = [this.dateValue.from, date];
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
}
