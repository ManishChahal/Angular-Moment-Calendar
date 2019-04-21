import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

interface MonthObject {
  firstDayOfMonth : moment.Moment;
  isSelected : boolean;
  name : string;
  alias : string;
}

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {

  constructor() { }
  /**
   * Captures all 12 months of a year
   */
  public monthsOfYear = [];
  /**
   * Captures cuurent date 
   */
  public currentMoment = moment();
  /**
   * Captures the date selected by the user
   */
  public selectedMoment = moment().startOf('month');
  /**
   * Captures names of the month along with their alias
   */
  public monthsAndAlias = [
    {name : 'January', alias : 'JAN'},
    {name : 'February', alias : 'FEB'},
    {name : 'March', alias : 'MAR'},
    {name : 'April', alias : 'APR'},
    {name : 'May', alias : 'MAY'},
    {name : 'June', alias : 'JUN'},
    {name : 'July', alias : 'JUL'},
    {name : 'August', alias : 'AUG'},
    {name : 'September', alias : 'SEP'},
    {name : 'October', alias : 'OCT'},
    {name : 'November', alias : 'NOV'},
    {name : 'December', alias : 'DEC'}
  ];
  /**
   * Captures array of arrays to be rendered
   */
  public viewBounds = [];
  /**
   * Event emitter to emit the selected month
   */
  @Output() onMonthSelection : EventEmitter<any> = new EventEmitter();
  /**
   * Event emitter to emit when user cancels the selection made so the rendered calendar can be closed
   */
  @Output() onSelectionCancel : EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.generateMonthsCalendar();
  }
  /**
   * Handler to genearte all the months a year
   */
  public generateMonthsCalendar() : void {
    const months = Array(12);
    this.viewBounds = [];
    let firstDateOfYear = moment(this.currentMoment).startOf('year');
    for(let index = 0; index < months.length; index++){
      const monthObj = {};
      monthObj['firstDayOfMonth'] = moment(firstDateOfYear).add(index, 'month');
      if(moment(monthObj['firstDayOfMonth']).isSame(moment(this.selectedMoment))){
        monthObj['isSelected'] = true;
      }
      else{
        monthObj['isSelected'] = false;
      }
      monthObj['name'] = this.monthsAndAlias[index].name;
      monthObj['alias'] = this.monthsAndAlias[index].alias;
      this.monthsOfYear.push(monthObj);
    }
    while(this.monthsOfYear.length){
      this.viewBounds.push(this.monthsOfYear.splice(0,3));
    }
  }
  /**
   * Handler to add one year to current moment and generate the view bounds
   */
  public fetchNextYear() : void {
    this.currentMoment = moment(this.currentMoment).add(1, 'year');
    this.generateMonthsCalendar();
  }
  /**
   *  Handler to subtract one year from current moment and generate the view bounds
   */
  public fetchPreviousYear() : void {
    this.currentMoment = moment(this.currentMoment).subtract(1, 'year');
    this.generateMonthsCalendar();
  }
  /**
   * Handler to be called on selection of month
   * @param month 
   */
  public selectedMonth(month : MonthObject) : void {
    if(!month.isSelected){
      for(let index = 0; index < this.viewBounds.length; index ++){
        for(let key = 0; key < this.viewBounds[index].length; key++){
          //Checks if the date of the selected month is same as one from the view bounds
          if(moment(this.viewBounds[index][key].firstDayOfMonth).isSame(moment(month.firstDayOfMonth))){
            this.viewBounds[index][key].isSelected = true;
            this.selectedMoment = this.viewBounds[index][key].firstDayOfMonth;
          }
          //Resets the selected property of the date previously selected
          else if(this.viewBounds[index][key].isSelected){
            this.viewBounds[index][key].isSelected = false;
          }
        }
      }
    }
  }
  /**
   * Handler to emit the month selected by user
   */
  public onDoneClick() : void{
    this.onMonthSelection.emit({date : this.selectedMoment});
  }
  /**
   * Handler to be called when user cancels the selection from view
   */
  public onCancelClick() : void{
    this.onSelectionCancel.emit();
  }
  /**
   * Captures top level header style
   */
  public topCalendarHeaderStyle() : Object {
    return {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : '100%',
      'height' : (100 / 5) + 'vh',
      'flexDirection' : 'row'
    } 
  }
  /**
  * Captures style for calendar grid
  */
  public stylesOfGrid() : Object {
    return {
      'display' : 'flex',
      'justifyContent' : 'space-between',
      'width' : '100%',
      'flexDirection' : 'row'
    }
  }
  /**
   * Captures each cell style in the grid
   */
  public cellStyle() : Object {
    return {
      'width' : (100 / 3) + '%',
      'height' : (100 / 5) + 'vh',
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
      'width' :  (100 / 3) + '%',
      'textAlign' : 'center',
      'display' : 'flex',
      'justifyContent' : 'center',
      'alignItems' : 'center'
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
}
