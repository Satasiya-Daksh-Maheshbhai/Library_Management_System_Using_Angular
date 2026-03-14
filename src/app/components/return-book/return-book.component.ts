import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-return-book',
  templateUrl: './return-book.component.html',
  styleUrls: ['./return-book.component.css']
})
export class ReturnBookComponent implements OnInit {
  userIssuedBooks: any[] = [];
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  currentUser: any = null;

  constructor(private bookService: BookService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserIssuedBooks();
  }

  loadUserIssuedBooks(): void {
    if (this.currentUser) {
      this.userIssuedBooks = this.bookService.getIssuedBooksByUser(this.currentUser.id)
        .filter((book: any) => book.status === 'issued');
    }
  }

  returnBook(issuedBookId: string): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to return books';
      return;
    }

    if (confirm('Are you sure you want to return this book?')) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const result = this.bookService.returnBook(issuedBookId);

      if (result.success) {
        this.successMessage = result.message;
        this.loadUserIssuedBooks();
      } else {
        this.errorMessage = result.message;
      }

      this.isLoading = false;

      setTimeout(() => {
        this.clearMessages();
      }, 5000);
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getBookTitle(bookId: string): string {
    const book = this.bookService.getBookById(bookId);
    return book ? book.title : 'Unknown Book';
  }

  getBookAuthor(bookId: string): string {
    const book = this.bookService.getBookById(bookId);
    return book ? book.author : 'Unknown Author';
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

  calculateFine(issuedBook: any): number {
    const dueDate = new Date(issuedBook.dueDate);
    const today = new Date();
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    return daysOverdue * 5; // ₹5 per day
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  hasOverdueBooks(): boolean {
    return this.userIssuedBooks.some((book: any) => this.isOverdue(book.dueDate));
  }

  getTotalFine(): number {
    return this.userIssuedBooks.reduce((total: number, book: any) => 
      total + (this.isOverdue(book.dueDate) ? this.calculateFine(book) : 0), 0
    );
  }

  returnAllBooks(): void {
    if (this.userIssuedBooks.length === 0) {
      this.errorMessage = 'No books to return';
      return;
    }

    if (confirm(`Are you sure you want to return all ${this.userIssuedBooks.length} books?`)) {
      let successCount = 0;
      let totalFine = 0;

      this.userIssuedBooks.forEach((issuedBook: any) => {
        const result = this.bookService.returnBook(issuedBook.id);
        if (result.success) {
          successCount++;
          totalFine += result.fine || 0;
        }
      });

      if (successCount > 0) {
        this.successMessage = `Successfully returned ${successCount} book(s). Total fine: ₹${totalFine}`;
        this.loadUserIssuedBooks();
      } else {
        this.errorMessage = 'Failed to return books';
      }

      setTimeout(() => {
        this.clearMessages();
      }, 5000);
    }
  }
}
