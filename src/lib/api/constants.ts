// Fichier volontairement sans dépendance : importé à la fois par le client
// API (Server Actions/Components, via next/headers) et par proxy.ts (contexte
// d'exécution distinct) — ne pas y ajouter d'import Next.js spécifique.
export const TOKEN_COOKIE = "civic_token";
