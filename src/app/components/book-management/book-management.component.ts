import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-management',
  templateUrl: './book-management.component.html',
  styleUrls: ['./book-management.component.css']
})
export class BookManagementComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  
  // Form data
  bookForm = {
    id: '',
    title: '',
    author: '',
    category: '',
    quantity: 1
  };
  
  isEditing: boolean = false;
  showAddForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.books = this.bookService.getBooks();
    this.filteredBooks = [...this.books];
  }

  searchBooks(): void {
    if (!this.searchTerm) {
      this.filteredBooks = [...this.books];
    } else {
      this.filteredBooks = this.bookService.searchBooks({
        title: this.searchTerm,
        author: this.searchTerm,
        category: this.searchTerm
      });
    }
  }

  showAddBookForm(): void {
    this.resetForm();
    this.showAddForm = true;
    this.isEditing = false;
  }

  editBook(book: any): void {
    this.bookForm = {
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      quantity: book.quantity
    };
    this.isEditing = true;
    this.showAddForm = true;
  }

  saveBook(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.bookForm.title || !this.bookForm.author || !this.bookForm.category) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.bookForm.quantity < 1) {
      this.errorMessage = 'Quantity must be at least 1';
      return;
    }

    this.isLoading = true;

    if (this.isEditing) {
      const result = this.bookService.updateBook(this.bookForm.id, {
        title: this.bookForm.title,
        author: this.bookForm.author,
        category: this.bookForm.category,
        quantity: this.bookForm.quantity
      });

      if (result.success) {
        this.successMessage = result.message;
        this.loadBooks();
      } else {
        this.errorMessage = result.message;
      }
    } else {
      const result = this.bookService.addBook({
        title: this.bookForm.title,
        author: this.bookForm.author,
        category: this.bookForm.category,
        quantity: this.bookForm.quantity
      });

      if (result.success) {
        this.successMessage = result.message;
        this.loadBooks();
      } else {
        this.errorMessage = result.message;
      }
    }

    this.isLoading = false;
    
    if (this.successMessage) {
      setTimeout(() => {
        this.cancelForm();
      }, 2000);
    }
  }

  deleteBook(bookId: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      const result = this.bookService.deleteBook(bookId);
      
      if (result.success) {
        this.successMessage = result.message;
        this.loadBooks();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } else {
        this.errorMessage = result.message;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    }
  }

  cancelForm(): void {
    this.resetForm();
    this.showAddForm = false;
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm(): void {
    this.bookForm = {
      id: '',
      title: '',
      author: '',
      category: '',
      quantity: 1
    };
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
