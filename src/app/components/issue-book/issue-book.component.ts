import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-issue-book',
  templateUrl: './issue-book.component.html',
  styleUrls: ['./issue-book.component.css']
})
export class IssueBookComponent implements OnInit {
  books: any[] = [];
  availableBooks: any[] = [];
  selectedBookId: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  currentUser: any = null;
  userIssuedBooks: any[] = [];

  constructor(private bookService: BookService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBooks();
    this.loadUserIssuedBooks();
  }

  loadBooks(): void {
    this.books = this.bookService.getBooks();
    this.availableBooks = this.books.filter((book: any) => book.availableQuantity > 0);
  }

  loadUserIssuedBooks(): void {
    if (this.currentUser) {
      this.userIssuedBooks = this.bookService.getIssuedBooksByUser(this.currentUser.id)
        .filter((book: any) => book.status === 'issued');
    }
  }

  issueBook(): void {
    if (!this.selectedBookId) {
      this.errorMessage = 'Please select a book to issue';
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'Please login to issue books';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const result = this.bookService.issueBook(this.selectedBookId, this.currentUser.id);

    if (result.success) {
      this.successMessage = result.message;
      this.selectedBookId = '';
      this.loadBooks();
      this.loadUserIssuedBooks();
    } else {
      this.errorMessage = result.message;
    }

    this.isLoading = false;

    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getBookTitle(bookId: string): string {
    const book = this.books.find(b => b.id === bookId);
    return book ? book.title : 'Unknown Book';
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

  isOverdue(dueDate: Date | string): boolean {
    return new Date(dueDate) < new Date();
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  returnBook(issuedBookId: string): void {
    if (confirm('Are you sure you want to return this book?')) {
      const result = this.bookService.returnBook(issuedBookId);
      
      if (result.success) {
        this.successMessage = result.message;
        this.loadBooks();
        this.loadUserIssuedBooks();
      } else {
        this.errorMessage = result.message;
      }

      setTimeout(() => {
        this.clearMessages();
      }, 3000);
    }
  }
}
