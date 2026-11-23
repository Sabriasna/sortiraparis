# Questionnaire – Vos sorties à Paris (Le Mazette)

Questionnaire en ligne pour le business case « Défi Strat Entreprise » sur Le Mazette.

- `index.html` : le questionnaire (22 questions, 5 parties, renvois automatiques).
- `api/submit.js` : enregistre chaque réponse dans une base Redis (Upstash).
- `api/results.js` : renvoie les réponses, protégé par mot de passe.
- Résultats : ouvrir `https://<votre-site>.vercel.app/#resultats` et saisir le mot de passe.

## Mise en ligne sur Vercel

1. Sur vercel.com : **Add New → Project**, importer ce dépôt GitHub, puis **Deploy** (aucun réglage à changer).
2. Dans le projet : **Storage → Create Database → Upstash for Redis** (offre gratuite), puis **Connect** au projet.
3. **Settings → Environment Variables** : ajouter `RESULTS_PASSWORD` avec le mot de passe du groupe.
4. **Deployments → Redeploy** pour prendre en compte la base et le mot de passe.

## Export

Dans l'onglet Résultats, le bouton « Copier en CSV » copie toutes les réponses, à coller dans Excel ou Google Sheets.
