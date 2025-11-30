import { BaseService } from './base.service';
import type { ApiResponse } from './base.service';

/**
 * Types pour les statistiques du dashboard
 */
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    disabled: number;
    email_verified: number;
    by_role: Array<{
      role: string;
      count: number;
    }>;
  };
  events: {
    total: number;
    active: number;
    published: number;
    upcoming: number;
    past: number;
    free: number;
    paid: number;
    by_category: Array<{
      category: {
        uid: string;
        name: string;
      };
      events_count: number;
    }>;
    popular: Array<{
      event: {
        uid: string;
        title: string;
        start_date: string;
        location: string;
        is_free: boolean;
      };
      registrations_count: number;
    }>;
  };
  registrations: {
    total: number;
    active: number;
    cancelled: number;
    this_month: number;
  };
  favorites: {
    total: number;
  };
  tickets: {
    total: number;
    validated: number;
    pending: number;
    this_month: number;
  };
  transactions: {
    total: number;
    successful: number;
    pending: number;
    total_revenue: number;
    revenue_this_month: number;
  };
  categories: {
    total: number;
    active: number;
  };
}

/**
 * Service de gestion du dashboard
 */
export class DashboardService extends BaseService {
  constructor() {
    super('/dashboard');
  }

  /**
   * Obtenir les statistiques du dashboard
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('');
  }
}
