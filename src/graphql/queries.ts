export const listUltimos5Anuncios = /* GraphQL */ `
    query ListUltimos5Anuncios {
        listAnuncios(
        limit: 5
        ) {
        items {
            id
            content
            createdAt
        }
        }
    }
`;