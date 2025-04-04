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

// mutations.js
export const createTodo = /* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      description
      createdAt
    }
  }
`;
