import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  loginUser(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const result = this.authService.loginUser({ email: this.email, password: this.password });

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = result.message;
    }

    this.isLoading = false;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToAdminLogin(): void {
    this.router.navigate(['/admin-login']);
  }

  validateUser(): boolean {
    return this.email && this.password ? true : false;
  }
}
