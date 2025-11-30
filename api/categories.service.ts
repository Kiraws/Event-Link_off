import { BaseService } from './base.service';
import type { ApiResponse, PaginationParams, PaginatedResponse } from './base.service';

/**
 * Types pour les catégories
 */
export interface Category {
  uid: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  active: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  active?: boolean;
}

export interface GetCategoriesParams extends PaginationParams {
  active?: boolean;
}

/**
 * Service de gestion des catégories
 */
export class CategoriesService extends BaseService {
  constructor() {
    super('/categories');
  }

  /**
   * Obtenir la liste des catégories
   */
  async getAll(params?: GetCategoriesParams): Promise<PaginatedResponse<Category>> {
    return this.get<Category[]>('', params, false);
  }

  /**
   * Obtenir une catégorie par son UID
   */
  async getById(uid: string): Promise<ApiResponse<Category>> {
    return this.get<Category>(`/${uid}`, undefined, false);
  }

  /**
   * Créer une nouvelle catégorie
   */
  async create(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.post<Category>('', data);
  }

  /**
   * Mettre à jour une catégorie
   */
  async update(uid: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.put<Category>(`/${uid}`, data);
  }

  /**
   * Supprimer une catégorie (soft delete)
   * La catégorie est marquée comme supprimée avec deleted_at mais reste en base de données.
   * Elle n'apparaîtra plus dans les listes.
   */
  async delete(uid: string): Promise<ApiResponse> {
    return this.deleteRequest(`/${uid}`);
  }
}
