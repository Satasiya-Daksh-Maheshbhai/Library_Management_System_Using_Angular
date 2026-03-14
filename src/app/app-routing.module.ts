import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookManagementComponent } from './components/book-management/book-management.component';
import { BookSearchComponent } from './components/book-search/book-search.component';
import { IssueBookComponent } from './components/issue-book/issue-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { BookHistoryComponent } from './components/book-history/book-history.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'book-management', component: BookManagementComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'book-search', component: BookSearchComponent, canActivate: [AuthGuard] },
  { path: 'issue-book', component: IssueBookComponent, canActivate: [AuthGuard] },
  { path: 'return-book', component: ReturnBookComponent, canActivate: [AuthGuard] },
  { path: 'book-history', component: BookHistoryComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
