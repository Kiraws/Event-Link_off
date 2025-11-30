/**
 * Configuration de l'API
 * Gère l'URL de base de l'API et les fonctions d'authentification
 */

const STORAGE_KEY = 'auth_token';

/**
 * Configuration de l'API
 */
export const API_CONFIG = {
  // URL de base de l'API depuis les variables d'environnement
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  // Préfixe de l'API
  apiPrefix: '/api',
  // URL complète de l'API (baseUrl + apiPrefix)
  get fullUrl() {
    return `${this.baseUrl}${this.apiPrefix}`;
  },
  // Endpoint de vérification de santé
  get healthCheck() {
    return `${this.baseUrl}/health`;
  },
};

/**
 * Récupère le token d'authentification depuis le localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Sauvegarde le token d'authentification dans le localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, token);
}

/**
 * Supprime le token d'authentification du localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Vérifie si un token d'authentification existe
 */
export function hasAuthToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Interface pour le payload JWT
 */
export interface JWTPayload {
  uid: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
  iat?: number;
  exp?: number;
}

/**
 * Décode le JWT et retourne le payload
 * @param token - Le token JWT (optionnel, utilise le token du localStorage si non fourni)
 * @returns Le payload décodé ou null si le token est invalide
 */
export function decodeJWT(token?: string): JWTPayload | null {
  try {
    const tokenToDecode = token || getAuthToken();
    if (!tokenToDecode) {
      return null;
    }

    // Supprimer le préfixe "Bearer " si présent
    const cleanToken = tokenToDecode.replace(/^Bearer\s+/i, '');

    // Décoder le payload (partie du milieu du JWT)
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload)) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

/**
 * Obtient le rôle de l'utilisateur depuis le JWT
 * @param token - Le token JWT (optionnel, utilise le token du localStorage si non fourni)
 * @returns Le rôle de l'utilisateur ou null si le token est invalide
 */
export function getRoleFromToken(token?: string): 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER' | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Obtient l'UID de l'utilisateur depuis le JWT
 * @param token - Le token JWT (optionnel, utilise le token du localStorage si non fourni)
 * @returns L'UID de l'utilisateur ou null si le token est invalide
 */
export function getUidFromToken(token?: string): string | null {
  const payload = decodeJWT(token);
  return payload?.uid || null;
}
