import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css']
})
export class BookSearchComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  isLoading: boolean = false;
  
  searchFilters = {
    title: '',
    author: '',
    category: ''
  };

  categories: string[] = [
    'Programming', 'Software Engineering', 'Database', 'Web Development',
    'Mobile Development', 'Data Science', 'Artificial Intelligence',
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
    'Biology', 'Literature', 'History', 'Other'
  ];

  currentUser: any = null;

  constructor(private bookService: BookService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBooks();
  }

  loadBooks(): void {
    this.books = this.bookService.getBooks();
    this.filteredBooks = [...this.books];
  }

  searchBooks(): void {
    this.filteredBooks = this.bookService.searchBooks(this.searchFilters);
  }

  clearFilters(): void {
    this.searchFilters = {
      title: '',
      author: '',
      category: ''
    };
    this.filteredBooks = [...this.books];
  }

  issueBook(book: any): void {
    if (!this.currentUser) {
      alert('Please login to issue books');
      return;
    }

    if (book.availableQuantity <= 0) {
      alert('This book is not available for issuing');
      return;
    }

    const result = this.bookService.issueBook(book.id, this.currentUser.id);
    
    if (result.success) {
      alert(result.message);
      this.loadBooks();
    } else {
      alert(result.message);
    }
  }

  getAvailabilityStatus(book: any): string {
    if (book.availableQuantity === 0) {
      return 'Not Available';
    } else if (book.availableQuantity < book.quantity * 0.2) {
      return 'Limited Copies';
    } else {
      return 'Available';
    }
  }

  getAvailabilityClass(book: any): string {
    if (book.availableQuantity === 0) {
      return 'not-available';
    } else if (book.availableQuantity < book.quantity * 0.2) {
      return 'limited';
    } else {
      return 'available';
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
