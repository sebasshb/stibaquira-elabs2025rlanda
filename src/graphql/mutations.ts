// mutations.ts
export const createAnuncios = /* GraphQL */ `
  mutation CreateAnuncios($input: CreateAnunciosInput!) {
    createAnuncios(input: $input) {
      id
      content
      createdAt
    }
  }
`;
