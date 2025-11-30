/**
 * Exemple d'utilisation des services API dans un composant React
 * Ce fichier est uniquement à titre d'exemple, vous pouvez le supprimer
 */

import { useState, useEffect } from 'react';
import { 
  authService, 
  eventsService, 
  categoriesService,
  type Event,
  type Category 
} from './index';

// Exemple 1: Composant d'authentification
export function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authService.login({ email, password });
      console.log('Connexion réussie:', response.data?.user);
      // Le token est automatiquement sauvegardé
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}

// Exemple 2: Liste des événements
export function EventsListExample() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getAll({
        page: 1,
        limit: 10,
        status: 'ACTIVE'
      });
      setEvents(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Événements</h2>
      {events.map(event => (
        <div key={event.uid}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>Date: {new Date(event.start_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

// Exemple 3: Création d'un événement
export function CreateEventExample() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await eventsService.create({
        title,
        description,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        location,
        is_free: true,
        is_multi_day: false,
        status: 'ACTIVE'
      });
      
      console.log('Événement créé:', response.data);
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setLocation('');
    } catch (error: any) {
      console.error('Erreur:', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Titre"
        required
      />
      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        placeholder="Description"
        required
      />
      <input 
        type="text" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        placeholder="Lieu"
        required
      />
      <button type="submit">Créer l'événement</button>
    </form>
  );
}

// Exemple 4: Utilisation avec React Query ou SWR
export function EventsWithQueryExample() {
  // Si vous utilisez React Query:
  // const { data, isLoading, error } = useQuery('events', () => 
  //   eventsService.getAll().then(res => res.data)
  // );

  // Si vous utilisez SWR:
  // const { data, error, isLoading } = useSWR('events', () =>
  //   eventsService.getAll().then(res => res.data)
  // );

  return <div>Exemple avec React Query/SWR</div>;
}

// Exemple 5: Gestion des catégories
export function CategoriesExample() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAll({ active: true });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Catégories</h2>
      {categories.map(category => (
        <div key={category.uid}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
      ))}
    </div>
  );
}





