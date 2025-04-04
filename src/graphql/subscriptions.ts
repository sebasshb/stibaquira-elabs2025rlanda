/* tslint:disable */
/* eslint-disable */
// Este archivo contiene las suscripciones de GraphQL

import * as APITypes from "../API";

type GeneratedSubscription<OutputType> = string & {
  __generatedSubscriptionOutput: OutputType;
};

// Suscripción a nuevos anuncios en tiempo real
export const newAnnouncement = /* GraphQL */ `subscription NewAnnouncement {
  newAnnouncement {
    id
    content
    createdAt
  }
}
` as GeneratedSubscription<
  { newAnnouncement: { id: string; content: string; createdAt: string } }
>;
