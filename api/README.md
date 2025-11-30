# Services API

Ce dossier contient tous les services pour interagir avec l'API Event Management.

## Configuration

L'URL de base de l'API est définie dans les variables d'environnement. Créez un fichier `.env` à la racine du projet avec :

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Utilisation

### Import des services

```typescript
// Import d'un service spécifique
import { authService, eventsService } from '../api';

// Ou import des classes pour créer vos propres instances
import { AuthService, EventsService } from '../api';

// Import des types
import type { Event, CreateEventRequest, User } from '../api';
```

### Exemples d'utilisation

#### Authentification

```typescript
import { authService } from '../api';

// Inscription
const registerResponse = await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890'
});

// Le token est automatiquement sauvegardé dans localStorage
console.log(registerResponse.data?.user);
console.log(registerResponse.data?.token);

// Connexion
const loginResponse = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123'
});

// Obtenir les informations de l'utilisateur connecté
const meResponse = await authService.me();
console.log(meResponse.data);

// Déconnexion
authService.logout();
```

#### Événements

```typescript
import { eventsService } from '../api';

// Obtenir tous les événements
const eventsResponse = await eventsService.getAll({
  page: 1,
  limit: 10,
  category_uid: 'some-category-uid',
  status: 'ACTIVE',
  search: 'concert'
});

console.log(eventsResponse.data); // Tableau d'événements

// Obtenir un événement par UID
const eventResponse = await eventsService.getById('event-uid-here');
console.log(eventResponse.data);

// Créer un événement
const newEventResponse = await eventsService.create({
  title: 'Concert de Jazz',
  description: 'Un magnifique concert de jazz en plein air',
  start_date: '2024-12-25T19:00:00Z',
  end_date: '2024-12-25T22:00:00Z',
  location: 'Parc Central, Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  is_free: true,
  is_multi_day: false,
  status: 'ACTIVE',
  organizer: 'Jazz Events',
  max_capacity: 500
});

// Mettre à jour un événement
const updateResponse = await eventsService.update('event-uid', {
  title: 'Nouveau titre',
  max_capacity: 600
});

// Supprimer un événement
await eventsService.delete('event-uid');

// S'inscrire à un événement gratuit
await eventsService.registerFree('event-uid');

// Se désinscrire
await eventsService.unregisterFree('event-uid');

// Vérifier l'inscription
const checkResponse = await eventsService.checkFreeRegistration('event-uid');
console.log(checkResponse.data?.is_registered);

// Obtenir mes inscriptions gratuites
const myRegistrations = await eventsService.getMyFreeRegistrations({
  page: 1,
  limit: 10
});
```

#### Catégories

```typescript
import { categoriesService } from '../api';

// Obtenir toutes les catégories
const categoriesResponse = await categoriesService.getAll({
  active: true
});

// Créer une catégorie
await categoriesService.create({
  name: 'Musique',
  slug: 'musique',
  description: 'Événements musicaux',
  active: true
});

// Mettre à jour une catégorie
await categoriesService.update('category-uid', {
  name: 'Musique Live'
});
```

#### Utilisateurs

```typescript
import { usersService } from '../api';

// Obtenir tous les utilisateurs
const usersResponse = await usersService.getAll({
  page: 1,
  limit: 10
});

// Obtenir un utilisateur
const userResponse = await usersService.getById('user-uid');

// Mettre à jour un utilisateur (ADMIN peut modifier le rôle)
await usersService.update('user-uid', {
  first_name: 'John',
  role: 'ADMIN' // Seuls les ADMIN peuvent modifier les rôles
});
```

#### Tickets

```typescript
import { ticketsService } from '../api';

// Obtenir tous mes tickets
const ticketsResponse = await ticketsService.getAll({
  status: 'ACTIVE'
});

// Acheter un ticket
await ticketsService.create({
  event_uid: 'event-uid',
  ticket_type_uid: 'ticket-type-uid'
});

// Valider un ticket
await ticketsService.validate('ticket-uid');
```

#### Transactions

```typescript
import { transactionsService } from '../api';

// Obtenir toutes mes transactions
const transactionsResponse = await transactionsService.getAll({
  status: 'COMPLETED'
});

// Créer une transaction
await transactionsService.create({
  ticket_uid: 'ticket-uid',
  amount: 5000,
  currency: 'XOF',
  payment_method: 'MOBILE_MONEY',
  payment_reference: 'REF123456'
});

// Mettre à jour le statut d'une transaction
await transactionsService.updateStatus('transaction-uid', {
  status: 'COMPLETED'
});
```

## Gestion des erreurs

Tous les services lancent des exceptions en cas d'erreur. Utilisez try/catch pour les gérer :

```typescript
try {
  const response = await eventsService.getAll();
  console.log(response.data);
} catch (error: any) {
  console.error('Erreur:', error.message);
  console.error('Status:', error.status);
}
```

## Gestion du token

Le token est automatiquement :
- Sauvegardé lors de la connexion/inscription
- Ajouté dans les headers de toutes les requêtes authentifiées
- Supprimé lors de la déconnexion

Pour gérer le token manuellement :

```typescript
import { getAuthToken, setAuthToken, removeAuthToken, hasAuthToken } from '../api';

// Vérifier si un token existe
if (hasAuthToken()) {
  const token = getAuthToken();
  console.log('Token présent:', token);
}

// Définir un token manuellement
setAuthToken('your-token-here');

// Supprimer le token
removeAuthToken();
```

## Services disponibles

- `authService` - Authentification (register, login, me, verifyEmail, etc.)
- `categoriesService` - Gestion des catégories
- `eventsService` - Gestion des événements
- `usersService` - Gestion des utilisateurs
- `ticketsService` - Gestion des tickets
- `transactionsService` - Gestion des transactions

Tous les services étendent `BaseService` qui fournit les méthodes HTTP de base (GET, POST, PUT, DELETE, PATCH).
