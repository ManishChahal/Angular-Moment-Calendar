import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges {
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
   * Object to be bound to grid for styling
   */
  public gridStyle = {};
  /**
   * Captures style for top header with previous and next button
   */
  public topHeaderStyle = {};
  /**
   * Captures current month from date
   */
  public currentMonth : string = '';
  /**
   * Captures current year from date
   */
  public currentYear : string = ''; 
  /**
   * Captures style for each cell of the calendar grid i.e. for the numeric values and the day of the week indicator
   */
  public calendarCellStyle = {};
  /**
   * Captures style for left/right side icon of the top header
   */
  public headerIconStyle = {};
  /**
   * Captures style for middle content displayed in the top header
   */
  public headerMiddleContentStyle = {};
  /**
   * Captures style for not in month dates
   */
  public calendarCellNotInMonthStyle = {};
   /**
   * Captures style for in the month dates
   */
  public calendarCellInMonthStyle = {};
  /**
   * Captures styles for selected date
   */
  public calendarCellSelectedStyle = {};
  /**
   * Captures the selected date, by default it is set to current date of month
   */
  public dateSelected = moment(this.currentDate);
  ngOnInit(){
    // console.log(this.currentDate);
    // console.log(this.currentDate.date());
    // console.log(this.currentDate.day());
    // console.log(this.currentDate.toDate());
    // console.log(this.currentDate.startOf('month').day());
    // console.log(this.currentDate.clone().startOf('month').subtract(this.currentDate.startOf('month').day() - 1,'days'));
    // console.log(this.start);
    // console.log(moment(this.startDayOfCalendar).date(1));
    // this.fetchCalendarDays(this.currentDate);
    this.generateCalendar();
  }

  ngOnChanges(){
    this.generateCalendar();
  }
  /**
   * Fetches the dates that are to be rendered in the calendar
   * @param currentDate 
   */
  public fetchCalendarDays(currentDate : moment.Moment) : void{
    this.startDayOfMonth = moment(currentDate).startOf('month').day();
    this.currentMonth = moment(currentDate).format('MMMM');
    this.currentYear = moment(currentDate).format('YYYY');
    this.calendarDays = Array(42);
    let start;
    if(this.indexOfStartingDay < this.startDayOfMonth)
    {
      this.startDayOfCalendar = moment(currentDate).startOf('month').subtract(this.startDayOfMonth - this.indexOfStartingDay,'days');
      start = this.startDayOfCalendar.date();
    }
    else{
      this.startDayOfCalendar = moment(currentDate).startOf('month').subtract(this.startDayOfMonth - (this.indexOfStartingDay - 7),'days');
      start = this.startDayOfCalendar.date();
    }
    let splicedWeekHeaderDays = this.weekDayHeader.splice(0,this.indexOfStartingDay);
    this.weekDayHeader = [...this.weekDayHeader, ...splicedWeekHeaderDays];
    /**
     * Looping over the calendar days array and creating a moment by adding the number of days to the start date
     */
    for(let index = 0 ; index < this.calendarDays.length ; index ++)
    {
      /**
       * Setting value for each element of array
       */
      const dateObj = {};
      dateObj["date"] = moment(this.startDayOfCalendar).date(start + index);
      dateObj["todaysDate"] = this.isTodaysDate(dateObj["date"]);
      /**
       * Setting is selected to true by default for current date
       */
      if(dateObj["date"].month() === this.dateSelected.month() && dateObj["date"].date() === this.dateSelected.date() && dateObj["date"].year() === this.dateSelected.year())
      {
        dateObj["isDateSelected"] = true;
      }
      this.calendarDays[index] = dateObj;
    }
    // console.log(this.startDayOfMonth);
    // console.log(this.startDayOfCalendar);
    // console.log(start);
    // console.log(this.calendarDays);
    this.convertToWeeks();
  }
  /**
   * Handler to convert the selected dates of the calendar into array of arrays
   */
  public convertToWeeks()
  {
    const weeksOfCalendar = [];
    for(let index = 0; index < this.calendarDays.length; index++)
    {
      weeksOfCalendar.push(this.calendarDays.splice(0,7));
    }
    this.weeksOfCurrentCalendarFetchedDates = weeksOfCalendar;
  }
  /**
   * Return all the days to be published in the calendar depending upon the user next or previous month click
   */
  public generateCalendar() : void{
    this.fetchCalendarDays(this.currentDate);
    this.stylesOfGrid();
    this.topCalendarHeaderStyle();
    this.cellStyle();
    this.headerContentStyle();
    this.headerSideCellsStyle();
    this.notInMonthDatesCellStyle();
    this.inMonthDatesCellStyle();
    this.selectedDateStyle();
  } 
  /**
   * Subtracts one month from the current date and generates calendar accordingly
   */
  public fetchPreviousMonthCalendar() : void{
    this.currentDate = moment(this.currentDate).subtract(1,'month');
    this.generateCalendar();
  }
  /**
   * Adds one month to the current date and genertes calendar accordingly
   */
  public fetchNextMonthCalendar() : void{
    this.currentDate = moment(this.currentDate).add(1,'month');
    this.generateCalendar();
  }
  /**
   * Handler for the date selected
   * @param date 
   */
  public selectedDate(date : moment.Moment) : void{
    this.resetSetSelected(date);
    this.sendSelectedDate.emit(date);
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
  public isTodaysDate(date : moment.Moment){
    return moment().isSame(moment(date),'day');
  }
  /**
   * Reset selected to false for the previously selected date
   */
  public resetSetSelected(date : moment.Moment){
    let outerIndex = 0;
    let innerIndex = 0;
    for(let index = 0; index < this.weeksOfCurrentCalendarFetchedDates.length ; index++)
    {
      for(let key = 0; key < this.weeksOfCurrentCalendarFetchedDates[index].length; key++)
      {
        if(moment(this.weeksOfCurrentCalendarFetchedDates[index][key].date).month() === moment(this.dateSelected).month() && moment(this.weeksOfCurrentCalendarFetchedDates[index][key].date).date() === moment(this.dateSelected).date() && moment(this.weeksOfCurrentCalendarFetchedDates[index][key].date).year() === moment(this.dateSelected).year())
        {
          this.weeksOfCurrentCalendarFetchedDates[index][key].isDateSelected = false;
        }
        else if(this.weeksOfCurrentCalendarFetchedDates[index][key].date === date.date)
        {
          this.weeksOfCurrentCalendarFetchedDates[index][key].isDateSelected = true;
          outerIndex = index;
          innerIndex = key;
        }
      }
    }
    this.dateSelected = moment(this.weeksOfCurrentCalendarFetchedDates[outerIndex][innerIndex].date);
  }
/**
 * Captures style for calendar grid
 */
  public stylesOfGrid(){
    const style = {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : this.calendarGridWidth,
      'flexDirection' : 'row'
    }
    this.gridStyle = style;
  }
  /**
   * Captures top level header style
   */
  public topCalendarHeaderStyle(){
    const style = {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : this.calendarGridWidth,
      'height' : (parseInt(this.calendarGridHeight) / 8) + 'vh',
      'flexDirection' : 'row'
    } 
    this.topHeaderStyle = style;
  }
  /**
   * Captures each cell style in the grid
   */
  public cellStyle(){
    const style = {
      'width' : (parseInt(this.calendarGridWidth) / 7) + '%',
      'height' : (parseInt(this.calendarGridHeight) / 8) + 'vh',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'cursor' : 'pointer'
    }
    this.calendarCellStyle = style;
  }
  /**
   * Captures styles for previous and next button
   */
  public headerSideCellsStyle(){
    const style = {
      'width' :  (parseInt(this.calendarGridWidth) / 7) + '%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center'
    }
    this.headerIconStyle = style;
  }
  /**
   * Captures styles for content in the top header
   */
  public headerContentStyle(){
    const style = {
      'width' :  ((parseInt(this.calendarGridWidth) / 7) * 5) + '%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center'
    }
    this.headerMiddleContentStyle = style;
  }
  /**
   * Handler for not in the month dates
   */
  public notInMonthDatesCellStyle(){
    const style = {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'color' : 'grey'
    }
    this.calendarCellNotInMonthStyle = style;
  }
  /**
   * Handler for in month dates
   */
  public inMonthDatesCellStyle(){
    const style = {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
    }
    this.calendarCellInMonthStyle = style;
  }

  public selectedDateStyle(){
    const style = {
      'width' : '100%',
      'height' : '100%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center',
      'backgroundImage': 'linear-gradient(to right,blue,indigo,violet)',
      'borderRadius' : '5em'
    }
    this.calendarCellSelectedStyle = style;
  }
}
