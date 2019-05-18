import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-range-selector',
  templateUrl: './range-selector.component.html',
  styleUrls: ['./range-selector.component.scss']
})
export class RangeSelectorComponent implements OnInit, OnChanges {
  title = 'app';
  /**
   * Captures the current date i.e. today's date
   */
  public currentDate : moment.Moment = moment();
  /**
   * Captures number of days to be rendered in the calendar
   */
  public calendarDays : Array<any> = Array(42);
  /**
   * Captures first day of month i.e. Sun -0,Mon - 1,Tue-2,Wed-3,Thu-4,Fri-5,Sat-6
   */
  public startDayOfMonth : number = 0;
  /**
   * Captures first day that has to be displayed 
   */
  public startDayOfCalendar : moment.Moment;
  /**
   * Captures the index of the day from which the user wants to start the days of week i.e. Monday - 1,Tuesday - 2,Wednesday - 3,Thursday - 4,Friday - 5,Saturday - 6,Sunday - 0
   */
  @Input() indexOfStartingDay : number = 0;
  /**
   * Captures the width of the calendar grid, user can change it just by passing in the width
   */
  @Input() calendarGridWidth = '100%';
  /**
   * Captures the height of the calendar grid, user can change it just by passing in the height
   */
  @Input() calendarGridHeight = '100vh';
  /**
   * Headers to be displayed for each day of the week
   */
  public weekDayHeader = ['S','M','T','W','T','F','S'];
  /**
   * Captures the weeks cut out of the fetched dates of calendar
   */
  public weeksOfCurrentCalendarFetchedDates = [];
  /**
   * Notify container component of the selected date
   */
  @Output() sendSelectedDate : EventEmitter<any> = new EventEmitter();
  /**
   * Indicator whether past date can be selected 
   */
  @Input() restrictPastDateSelection : boolean = false;
  /**
   * Captures current month from date
   */
  public currentMonth : string = '';
  /**
   * Captures current year from date
   */
  public currentYear : string = ''; 
  /**
   * Captures the selected date, by default it is set to current date of month
   */
  public dateSelected = moment(this.currentDate);
  /**
   * Caprtures start date of range
   */
  public rangeSelectionStart;
  /**
   * Caprtures end date of range
   */
  public rangeSelectionEnd;
  /**
   * Captures all dates between start and end
   */
  public withinRangeDates = [];

  ngOnInit(){
    let splicedWeekHeaderDays = this.weekDayHeader.splice(0,this.indexOfStartingDay);
    this.weekDayHeader = [...this.weekDayHeader, ...splicedWeekHeaderDays];
    this.generateCalendar(this.currentDate);
  }

