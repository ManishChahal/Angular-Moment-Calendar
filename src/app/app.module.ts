import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RangeSelectorComponent } from './range-selector/range-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    RangeSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [RangeSelectorComponent]
})
export class AppModule { }
