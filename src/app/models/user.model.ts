export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  studentId: string;
  role: 'user' | 'admin';
  registrationDate: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  studentId: string;
}
