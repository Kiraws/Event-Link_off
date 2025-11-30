import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les tickets
 */
export interface Ticket {
  uid: string;
  event_uid: string;
  ticket_type_uid: string;
  user_uid: string;
  status: string;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
  event?: any;
  ticket_type?: any;
}

export interface CreateTicketRequest {
  event_uid: string;
  ticket_type_uid: string;
}

export interface GetTicketsParams extends PaginationParams {
  status?: string;
}

/**
 * Service de gestion des tickets
 */
export class TicketsService extends BaseService {
  constructor() {
    super('/tickets');
  }

  /**
   * Obtenir la liste des tickets de l'utilisateur
   */
  async getAll(params?: GetTicketsParams): Promise<PaginatedResponse<Ticket>> {
    return this.get<Ticket[]>('', params);
  }

  /**
   * Obtenir un ticket par son UID
   */
  async getById(uid: string): Promise<ApiResponse<Ticket>> {
    return this.get<Ticket>(`/${uid}`);
  }

  /**
   * Acheter un ticket
   */
  async create(data: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return this.post<Ticket>('', data);
  }

  /**
   * Valider un ticket
   */
  async validate(uid: string): Promise<ApiResponse<Ticket>> {
    return this.post<Ticket>(`/${uid}/validate`);
  }
}
