import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../services/ayth.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  isSignUpMode = false;
  email = '';
  password = '';

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
  }

  onSubmit(form: NgForm): void {
    if (!form.valid || this.emailError || this.passwordError) return;

    if (this.isSignUpMode) {
      this.authService.register(this.email, this.password).subscribe(success => {
        if (!success) {
          alert('Email is already taken');
          this.password = ''
          return;
        }
        this.router.navigate(['/']);
      })
    } else {
      ;
      this.authService.login(this.email, this.password).subscribe(success => {
        if (!success) {
          alert('Invalid email or password');
          this.password = ''
          return;
        }
        this.router.navigate(['/']);
      })
    }
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  get emailError(): string {
    if (!this.email) return 'Email is required';
    if (!this.isValidEmail(this.email)) return 'Invalid email format';
    return '';
  }

  get passwordError(): string {
    if (!this.password) return 'Password is required';
    if (this.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }
}
