# Contribuer à GirondeEntraide

Merci de votre intérêt pour le projet ! Toute contribution est la bienvenue.

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'est pas déjà signalé dans les [Issues](https://github.com/BaptGP/girondeentraide/issues)
2. Ouvrez une nouvelle issue avec :
   - Un titre clair et descriptif
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs le comportement observé
   - Votre navigateur et appareil (mobile/desktop)

### Proposer une fonctionnalité

1. Ouvrez une issue avec le label `enhancement`
2. Décrivez la fonctionnalité et son utilité dans le contexte d'urgence incendie
3. Attendez une discussion avant de commencer le développement

### Soumettre une Pull Request

1. **Forkez** le dépôt
2. Créez une branche depuis `main` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Codez votre modification
4. Vérifiez que le build passe :
   ```bash
   npm run build
   ```
5. Commitez avec un message clair (en français ou anglais) :
   ```bash
   git commit -m "Ajout du clustering des markers sur la carte"
   ```
6. Pushez et ouvrez une Pull Request vers `main`

## Règles de code

### Style

- **TypeScript** strict — pas de `any`
- **Tailwind CSS** pour tout le styling — pas de CSS custom sauf dans `index.css`
- Composants fonctionnels avec hooks (pas de classes)
- Noms de variables et fonctions en anglais
- Textes affichés à l'utilisateur en français

### Structure

- Un composant par fichier dans `src/components/`
- La logique partagée va dans `src/store.ts` ou `src/lib/`
- Les types et constantes vont dans `src/types.ts`

### Sécurité

- Ne jamais exposer de données sensibles (clés API, codes secrets) dans le code
- Les variables d'environnement vont dans `.env` (jamais commité)
- Utiliser `.env.example` pour documenter les variables nécessaires

### Performance

- L'application doit rester fluide sur mobile (3G/4G)
- Éviter les re-rendus inutiles (utiliser `useMemo`, `useCallback` quand pertinent)
- La carte doit rester performante avec un grand nombre de markers

## Environnement de développement

```bash
npm install
cp .env.example .env  # Renseignez vos clés Supabase
npm run dev
```

## Tests

Pour l'instant, pas de tests automatisés. Vérifiez manuellement que :
- L'application se lance sans erreur (`npm run dev`)
- Le build passe sans erreur (`npm run build`)
- Les fonctionnalités de base fonctionnent (création d'annonce, filtres, carte)

## Questions ?

Contact : contact@eliaman.com

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.
