import { Component, Input, OnInit } from '@angular/core';
import { ko } from 'date-fns/locale';
import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  startOfMonth,
  subDays
} from 'date-fns';

enum DateRange {
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


type DateType = keyof typeof DateRange;

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
  @Input() panel: DateType = DateRange.range;

  panels: DateType[] = [
    DateRange.range,
    DateRange.week,
    DateRange.month,
    DateRange.quarter,
    DateRange.year,
  ];
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
    this.now = format(new Date(), 'yyyy-MM-dd');
    this.current = isValid(parse(this.dateValue.to, 'yyyy-MM-dd', new Date())) || this.now;
  }

  private updateCalendarDays() {
    const days = [];
    const lastDayOfMonth = endOfMonth(new Date(this.current));
    const firstDayOfMonth = startOfMonth(new Date(this.current));
    const nbDaysOfMonth = (+format(firstDayOfMonth, 'd') - 1) % 7;
    const nowDate = new Date(this.now);
    const currentDate = new Date(this.current);

    let day = subDays(firstDayOfMonth, nbDaysOfMonth);
    while (isBefore(day, lastDayOfMonth) || days.length % 7 > 0) {
      days.push({
        date: day,
        selectable: (this.future && isAfter(day, nowDate))
          || (this.past && isBefore(day, nowDate))
          || isSameDay(day, nowDate),
        currentMonth: isSameMonth(currentDate, day),
      });
      day = addDays(day, 1);
    }
    this.monthDays = days;
  }
}
