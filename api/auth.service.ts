import { BaseService } from './base.service';
import type { ApiResponse } from './base.service';
import { setAuthToken, removeAuthToken } from './config';

/**
 * Types pour l'authentification
 */
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
  phone?: string;
  profile_picture_url?: string;
  status?: 'ACTIVE' | 'DISABLED' | 'INACTIVE';
}

export interface AuthResponse {
  user: User;
  token: string;
  otp?: string; // Dev only
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface GoogleAuthRequest {
  id_token?: string;
  access_token?: string;
  google_id?: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * Service d'authentification
 */
export class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * Créer un nouveau compte utilisateur
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/register', data, false);
    
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Connexion utilisateur
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/login', data, false);
    
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async me(): Promise<ApiResponse<User>> {
    return this.get<User>('/me');
  }

  /**
   * Vérifier l'email avec un code OTP
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse> {
    return this.post('/verify-email', data, false);
  }

  /**
   * Renvoyer un code OTP de vérification
   */
  async resendOTP(data: ResendOTPRequest): Promise<ApiResponse<{ otp: string; emailSent: boolean }>> {
    return this.post<{ otp: string; emailSent: boolean }>('/resend-otp', data, false);
  }

  /**
   * Connexion/Inscription via Google
   */
  async googleAuth(data: GoogleAuthRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/google', data, false);
    
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Déconnexion (supprime le token)
   */
  logout(): void {
    removeAuthToken();
  }

  /**
   * Changer le mot de passe (nécessite l'ancien mot de passe)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return this.post('/change-password', data);
  }

  /**
   * Demander une réinitialisation du mot de passe (envoie un code OTP par email)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<{ emailSent: boolean }>> {
    return this.post<{ emailSent: boolean }>('/forgot-password', data, false);
  }

  /**
   * Réinitialiser le mot de passe avec le code OTP
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return this.post('/reset-password', data, false);
  }

  /**
   * Vérifier l'état de santé du serveur
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    const { API_CONFIG } = await import('./config');
    const response = await fetch(API_CONFIG.healthCheck);
    return this.handleResponse<{ status: string; timestamp: string }>(response);
  }
}
