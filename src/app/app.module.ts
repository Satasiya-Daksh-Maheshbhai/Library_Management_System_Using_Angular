import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookManagementComponent } from './components/book-management/book-management.component';
import { BookSearchComponent } from './components/book-search/book-search.component';
import { IssueBookComponent } from './components/issue-book/issue-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { BookHistoryComponent } from './components/book-history/book-history.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminLoginComponent,
    DashboardComponent,
    BookManagementComponent,
    BookSearchComponent,
    IssueBookComponent,
    ReturnBookComponent,
    BookHistoryComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