  ngOnChanges(){
    this.generateCalendar(this.currentDate);
  }
  /**
   * Fetches the dates that are to be rendered in the calendar
   * @param currentDate 
   */
  public generateCalendar(currentDate : moment.Moment) : void{
    this.startDayOfMonth = moment(currentDate).startOf('month').day();
    this.currentMonth = moment(currentDate).format('MMMM');
    this.currentYear = moment(currentDate).format('YYYY');
    this.calendarDays = Array(42);
    let start;
    if(this.indexOfStartingDay < this.startDayOfMonth) {
      this.startDayOfCalendar = moment(currentDate).startOf('month').subtract(this.startDayOfMonth - this.indexOfStartingDay,'days');
      start = this.startDayOfCalendar.date();
    }
    else {
      this.startDayOfCalendar = moment(currentDate).startOf('month').subtract(this.startDayOfMonth - (this.indexOfStartingDay - 7),'days');
      start = this.startDayOfCalendar.date();
    }
    /**
     * Looping over the calendar days array and creating a moment by adding the number of days to the start date
     */
    for(let index = 0 ; index < this.calendarDays.length ; index ++) {
      /**
       * Setting value for each element of array
       */
      const dateObj = {};
      dateObj['date'] = moment(this.startDayOfCalendar).date(start + index);
      dateObj['todaysDate'] = this.isTodaysDate(dateObj['date']);
      /**
       * Setting is selected to true by default for current date
       */
      if(!this.rangeSelectionStart && this.datesEqual(dateObj['date'], this.dateSelected)) {
        dateObj['rangeStart'] = true;
        this.rangeSelectionStart = dateObj;
      }
      else{
        if(this.rangeSelectionStart && this.datesEqual(dateObj['date'], this.rangeSelectionStart.date)){
          dateObj['rangeStart'] = true;
          this.rangeSelectionStart = dateObj;
        }
        else{
          dateObj['rangeStart'] = false;
        }
      }
      /**
       * Check if there is a range selected
       */
      if(!this.rangeSelectionEnd){
        dateObj['rangeEnd'] = false;
      }
      else{
        if(this.rangeSelectionEnd && this.datesEqual(dateObj['date'], this.rangeSelectionEnd.date)){
          dateObj['rangeEnd'] = true;
          this.rangeSelectionEnd = dateObj;
        }
        else{
          dateObj['rangeEnd'] = false;
        }
      }

      if(this.withinRangeDates.length){
        dateObj['inRange'] = this.isDateInRange(dateObj['date']);
        if(dateObj['inRange']){
          this.checkIfDateExistInRanges(dateObj);
        }
      }
      else{
        dateObj['inRange'] = false;
      }
      this.calendarDays[index] = dateObj;
    }
    this.convertToWeeks();
  }
  /**
   * Handler to convert the selected dates of the calendar into array of arrays
   */
  public convertToWeeks() : void {
    const weeksOfCalendar = [];
    for(let index = 0; index < this.calendarDays.length; index++) {
      weeksOfCalendar.push(this.calendarDays.splice(0,7));
    }
    this.weeksOfCurrentCalendarFetchedDates = weeksOfCalendar;
  }
  /**
   * Subtracts one month from the current date and generates calendar accordingly
   */
  public fetchPreviousMonthCalendar() : void{
    this.currentDate = moment(this.currentDate).subtract(1,'month');
    this.generateCalendar(this.currentDate);
  }
  /**
   * Adds one month to the current date and genertes calendar accordingly
   */
  public fetchNextMonthCalendar() : void{
    this.currentDate = moment(this.currentDate).add(1,'month');
    this.generateCalendar(this.currentDate);
  }
   /**
   * Check if date exists between in the array
   * @param date 
   */
  public checkIfDateExistInRanges(date){
    if(moment(date.date).isSameOrAfter(moment(this.withinRangeDates[0], 'day')) 
        && moment(date.date).isSameOrBefore(moment(this.withinRangeDates[this.withinRangeDates.length - 1]))){
      return;
    }
    this.withinRangeDates.push(date);
  }
  /**
   * Handler for the date selected
   * @param date 
   */
  public selectedDate(date) : void {
    if(this.restrictPastDateSelection){
      if(this.isPastDate(date)){
        return;
      }
    }
      this.resetSetSelected(date);
  }
  /**
   * Handler to check if date is in past
   * @param date 
   */
  public isPastDate(date) : boolean {
    return moment(date.date).isBefore(moment()) && !this.isTodaysDate(date.date);
  }
  /**
   * Handler to check if the date is of current month
   * @param date 
   */
  public isCurrentMonthDate(date : moment.Moment) : boolean{
    return moment(date).isSame(this.currentDate,'month');
  }
  /**
   * Handler to check if the date is today's date
   * @param date 
   */
  public isTodaysDate(date : moment.Moment) : boolean {
    return moment().isSame(moment(date),'day');
  }
  /**
   * Handler to check if two dates are equal
   * @param incomingDate 
   * @param comparisonDate 
   */
  public datesEqual(incomingDate : moment.Moment, comparisonDate : moment.Moment) : boolean {
    return moment(incomingDate).isSame(moment(comparisonDate), 'day');
  }
  /**
   * Checks if date is in between start and end date
   * @param date 
   */
  public isDateInRange(date) : boolean{
    /**
     * Checks if the end date is less than start date
     */
    if(moment(this.rangeSelectionEnd.date).isBefore(moment(this.rangeSelectionStart.date, 'day'))) {
      if(moment(date).isAfter(moment(this.rangeSelectionEnd.date, 'day')) && moment(date).isBefore(moment(this.rangeSelectionStart.date, 'day'))) {
        return true;
      }
    }
    else if(moment(date).isAfter(moment(this.rangeSelectionStart.date, 'day')) && moment(date).isBefore(moment(this.rangeSelectionEnd.date, 'day'))){
      return true;
    }
    else{
      return false;
    }
  }
  /**
   * Reset selected to false for the previously selected date
   */
  public resetSetSelected(date) : void {
    if(!this.rangeSelectionStart || !this.rangeSelectionEnd){
      if(!this.rangeSelectionStart){
        this.setStartEndSetter(date, 0);
      }
      else{
        this.setStartEndSetter(date, 1);
        this.sendSelectedDate.emit({start : this.rangeSelectionStart, end : this.rangeSelectionEnd});
        this.setStartEndSetter('', 2);
      }
    }
    else{
      this.rangeSelectionStart.rangeStart = false;
      this.rangeSelectionEnd.rangeEnd = false;
      this.rangeSelectionStart = '';
      this.rangeSelectionEnd = '';
      this.resetInRangeDates();
      this.resetSetSelected(date);
    }
  }
  /**
   * Reset in range status to false for previous in range dates
   */
  public resetInRangeDates(){
    for(let index =0 ; index < this.withinRangeDates.length ; index++){
      this.withinRangeDates[index]['inRange'] = false;
    }
  }
  /**
   * Sets range start and end properties value
   * @param date 
   * @param identifier 
   */
  public setStartEndSetter(date, identifier : number){
    for(let index = 0; index < this.weeksOfCurrentCalendarFetchedDates.length ; index++) {
      for(let key = 0; key < this.weeksOfCurrentCalendarFetchedDates[index].length; key++) {
        if( identifier === 0 && this.datesEqual(this.weeksOfCurrentCalendarFetchedDates[index][key].date, date.date)) {
          this.weeksOfCurrentCalendarFetchedDates[index][key].rangeStart = true;
          this.rangeSelectionStart = this.weeksOfCurrentCalendarFetchedDates[index][key];
        }
        else if(identifier === 1 && this.datesEqual(this.weeksOfCurrentCalendarFetchedDates[index][key].date === date.date)) {
          this.weeksOfCurrentCalendarFetchedDates[index][key].rangeEnd = true;
          this.rangeSelectionEnd =  this.weeksOfCurrentCalendarFetchedDates[index][key];
        }
        else if(identifier === 2){
          if(this.isDateInRange(this.weeksOfCurrentCalendarFetchedDates[index][key].date)){
            this.weeksOfCurrentCalendarFetchedDates[index][key]['inRange'] = true;
            this.withinRangeDates.push(this.weeksOfCurrentCalendarFetchedDates[index][key]);
          }
        }
      }
    }
  }
/**
 * Captures style for calendar grid
 */
  public stylesOfGrid() : Object {
    return {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : this.calendarGridWidth,
      'flexDirection' : 'row'
    }
  }
  /**
   * Captures top level header style
   */
  public topCalendarHeaderStyle() : Object {
    return {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : this.calendarGridWidth,
      'height' : (parseInt(this.calendarGridHeight) / 8) + 'vh',
      'flexDirection' : 'row'
    } 
  }
  /**
   * Captures each cell style in the grid
   */
  public cellStyle() : Object {
    return {
      'width' : (parseInt(this.calendarGridWidth) / 7) + '%',
      'height' : (parseInt(this.calendarGridHeight) / 8) + 'vh',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'cursor' : 'pointer'
    }
  }
  /**
   * Captures styles for previous and next button
   */
  public headerSideCellsStyle() : Object {
    return {
      'width' :  (parseInt(this.calendarGridWidth) / 7) + '%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center'
    }
  }
  /**
   * Captures styles for content in the top header
   */
  public headerContentStyle() : Object {
    return {
      'width' :  ((parseInt(this.calendarGridWidth) / 7) * 5) + '%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center'
    }
  }
  /**
   * Handler for not in the month dates
   */
  public notInMonthDatesCellStyle() : Object {
    return {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'color' : 'grey'
    }
  }
  /**
   * Handler for in month dates
   */
  public inMonthDatesCellStyle() : Object {
    return {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
    }
  }
  /**
   * Handler to set styles for selected date
   */
  public selectedDateStyle() : Object {
    return {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'color' : 'white',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'backgroundImage': ' linear-gradient(to right, rgba(0, 0, 0,1) 0%, rgba(63,81,181,1) 100%)',
      'borderRadius' : '5em'
    }
  }

  public inRangeStyles() : Object {
    return {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'color' : 'white',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'backgroundColor' : '#98AFC7'
    }
  }

}
