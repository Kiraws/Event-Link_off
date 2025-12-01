import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les messages de contact
 */
export interface ContactMessage {
  uid: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'READ' | 'REPLIED';
  read_at: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendContactMessageRequest {
  name: string;
  email: string;
  message: string;
}

export interface ReplyContactMessageRequest {
  reply_message: string;
}

export interface GetContactMessagesParams extends PaginationParams {
  status?: 'PENDING' | 'READ' | 'REPLIED';
}

/**
 * Service de gestion des messages de contact
 */
export class ContactService extends BaseService {
  constructor() {
    super('/contact');
  }

  /**
   * Envoyer un message de contact
   */
  async sendMessage(data: SendContactMessageRequest): Promise<ApiResponse<ContactMessage>> {
    return this.post<ContactMessage>('', data, false); // Pas d'authentification requise
  }

  /**
   * Obtenir la liste des messages de contact (réservé aux admin et modérateurs)
   */
  async getAll(params?: GetContactMessagesParams): Promise<PaginatedResponse<ContactMessage>> {
    return this.get<ContactMessage[]>('', params, true) as Promise<PaginatedResponse<ContactMessage>>;
  }

  /**
   * Obtenir un message par son UID (réservé aux admin et modérateurs)
   */
  async getById(uid: string): Promise<ApiResponse<ContactMessage>> {
    return this.get<ContactMessage>(`/${uid}`, undefined, true);
  }

  /**
   * Marquer un message comme lu (réservé aux admin et modérateurs)
   */
  async markAsRead(uid: string): Promise<ApiResponse<ContactMessage>> {
    return this.patch<ContactMessage>(`/${uid}/read`, {}, true);
  }

  /**
   * Répondre à un message de contact (réservé aux admin et modérateurs)
   */
  async reply(uid: string, data: ReplyContactMessageRequest): Promise<ApiResponse<ContactMessage>> {
    return this.post<ContactMessage>(`/${uid}/reply`, data, true);
  }
}

