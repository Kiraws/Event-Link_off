import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les transactions
 */
export interface Transaction {
  uid: string;
  ticket_uid: string;
  user_uid: string;
  amount: number;
  currency: string;
  payment_method: 'MOBILE_MONEY' | 'BANK_CARD' | 'BANK_TRANSFER' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  payment_reference?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
  ticket?: any;
}

export interface CreateTransactionRequest {
  ticket_uid: string;
  amount: number;
  payment_method: 'MOBILE_MONEY' | 'BANK_CARD' | 'BANK_TRANSFER' | 'CASH';
  currency: string;
  payment_reference?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
}

export interface UpdateTransactionStatusRequest {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
}

export interface GetTransactionsParams extends PaginationParams {
  status?: string;
}

/**
 * Service de gestion des transactions
 */
export class TransactionsService extends BaseService {
  constructor() {
    super('/transactions');
  }

  /**
   * Obtenir la liste des transactions de l'utilisateur
   */
  async getAll(params?: GetTransactionsParams): Promise<PaginatedResponse<Transaction>> {
    return this.get<Transaction[]>('', params);
  }

  /**
   * Obtenir une transaction par son UID
   */
  async getById(uid: string): Promise<ApiResponse<Transaction>> {
    return this.get<Transaction>(`/${uid}`);
  }

  /**
   * Créer une transaction de paiement
   */
  async create(data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    return this.post<Transaction>('', data);
  }

  /**
   * Mettre à jour le statut d'une transaction
   */
  async updateStatus(uid: string, data: UpdateTransactionStatusRequest): Promise<ApiResponse<Transaction>> {
    return this.put<Transaction>(`/${uid}/status`, data);
  }
}
