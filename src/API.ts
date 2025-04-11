/* eslint-disable */
// Tipos exactos para tu API testrlanda
export type Anuncios = {
    __typename: 'Anuncios';
    id: string;          // ¡Nota! En tu schema es String! (no ID)
    content: string | null;
    createdAt: string | null;
    // updatedAt: string; // Removido porque no está en tu schema
  };
  
  export type CreateAnunciosInput = {
    id: string;         // Required en tu schema
    content?: string | null;
    createdAt?: string | null;
  };
  
  export type UpdateAnunciosInput = {
    id: string;         // Required en tu schema
    content?: string | null;
    createdAt?: string | null;
  };
  
  // Operaciones de Mutación
  export type CreateAnunciosMutation = {
    __typename: 'Mutation';
    createAnuncios?: Anuncios | null;
  };
  
  // Operaciones de Subscription
  export type OnCreateAnunciosSubscription = {
    __typename: 'Subscription';
    onCreateAnuncios?: Anuncios | null;
  };
  
  // Conexión para listados (importante para listAnuncios)
  export type AnunciosConnection = {
    __typename: 'AnunciosConnection';
    items?: Array<Anuncios | null> | null;
    nextToken?: string | null;
  };
  
  // Tipos principales
  export type APITypes = {
    Anuncios: Anuncios;
    CreateAnunciosInput: CreateAnunciosInput;
    UpdateAnunciosInput: UpdateAnunciosInput;
    Mutation: {
      createAnuncios: CreateAnunciosMutation;
      updateAnuncios: CreateAnunciosMutation; // Puedes crear tipo aparte si difiere
      deleteAnuncios: { __typename: 'Mutation'; deleteAnuncios?: Anuncios | null };
    };
    Query: {
      getAnuncios: Anuncios | null;
      listAnuncios: AnunciosConnection;
    };
    Subscription: {
      onCreateAnuncios: OnCreateAnunciosSubscription;
      onUpdateAnuncios: OnCreateAnunciosSubscription; // Misma estructura
      onDeleteAnuncios: OnCreateAnunciosSubscription;
    };
  };