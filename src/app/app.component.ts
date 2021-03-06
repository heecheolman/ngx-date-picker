import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ko } from 'date-fns/locale';
import {
  addDays, addMonths, addYears, eachDayOfInterval,
  endOfMonth, endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid, isWithinInterval,
  parse, parseISO,
  startOfMonth, startOfWeek, startOfYear,
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

  sampleKoDate = format(new Date(), 'yyyy-MM-dd EE', { ...localeConfig });

  panels: PanelType[] = [
    Panels.range,
    Panels.week,
    Panels.month,
    Panels.quarter,
    Panels.year,
  ];
  currentPanel: PanelType;
  monthDays: any[] = [];
  yearMonths: any[] = [];
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
    this.onPanelChange(this.panel);
    this.cssProps();
  }

  private initDateValue(): void {
    this.now = format(new Date(), 'yyyy-MM-dd', localeConfig);
    this.current = isValid(parse(this.dateValue.to, 'yyyy-MM-dd', new Date())) || this.now;
  }

  private updateCalendar() {
    const firstDayOfMonth = startOfMonth(new Date(this.current));
    const lastDayOfMonth = endOfMonth(new Date(this.current));
    const firstWeekDay = startOfWeek(new Date(firstDayOfMonth), { ...weekStartConfig, ...localeConfig });
    const lastWeekDay = endOfWeek(new Date(lastDayOfMonth), { ...weekStartConfig, ...localeConfig });
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
  private updateMonthCalendar() {
    const months = [];
    let month = startOfYear(new Date(this.current));
    for (let i = 0; i < 12; i++) {
      months.push({
        date: month,
      });
      month = addMonths(month, 1);
    }
    this.yearMonths = months;
  }

  onPanelChange(panel: PanelType) {
    this.currentPanel = panel;
    switch (this.currentPanel) {
      case Panels.range:
      case Panels.day:
        this.updateCalendar();
        break;
      case Panels.month:
        this.updateMonthCalendar();
        break;
      default:
        this.updateCalendar();
    }
    this.dateValue = {
      from: null,
      to: null
    };
  }

  onChangeMonth(diffMonth: number) {
    this.current = addMonths(new Date(this.current), diffMonth);
    this.updateCalendar();
  }

  onChangeYear(diffYear: number) {
    this.current = addYears(new Date(this.current), diffYear);
    this.updateCalendar();
    this.updateMonthCalendar();
  }

  onSelectDay(date) {
    if (this.currentPanel === Panels.week) {
      this.dateValue.from = startOfWeek(date, { ...weekStartConfig, ...localeConfig });
      this.dateValue.to = endOfWeek(date, { ...weekStartConfig, ...localeConfig });
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

  onSelectMonth(month) {
    this.dateValue = {
      from: startOfMonth(month.date),
      to: endOfMonth(month.date)
    };
    this.current = this.dateValue.to;
  }

  onHoverizeDay(date) {
    if (this.currentPanel !== Panels.week &&
      (!(this.dateValue.from && !this.dateValue.to) || (isBefore(new Date(date), this.dateValue.from)))) {
      this.hoverRange = [];
      return;
    }
    this.hoverRange = this.currentPanel === Panels.week
      ? [startOfWeek(date, { ...weekStartConfig, ...localeConfig }), endOfWeek(date, { ...weekStartConfig, ...localeConfig })]
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

  dayCssProvider(day: any): any {
    const cssClassObj: any = {
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
      cssClassObj['is-current-month'] = true;
    }
    if (
      this.dateValue.from && this.dateValue.to &&
      isWithinInterval(dayDate, {
        start: new Date(this.dateValue.from),
        end: new Date(this.dateValue.to),
      })
    ) {
      cssClassObj['is-selected'] = true;
    }
    if (!day.selectable) {
      cssClassObj['is-disabled'] = true;
    }
    if (isSameDay(dayDate, nowDate)) {
      cssClassObj['is-today'] = true;
    }
    if (
      (!this.dateValue.to && isSameDay(dayDate, new Date(this.dateValue.from))) ||
      (this.dateValue.to && !this.dateValue.from && isSameDay(dayDate, this.dateValue.from) && isSameDay(dayDate, this.dateValue.to)) ||
      (this.dateValue.to && this.dateValue.from && isSameDay(dayDate, this.dateValue.from))
    ) {
      cssClassObj['is-first-range'] = true;
      cssClassObj['is-edge-range'] = true;
    }
    if (this.dateValue.to && isSameDay(dayDate, this.dateValue.to)) {
      cssClassObj['is-last-range'] = true;
      cssClassObj['is-edge-range'] = true;
    }

    if (
      this.hoverRange.length === 2 &&
      isWithinInterval(dayDate, {
        start: new Date(this.hoverRange[0]),
        end: new Date(this.hoverRange[1])
      })
    ) {
      cssClassObj['is-in-range'] = true;
    }
    return cssClassObj;
  }
  monthCssProvider(month: any): any {
    return {
      'is-selected': this.dateValue.from && this.dateValue.to && isWithinInterval(month.date, { start: this.dateValue.from, end: this.dateValue.to }),
    };
  }
}
