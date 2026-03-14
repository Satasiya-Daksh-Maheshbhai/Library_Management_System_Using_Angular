import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegistrationData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private readonly ADMIN_EMAIL = 'admin@library.com';
  private readonly ADMIN_PASSWORD = 'admin123';

  constructor(private router: Router) {
    this.loadUsersFromStorage();
  }

  registerUser(userData: RegistrationData): { success: boolean; message: string } {
    if (this.validateUser(userData.email)) {
      return { success: false, message: 'User with this email already exists' };
    }

    const newUser: User = {
      id: this.generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      studentId: userData.studentId,
      role: 'user',
      registrationDate: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();
    return { success: true, message: 'Registration successful' };
  }

  loginUser(credentials: LoginCredentials): { success: boolean; message: string } {
    const user = this.users.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password &&
      u.role === 'user'
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  adminLogin(credentials: LoginCredentials): { success: boolean; message: string } {
    if (credentials.email === this.ADMIN_EMAIL && credentials.password === this.ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin-001',
        name: 'Library Admin',
        email: this.ADMIN_EMAIL,
        password: this.ADMIN_PASSWORD,
        studentId: 'ADMIN-001',
        role: 'admin',
        registrationDate: new Date()
      };
      this.currentUser = adminUser;
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return { success: true, message: 'Admin login successful' };
    }

    return { success: false, message: 'Invalid admin credentials' };
  }

  logoutUser(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  checkUserSession(): boolean {
    return this.isLoggedIn();
  }

  private validateUser(email: string): boolean {
    return this.users.some(user => user.email === email);
  }

  private generateId(): string {
    return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private loadUsersFromStorage(): void {
    const storedUsers = localStorage.getItem('libraryUsers');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  private saveUsersToStorage(): void {
    localStorage.setItem('libraryUsers', JSON.stringify(this.users));
  }
}
