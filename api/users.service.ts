import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les utilisateurs
 */
export interface User {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture_url?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
  status?: 'ACTIVE' | 'DISABLED' | 'INACTIVE';
  sport_preference?: string; // UID de la catégorie de préférence sportive
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture_url?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
  sport_preference?: string; // UID de la catégorie de préférence sportive
}

export interface GetUsersParams extends PaginationParams {
  // Add any additional filter params here
}

/**
 * Service de gestion des utilisateurs
 */
export class UsersService extends BaseService {
  constructor() {
    super('/users');
  }

  /**
   * Obtenir la liste des utilisateurs
   */
  async getAll(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    return this.get<User[]>('', params);
  }

  /**
   * Obtenir un utilisateur par son UID
   */
  async getById(uid: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/${uid}`);
  }

  /**
   * Mettre à jour un utilisateur
   * Note: Seuls les ADMIN peuvent modifier le rôle d'un utilisateur
   */
  async update(uid: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.put<User>(`/${uid}`, data);
  }

  /**
   * Désactiver un compte utilisateur
   * Endpoint simplifié qui met automatiquement le statut à 'DISABLED'.
   * Le compte ne sera pas supprimé mais l'utilisateur ne pourra plus se connecter.
   * Note: Vous ne pouvez pas désactiver votre propre compte.
   */
  async disable(uid: string): Promise<ApiResponse<User>> {
    return this.post<User>(`/${uid}/disable`, {});
  }

  /**
   * Réactiver un compte utilisateur
   * Endpoint simplifié qui met automatiquement le statut à 'ACTIVE'.
   * L'utilisateur pourra à nouveau se connecter.
   */
  async enable(uid: string): Promise<ApiResponse<User>> {
    return this.post<User>(`/${uid}/enable`, {});
  }

  /**
   * Mettre à jour le statut d'un utilisateur
   * Permet de changer le statut entre ACTIVE, DISABLED, ou INACTIVE.
   * Pour une utilisation simplifiée, préférez disable() ou enable().
   */
  async updateStatus(uid: string, status: 'ACTIVE' | 'DISABLED' | 'INACTIVE'): Promise<ApiResponse<User>> {
    return this.patch<User>(`/${uid}/status`, { status });
  }
}
