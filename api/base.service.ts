import { API_CONFIG, getAuthToken } from './config';

/**
 * Types de base pour les réponses API
 */
export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
  limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Classe de base pour tous les services API
 * Fournit les méthodes communes pour faire des requêtes HTTP
 */
export class BaseService {
  protected baseUrl: string;
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.baseUrl = `${API_CONFIG.fullUrl}${endpoint}`;
  }

  /**
   * Construit l'URL complète avec les paramètres de requête
   */
  protected buildUrl(path: string = '', params?: Record<string, any>): string {
    const url = path ? `${this.baseUrl}${path}` : this.baseUrl;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return `${url}?${searchParams.toString()}`;
    }
    
    return url;
  }

  /**
   * Récupère les en-têtes de requête avec l'authentification
   */
  protected getHeaders(includeAuth: boolean = true, includeContentType: boolean = true): HeadersInit {
    const headers: Record<string, string> = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Gère les erreurs HTTP
   */
  protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      // Gérer les erreurs de validation spécifiques
      let errorMessage = data.message || data.error || `Erreur ${response.status}: ${response.statusText}`;
      
      // Si l'erreur contient des détails de validation (comme "body/email must match format")
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map((e: any) => e.message || e).join(', ');
      } else if (typeof data === 'object' && data.details) {
        errorMessage = data.details;
      }
      
      const error: ApiResponse = {
        status: 'error',
        message: errorMessage,
        error: data.error || errorMessage,
      };
      
      // Ajouter le code de statut HTTP pour un meilleur débogage
      (error as any).status = response.status;
      throw error;
    }

    return data as ApiResponse<T>;
  }

  /**
   * Méthode GET
   */
  protected async get<T>(
    path: string = '',
    params?: Record<string, any>,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(requireAuth),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Méthode POST
   */
  protected async post<T>(
    path: string = '',
    body?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(requireAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Méthode PUT
   */
  protected async put<T>(
    path: string = '',
    body?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(requireAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Méthode DELETE
   * Note: Pas de Content-Type pour DELETE sans body
   */
  protected async deleteRequest<T>(
    path: string = '',
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(requireAuth, false), // Pas de Content-Type pour DELETE sans body
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Méthode PATCH
   */
  protected async patch<T>(
    path: string = '',
    body?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(requireAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }
}
