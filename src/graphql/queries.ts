// Actualiza la consulta a 'getTodo' basado en el esquema de AppSync
export const getTodo = /* GraphQL */ `
  query {
  getAnuncios(id: "1") {
    id
    content
    createdAt
  }
}
`;


