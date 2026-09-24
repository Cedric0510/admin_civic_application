# admin_civic

Dashboard du personnel municipal de City-Co (Next.js 16, React 19, Tailwind, shadcn/ui). Il pilote `civic_api` : actualitÃ©s, sondages, services, commerÃ§ants, signalements, rendez-vous, agenda des agents, comptes du personnel et, pour un super-administrateur, les communes.

## DÃ©marrage local

```bash
cp .env.example .env.local     # API_URL=http://localhost:4000
npm install
npm run dev                    # http://localhost:3000
```

`civic_api` doit tourner (voir son README). Connexion de dÃ©mo : `superadmin@city-co.dev` / `ChangeMe123!` (crÃ©Ã© par le seed de l'API, dev local uniquement).

Tests : `npm test` ; contrÃ´le du code : `npm run lint` ; build de production : `npm run build`.

## Fonctionnement

- **Aucune logique d'autorisation ici** : les Server Actions (`src/app/actions/`) relaient les appels Ã  `civic_api`, qui dÃ©cide seule des droits et du cloisonnement par commune. Le jeton est dans un cookie `httpOnly`.
- `proxy.ts` ne fait qu'un contrÃ´le de prÃ©sence du cookie ; `(dashboard)/layout.tsx` revalide le jeton auprÃ¨s de l'API avant d'afficher quoi que ce soit.
- Un **super-administrateur** choisit la commune qu'il gÃ¨re Ã  distance depuis Â« Communes Â» ; les autres rÃ´les sont limitÃ©s Ã  la leur.
- Les rÃ´les conditionnent le menu : les agents ne voient ni Â« Agents Â» ni Â« ParamÃ¨tres Â».

## Agenda et rendez-vous

- **Agenda** : grille hebdomadaire heure par heure d'un agent (chacun gÃ¨re le sien, un administrateur choisit l'agent). Disponible, Indisponible ou RÃ©tablir Ã  la semaine, au jour, Ã  la demi-journÃ©e ou Ã  l'heure ; les horaires habituels se rÃ¨glent en dessous.
- **Services** : durÃ©e d'un rendez-vous et agents qui reÃ§oivent sur ce service. Sans agent affiliÃ©, aucun crÃ©neau n'est proposÃ© aux citoyens.
- **Rendez-vous** : liste avec date, heure (fuseau Paris) et agent, filtres par service et par jour.

## Structure

```
src/app/(dashboard)/   pages du tableau de bord (un dossier par domaine)
src/app/actions/       Server Actions, un fichier par domaine
src/lib/api/           client HTTP vers civic_api
src/lib/session.ts     membre du personnel connectÃ©, commune gÃ©rÃ©e
src/lib/paris-time.ts  dates et heures en fuseau Europe/Paris
src/components/ui/     composants shadcn/ui
```
