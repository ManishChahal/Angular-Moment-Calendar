import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RangeSelectorComponent } from './range-selector/range-selector.component';
import { MonthViewComponent } from './month-view/month-view.component';

@NgModule({
  declarations: [
    AppComponent,
    RangeSelectorComponent,
    MonthViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [MonthViewComponent]
})
export class AppModule { }
