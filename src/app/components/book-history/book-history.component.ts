import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-history',
  templateUrl: './book-history.component.html',
  styleUrls: ['./book-history.component.css']
})
export class BookHistoryComponent implements OnInit {
  userIssuedBooks: any[] = [];
  allIssuedBooks: any[] = [];
  isLoading: boolean = false;
  currentUser: any = null;

  // Filters
  statusFilter: string = 'all';
  searchTerm: string = '';

  constructor(private bookService: BookService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBookHistory();
  }

  loadBookHistory(): void {
    if (this.currentUser) {
      this.userIssuedBooks = this.bookService.getIssuedBooksByUser(this.currentUser.id);
      this.allIssuedBooks = this.bookService.getAllIssuedBooks();
    }
  }

  get filteredUserBooks(): any[] {
    let filtered = [...this.userIssuedBooks];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((book: any) => book.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((book: any) => {
        const bookTitle = this.getBookTitle(book.bookId).toLowerCase();
        const bookAuthor = this.getBookAuthor(book.bookId).toLowerCase();
        return bookTitle.includes(searchLower) || bookAuthor.includes(searchLower);
      });
    }

    // Sort by issue date (newest first)
    return filtered.sort((a: any, b: any) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }

  get filteredAllBooks(): any[] {
    let filtered = [...this.allIssuedBooks];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((book: any) => book.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((book: any) => {
        const bookTitle = this.getBookTitle(book.bookId).toLowerCase();
        const bookAuthor = this.getBookAuthor(book.bookId).toLowerCase();
        return bookTitle.includes(searchLower) || bookAuthor.includes(searchLower);
      });
    }

    // Sort by issue date (newest first)
    return filtered.sort((a: any, b: any) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }

  getBookTitle(bookId: string): string {
    const book = this.bookService.getBookById(bookId);
    return book ? book.title : 'Unknown Book';
  }

  getBookAuthor(bookId: string): string {
    const book = this.bookService.getBookById(bookId);
    return book ? book.author : 'Unknown Author';
  }

  getUserName(userId: string): string {
    // In a real app, this would fetch user details
    // For demo purposes, we'll return a placeholder
    return `User ${userId}`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'issued':
        return 'status-issued';
      case 'returned':
        return 'status-returned';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'issued':
        return '📖 Issued';
      case 'returned':
        return '✅ Returned';
      case 'overdue':
        return '⚠️ Overdue';
      default:
        return status;
    }
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.searchTerm = '';
  }

  exportHistory(): void {
    const data = this.isAdmin() ? this.filteredAllBooks : this.filteredUserBooks;
    const csv = this.convertToCSV(data);
    this.downloadCSV(csv, 'book-history.csv');
  }

  convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = ['Book Title', 'Author', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine'];
    const rows = data.map(book => [
      this.getBookTitle(book.bookId),
      this.getBookAuthor(book.bookId),
      this.formatDate(book.issueDate),
      this.formatDate(book.dueDate),
      book.returnDate ? this.formatDate(book.returnDate) : 'Not returned',
      this.getStatusText(book.status),
      book.fine ? `₹${book.fine}` : '₹0'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getStatistics(): any {
    const books = this.isAdmin() ? this.allIssuedBooks : this.userIssuedBooks;
    
    return {
      total: books.length,
      issued: books.filter((book: any) => book.status === 'issued').length,
      returned: books.filter((book: any) => book.status === 'returned').length,
      overdue: books.filter((book: any) => book.status === 'overdue').length,
      totalFines: books.reduce((total: number, book: any) => total + (book.fine || 0), 0)
    };
  }
}
