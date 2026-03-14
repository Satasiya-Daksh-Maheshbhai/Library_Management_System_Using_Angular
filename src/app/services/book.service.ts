import { Injectable } from '@angular/core';
import { Book, IssuedBook, BookSearchFilter, FineCalculation } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books: Book[] = [];
  private issuedBooks: IssuedBook[] = [];
  private readonly FINE_PER_DAY = 5;

  constructor() {
    this.loadBooksFromStorage();
    this.loadIssuedBooksFromStorage();
    this.initializeDefaultBooks();
  }

  addBook(bookData: Omit<Book, 'id' | 'addedDate' | 'availableQuantity'>): { success: boolean; message: string } {
    const newBook: Book = {
      id: this.generateBookId(),
      ...bookData,
      availableQuantity: bookData.quantity,
      addedDate: new Date()
    };

    this.books.push(newBook);
    this.saveBooksToStorage();
    return { success: true, message: 'Book added successfully' };
  }

  getBooks(): Book[] {
    return [...this.books];
  }

  getBookById(id: string): Book | undefined {
    return this.books.find(book => book.id === id);
  }

  updateBook(id: string, bookData: Partial<Book>): { success: boolean; message: string } {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      return { success: false, message: 'Book not found' };
    }

    this.books[bookIndex] = { ...this.books[bookIndex], ...bookData };
    this.saveBooksToStorage();
    return { success: true, message: 'Book updated successfully' };
  }

  deleteBook(id: string): { success: boolean; message: string } {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      return { success: false, message: 'Book not found' };
    }

    const hasIssuedCopies = this.issuedBooks.some(issued => 
      issued.bookId === id && issued.status === 'issued'
    );

    if (hasIssuedCopies) {
      return { success: false, message: 'Cannot delete book with issued copies' };
    }

    this.books.splice(bookIndex, 1);
    this.saveBooksToStorage();
    return { success: true, message: 'Book deleted successfully' };
  }

  searchBooks(filter: BookSearchFilter): Book[] {
    return this.books.filter(book => {
      if (filter.title && !book.title.toLowerCase().includes(filter.title.toLowerCase())) {
        return false;
      }
      if (filter.author && !book.author.toLowerCase().includes(filter.author.toLowerCase())) {
        return false;
      }
      if (filter.category && !book.category.toLowerCase().includes(filter.category.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  issueBook(bookId: string, userId: string): { success: boolean; message: string } {
    const book = this.getBookById(bookId);
    if (!book) {
      return { success: false, message: 'Book not found' };
    }

    if (book.availableQuantity <= 0) {
      return { success: false, message: 'Book not available' };
    }

    const alreadyIssued = this.issuedBooks.some(issued => 
      issued.bookId === bookId && 
      issued.userId === userId && 
      issued.status === 'issued'
    );

    if (alreadyIssued) {
      return { success: false, message: 'You have already issued this book' };
    }

    const issuedBook: IssuedBook = {
      id: this.generateIssuedBookId(),
      bookId,
      userId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'issued'
    };

    this.issuedBooks.push(issuedBook);
    book.availableQuantity--;
    this.saveBooksToStorage();
    this.saveIssuedBooksToStorage();

    return { success: true, message: 'Book issued successfully' };
  }

  returnBook(issuedBookId: string): { success: boolean; message: string; fine?: number } {
    const issuedBook = this.issuedBooks.find(ib => ib.id === issuedBookId);
    if (!issuedBook) {
      return { success: false, message: 'Issued book record not found' };
    }

    if (issuedBook.status === 'returned') {
      return { success: false, message: 'Book already returned' };
    }

    const book = this.getBookById(issuedBook.bookId);
    if (book) {
      book.availableQuantity++;
    }

    const returnDate = new Date();
    const fine = this.calculateFine(issuedBook, returnDate);

    issuedBook.returnDate = returnDate;
    issuedBook.status = 'returned';
    issuedBook.fine = fine.totalFine;

    this.saveBooksToStorage();
    this.saveIssuedBooksToStorage();

    return { 
      success: true, 
      message: fine.totalFine > 0 
        ? `Book returned successfully. Fine: ₹${fine.totalFine}` 
        : 'Book returned successfully', 
      fine: fine.totalFine 
    };
  }

  getIssuedBooksByUser(userId: string): IssuedBook[] {
    return this.issuedBooks.filter(issued => issued.userId === userId);
  }

  getAllIssuedBooks(): IssuedBook[] {
    return [...this.issuedBooks];
  }

  calculateFine(issuedBook: IssuedBook, returnDate: Date = new Date()): FineCalculation {
    const dueDate = new Date(issuedBook.dueDate);
    const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalFine = daysOverdue * this.FINE_PER_DAY;

    return {
      issuedBook,
      daysOverdue,
      finePerDay: this.FINE_PER_DAY,
      totalFine
    };
  }

  checkDueDate(issuedBookId: string): { isOverdue: boolean; daysRemaining: number; fine?: number } {
    const issuedBook = this.issuedBooks.find(ib => ib.id === issuedBookId);
    if (!issuedBook || issuedBook.status === 'returned') {
      return { isOverdue: false, daysRemaining: 0 };
    }

    const today = new Date();
    const dueDate = new Date(issuedBook.dueDate);
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      const fine = this.calculateFine(issuedBook);
      return { isOverdue: true, daysRemaining: Math.abs(daysRemaining), fine: fine.totalFine };
    }

    return { isOverdue: false, daysRemaining };
  }

  getLibraryStatistics() {
    const totalBooks = this.books.reduce((sum, book) => sum + book.quantity, 0);
    const availableBooks = this.books.reduce((sum, book) => sum + book.availableQuantity, 0);
    const issuedBooks = this.issuedBooks.filter(ib => ib.status === 'issued').length;
    const totalUsers = JSON.parse(localStorage.getItem('libraryUsers') || '[]').length;

    return {
      totalBooks,
      availableBooks,
      issuedBooks,
      totalUsers
    };
  }

  private generateBookId(): string {
    return 'book-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private generateIssuedBookId(): string {
    return 'issued-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private loadBooksFromStorage(): void {
    const storedBooks = localStorage.getItem('libraryBooks');
    if (storedBooks) {
      this.books = JSON.parse(storedBooks);
    }
  }

  private saveBooksToStorage(): void {
    localStorage.setItem('libraryBooks', JSON.stringify(this.books));
  }

  private loadIssuedBooksFromStorage(): void {
    const storedIssuedBooks = localStorage.getItem('issuedBooks');
    if (storedIssuedBooks) {
      this.issuedBooks = JSON.parse(storedIssuedBooks);
    }
  }

  private saveIssuedBooksToStorage(): void {
    localStorage.setItem('issuedBooks', JSON.stringify(this.issuedBooks));
  }

  private initializeDefaultBooks(): void {
    if (this.books.length === 0) {
      const defaultBooks = [
        { title: 'Angular in Action', author: 'Jeremy Wilken', category: 'Programming', quantity: 5 },
        { title: 'TypeScript Handbook', author: 'Microsoft', category: 'Programming', quantity: 3 },
        { title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', quantity: 4 },
        { title: 'Design Patterns', author: 'Gang of Four', category: 'Software Engineering', quantity: 2 },
        { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Programming', quantity: 6 }
      ];

      defaultBooks.forEach(book => {
        this.addBook(book);
      });
    }
  }
}
