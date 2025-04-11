// testSubscription.ts
import { generateClient } from 'aws-amplify/api';
import * as subscriptions from './graphql/subscriptions';
import type { GraphQLSubscription } from '@aws-amplify/api';
import type { OnCreateAnunciosSubscription } from './API';

const client = generateClient();

console.log('Iniciando suscripción a onCreateAnuncios...');

// Usamos OnCreateAnnouncementSubscription pero adaptado a tu esquema
const subscription = client
  .graphql<GraphQLSubscription<OnCreateAnunciosSubscription>>({ 
    query: subscriptions.onCreateAnuncios // Asegúrate que este nombre coincide con tu esquema
  })
  .subscribe({
    next: ({ data }) => {
      if (data) {
        // Nota: Usamos onCreateAnnouncement aunque tu suscripción es onCreateAnuncios
        console.log('Nuevo anuncio recibido:', data.onCreateAnuncios);
      }
    },
    error: (error: Error) => {
      console.error('Error en la suscripción:', error);
    }
  });

// Para limpiar la suscripción
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Suscripción detenida');
}, 60000);