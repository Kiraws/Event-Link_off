/**
 * Point d'entrée principal pour tous les services API
 * Importez les services depuis ce fichier pour une utilisation facile
 */

// Configuration
export * from './config';
export { 
  API_CONFIG, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  hasAuthToken,
  decodeJWT,
  getRoleFromToken,
  getUidFromToken,
  type JWTPayload
} from './config';

// Services de base
export * from './base.service';
export { BaseService, type ApiResponse, type PaginationParams, type PaginatedResponse } from './base.service';

// Services
export * from './auth.service';
export { 
  AuthService, 
  type RegisterRequest, 
  type LoginRequest, 
  type User, 
  type AuthResponse,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type GoogleAuthRequest
} from './auth.service';

export * from './categories.service';
export { CategoriesService, type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from './categories.service';

export * from './events.service';
export { 
  EventsService, 
  type Event, 
  type CreateEventRequest, 
  type UpdateEventRequest,
  type EventRegistration,
  type EventRegistrationsResponse,
  type GetEventRegistrationsParams
} from './events.service';

export * from './users.service';
export { UsersService, type UpdateUserRequest } from './users.service';

export * from './tickets.service';
export { TicketsService, type Ticket, type CreateTicketRequest } from './tickets.service';

export * from './transactions.service';
export { TransactionsService, type Transaction, type CreateTransactionRequest, type UpdateTransactionStatusRequest } from './transactions.service';

export * from './dashboard.service';
export { DashboardService, type DashboardStats } from './dashboard.service';

export * from './contact.service';
export { 
  ContactService, 
  type ContactMessage, 
  type SendContactMessageRequest, 
  type ReplyContactMessageRequest,
  type GetContactMessagesParams
} from './contact.service';

// Import des classes pour créer les instances
import { AuthService } from './auth.service';
import { CategoriesService } from './categories.service';
import { EventsService } from './events.service';
import { UsersService } from './users.service';
import { TicketsService } from './tickets.service';
import { TransactionsService } from './transactions.service';
import { DashboardService } from './dashboard.service';
import { ContactService } from './contact.service';

/**
 * Instance unique de chaque service pour faciliter l'utilisation
 */
export const authService = new AuthService();
export const categoriesService = new CategoriesService();
export const eventsService = new EventsService();
export const usersService = new UsersService();
export const ticketsService = new TicketsService();
export const transactionsService = new TransactionsService();
export const dashboardService = new DashboardService();
export const contactService = new ContactService();
