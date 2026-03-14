import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  statistics: any = {};
  recentBooks: any[] = [];
  userIssuedBooks: any[] = [];
  isLoading: boolean = true;

  constructor(private authService: AuthService, private bookService: BookService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.statistics = this.bookService.getLibraryStatistics();
    this.recentBooks = this.bookService.getBooks().slice(0, 5);
    
    if (this.currentUser && this.currentUser.role === 'user') {
      this.userIssuedBooks = this.bookService.getIssuedBooksByUser(this.currentUser.id)
        .filter((book: any) => book.status === 'issued')
        .slice(0, 3);
    }

    this.isLoading = false;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.loadDashboardData();
    }, 500);
  }

  getBookTitle(bookId: string): string {
    const book = this.bookService.getBookById(bookId);
    return book ? book.title : 'Unknown Book';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  isOverdue(dueDate: Date | string): boolean {
    return new Date(dueDate) < new Date();
  }

  getDueStatus(dueDate: Date | string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return `Overdue by ${Math.abs(daysLeft)} days`;
    } else if (daysLeft === 0) {
      return 'Due today';
    } else if (daysLeft === 1) {
      return 'Due tomorrow';
    } else {
      return `${daysLeft} days left`;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
