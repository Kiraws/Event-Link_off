import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les événements
 */
export interface Event {
  uid: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category_uid?: string;
  is_free: boolean;
  is_multi_day: boolean;
  status: string;
  image_url?: string;
  organizer?: string;
  max_capacity?: number;
  created_at?: string;
  updated_at?: string;
  category?: any;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601
  location: string;
  latitude?: number;
  longitude?: number;
  category_uid?: string;
  is_free: boolean;
  is_multi_day: boolean;
  status: string;
  image_url?: string;
  organizer?: string;
  max_capacity?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  category_uid?: string;
  is_free?: boolean;
  is_multi_day?: boolean;
  status?: string;
  image_url?: string;
  organizer?: string;
  max_capacity?: number;
}

export interface GetEventsParams extends PaginationParams {
  category_uid?: string;
  status?: string;
  search?: string;
}

export interface EventRegistration {
  registration: {
    uid: string;
    status: string;
    registration_date: string;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
  };
  user: {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    profile_picture_url: string | null;
    role: string;
  };
}

export interface EventRegistrationsResponse {
  event: {
    uid: string;
    title: string;
    is_free: boolean;
  };
  registrations: EventRegistration[];
}

export interface GetEventRegistrationsParams extends PaginationParams {
  status?: "REGISTERED" | "CANCELLED";
}

/**
 * Service de gestion des événements
 */
export class EventsService extends BaseService {
  constructor() {
    super('/events');
  }

  /**
   * Obtenir la liste des événements
   */
  async getAll(params?: GetEventsParams): Promise<PaginatedResponse<Event>> {
    return this.get<Event[]>('', params, false);
  }

  /**
   * Obtenir un événement par son UID
   */
  async getById(uid: string): Promise<ApiResponse<Event>> {
    return this.get<Event>(`/${uid}`, undefined, false);
  }

  /**
   * Créer un nouvel événement
   */
  async create(data: CreateEventRequest): Promise<ApiResponse<Event>> {
    return this.post<Event>('', data);
  }

  /**
   * Mettre à jour un événement
   */
  async update(uid: string, data: UpdateEventRequest): Promise<ApiResponse<Event>> {
    return this.put<Event>(`/${uid}`, data);
  }

  /**
   * Supprimer un événement
   */
  async delete(uid: string): Promise<ApiResponse> {
    return this.deleteRequest(`/${uid}`);
  }

  /**
   * S'inscrire à un événement gratuit
   */
  async registerFree(uid: string): Promise<ApiResponse> {
    return this.post(`/${uid}/register-free`, {});
  }

  /**
   * Se désinscrire d'un événement gratuit
   */
  async unregisterFree(uid: string): Promise<ApiResponse> {
    return this.deleteRequest(`/${uid}/register-free`);
  }

  /**
   * Vérifier si l'utilisateur est inscrit à un événement gratuit
   */
  async checkFreeRegistration(uid: string): Promise<ApiResponse<{ is_registered: boolean }>> {
    return this.get<{ is_registered: boolean }>(`/${uid}/register-free/check`);
  }

  /**
   * Obtenir la liste des événements gratuits auxquels je suis inscrit
   */
  async getMyFreeRegistrations(params?: PaginationParams): Promise<PaginatedResponse<Event>> {
    return this.get<Event[]>('/my-free-registrations', params);
  }

  /**
   * Ajouter un événement aux favoris
   */
  async addToFavorites(uid: string): Promise<ApiResponse<{ favorite: { uid: string; event_uid: string; created_at: string } }>> {
    return this.post<{ favorite: { uid: string; event_uid: string; created_at: string } }>(`/${uid}/favorite`, {});
  }

  /**
   * Retirer un événement des favoris
   */
  async removeFromFavorites(uid: string): Promise<ApiResponse> {
    return this.deleteRequest(`/${uid}/favorite`);
  }

  /**
   * Vérifier si un événement est en favoris
   */
  async checkFavorite(uid: string): Promise<ApiResponse<{ is_favorite: boolean; added_at: string | null }>> {
    return this.get<{ is_favorite: boolean; added_at: string | null }>(`/${uid}/favorite/check`);
  }

  /**
   * Obtenir la liste de mes événements favoris
   */
  async getMyFavorites(params?: PaginationParams): Promise<PaginatedResponse<Event>> {
    return this.get<Event[]>('/my-favorites', params);
  }

  /**
   * Obtenir la liste des inscrits à un événement
   * La réponse inclut la pagination au même niveau que data
   */
  async getEventRegistrations(uid: string, params?: GetEventRegistrationsParams): Promise<ApiResponse<EventRegistrationsResponse> & { pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    // Utiliser la méthode get() standard qui retourne toute la réponse JSON
    // La pagination sera au même niveau que data dans la réponse complète
    return this.get<EventRegistrationsResponse>(`/${uid}/registrations`, params, true) as Promise<ApiResponse<EventRegistrationsResponse> & { pagination?: { page: number; limit: number; total: number; totalPages: number } }>;
  }
}
