import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  studentId: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  registerUser(): void {
    if (!this.name || !this.email || !this.password || !this.studentId) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const result = this.authService.registerUser({
      name: this.name,
      email: this.email,
      password: this.password,
      studentId: this.studentId
    });

    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.errorMessage = result.message;
    }

    this.isLoading = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  validateUser(): boolean {
    return !!(this.name && this.email && this.password && this.studentId && 
           this.password === this.confirmPassword && this.password.length >= 6);
  }
}
