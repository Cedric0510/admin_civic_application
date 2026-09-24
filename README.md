# admin_civic

Dashboard du personnel municipal de City-Co (Next.js 16, React 19, Tailwind, shadcn/ui). Il pilote `civic_api` : actualités, sondages, services, commerçants, signalements, rendez-vous, agenda des agents, comptes du personnel et, pour un super-administrateur, les communes.

## Démarrage local

```bash
cp .env.example .env.local     # API_URL=http://localhost:4000
npm install
npm run dev                    # http://localhost:3000
```

`civic_api` doit tourner (voir son README). Connexion de démo : `superadmin@city-co.dev` / `ChangeMe123!` (créé par le seed de l'API, dev local uniquement).

Tests : `npm test` ; contrôle du code : `npm run lint` ; build de production : `npm run build`.

## Fonctionnement

- **Aucune logique d'autorisation ici** : les Server Actions (`src/app/actions/`) relaient les appels à `civic_api`, qui décide seule des droits et du cloisonnement par commune. Le jeton est dans un cookie `httpOnly`.
- `proxy.ts` ne fait qu'un contrôle de présence du cookie ; `(dashboard)/layout.tsx` revalide le jeton auprès de l'API avant d'afficher quoi que ce soit.
- Un **super-administrateur** choisit la commune qu'il gère à distance depuis « Communes » ; les autres rôles sont limités à la leur.
- Les rôles conditionnent le menu : les agents ne voient ni « Agents » ni « Paramètres ».

## Agenda et rendez-vous

- **Agenda** : grille hebdomadaire heure par heure d'un agent (chacun gère le sien, un administrateur choisit l'agent). Disponible, Indisponible ou Rétablir à la semaine, au jour, à la demi-journée ou à l'heure ; les horaires habituels se règlent en dessous.
- **Services** : durée d'un rendez-vous et agents qui reçoivent sur ce service. Sans agent affilié, aucun créneau n'est proposé aux citoyens.
- **Rendez-vous** : liste avec date, heure (fuseau Paris) et agent, filtres par service et par jour.

## Tableau de bord

La page d'accueil se lit d'un coup d'œil : un bandeau résume ce qui attend une réponse, puis chaque bloc répond à une question en langage clair. Les chiffres portent sur 7, 30 ou 90 jours (`?period=`) et sont comparés à la période précédente.

- **À traiter maintenant** : rendez-vous à confirmer et signalements à prendre en charge. La carte se colore selon l'ancienneté de la plus ancienne demande (dans les temps, à traiter rapidement, en retard) et mène à la liste concernée.
- **Habitants**, **Actualités**, **Sondages** (administrateurs) : arrivées par jour, lectures par jour avec les articles les plus lus, participation à chaque sondage en anneau.
- **Relation avec les habitants** (tous) : part des demandes traitées en moins de 24 h, délai habituel, répartition des délais, devenir des demandes reçues (confirmés, en attente, annulés / nouveaux, en cours, traités), volume par jour et catégories de signalements. Pour un agent, les rendez-vous se limitent à ceux qui lui sont attribués.

Tout est rendu côté serveur, sans bibliothèque de graphiques : courbes, histogrammes et anneaux sont en SVG/CSS et exposent un libellé pour les lecteurs d'écran. Les droits sont appliqués par l'API, qui n'envoie pas aux agents les sections réservées aux administrateurs.

## Identité visuelle

La couleur de marque reprend le bleu de l'application mobile ; elle est définie une seule fois dans `src/app/globals.css` (échelle `brand-50` à `brand-950`, bouton principal, fond des pages). Le menu latéral est groupé par thème et devient un tiroir sur mobile.

## Structure

```
src/app/(dashboard)/   pages du tableau de bord (un dossier par domaine)
src/app/actions/       Server Actions, un fichier par domaine
src/components/stats/  cartes, graphiques (SVG/CSS) et sections du tableau de bord
src/components/sidebar.tsx  menu latéral par rôle, tiroir sur mobile
src/lib/api/           client HTTP vers civic_api
src/lib/session.ts     membre du personnel connecté, commune gérée
src/lib/stats*.ts      récupération et mise en forme des métriques
src/lib/paris-time.ts  dates et heures en fuseau Europe/Paris
src/components/ui/     composants shadcn/ui
```
