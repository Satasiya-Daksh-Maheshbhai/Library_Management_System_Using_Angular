export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  addedDate: Date;
}

export interface IssuedBook {
  id: string;
  bookId: string;
  userId: string;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fine?: number;
  status: 'issued' | 'returned' | 'overdue';
}

export interface BookSearchFilter {
  title?: string;
  author?: string;
  category?: string;
}

export interface FineCalculation {
  issuedBook: IssuedBook;
  daysOverdue: number;
  finePerDay: number;
  totalFine: number;
}
