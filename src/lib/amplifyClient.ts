// src/lib/amplifyClient.ts
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult, GraphQLQuery } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// Tipo simplificado para el cliente
type SafeAmplifyClient = {
  graphql: <T>(query: GraphQLQuery<T>) => Promise<GraphQLResult<T>>;
};

let isConfigured = false;
let client: SafeAmplifyClient | null = null;

export async function configureAmplify(): Promise<SafeAmplifyClient> {
  if (!isConfigured) {
    try {
      const config = { ...awsconfig };
      delete (config as any).ssr; // Elimina propiedad no estándar
      
      Amplify.configure(config);
      isConfigured = true;
      client = generateClient() as unknown as SafeAmplifyClient;
      
      return client;
    } catch (error) {
      console.error('Error configurando Amplify:', error);
      throw error;
    }
  }
  return client!;
}

export async function getClient(): Promise<SafeAmplifyClient> {
  return client || await configureAmplify();
}

export async function checkAmplifyConfig() {
  return {
    configured: isConfigured,
    hasGraphQLConfig: !!Amplify.getConfig()?.API?.GraphQL
  };
}