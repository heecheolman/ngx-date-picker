import { Component, Input, OnInit } from '@angular/core';
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

interface IDateValue {
  from: any;
  to: any;
}

type PanelType = keyof typeof Panels;

const localeConfig = {
  locale: ko,
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
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
  private _dayOfWeek: any;
  get dayOfWeek() {
    if (!Array.isArray(this.monthDays)) {
      return [];
    }
    const days = this.monthDays.slice(0, 7);
    const week = [];
    for (const day of days) {
      week.push({
        name: format(day.date, 'dd', localeConfig)
      });
    }
    return week;
  }

  monthDays: any[] = [];
  current: any;
  future = true;
  past = true;

  constructor() {
  }

  ngOnInit(): void {
    this.initDateValue();
    this.updateCalendarDays();
  }

  private initDateValue(): void {
    this.now = format(new Date(), 'yyyy-MM-dd', localeConfig);
    this.current = isValid(parse(this.dateValue.to, 'yyyy-MM-dd', new Date())) || this.now;
  }

  private updateCalendarDays() {
    const days = [];

    const firstDayOfMonth = startOfMonth(new Date(this.current));
    const lastDayOfMonth = endOfMonth(new Date(this.current));
    const firstWeekDay = startOfWeek(new Date(firstDayOfMonth));
    const lastWeekDay = endOfWeek(new Date(lastDayOfMonth));
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

    // calendarDays.
      // .map((date) => {
      //   return {
      //     date,
      //     currentMonth: isSameMonth(currentDate, date)
      //   };
      // });

    console.log('this.monthDays :: ', this.monthDays);
    // const days = [];
    // const lastDayOfMonth = endOfMonth(new Date(this.current));
    // const firstDayOfMonth = startOfMonth(new Date(this.current));
    // const nbDaysOfMonth = (+format(firstDayOfMonth, 'd', localeConfig) - 1) % 7;
    // const nowDate = new Date(this.now);
    // const currentDate = new Date(this.current);
    //
    // let day = subDays(firstDayOfMonth, nbDaysOfMonth);
    // while (isBefore(day, lastDayOfMonth) || days.length % 7 > 0) {
    //   days.push({
    //     date: day,
    //     stringDate: format(day, 'yyyy-MM-dd EE', localeConfig),
    //     selectable: (this.future && isAfter(day, nowDate))
    //       || (this.past && isBefore(day, nowDate))
    //       || isSameDay(day, nowDate),
    //     currentMonth: isSameMonth(currentDate, day),
    //   });
    //   day = addDays(day, 1);
    // }
    // this.monthDays = days;
    // console.log('this.current :: ', this.current);
    // console.log('this.monthDays :: ', this.monthDays);
  }

  onPanelChange(panel: Panels) {
    this.currentPanel = panel;
    console.log('this.currentPanel :: ', this.currentPanel);
  }

  onChangeMonth(diffMonth: number) {
    this.current = addMonths(new Date(this.current), diffMonth);
    this.updateCalendarDays();
  }
}
