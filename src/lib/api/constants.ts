// Fichier volontairement sans dépendance : importé à la fois par le client
// API (Server Actions/Components, via next/headers) et par proxy.ts (contexte
// d'exécution distinct) — ne pas y ajouter d'import Next.js spécifique.
export const TOKEN_COOKIE = "civic_token";

// Commune qu'un super-admin a choisi de gérer à distance (cf. session.ts,
// getManagedCommune) — n'a aucun effet pour un agent/administrateur, qui a
// toujours sa propre commune.
export const MANAGED_COMMUNE_COOKIE = "civic_managed_commune";
