# Définir votre rôle en owner temporairement

## Option 1 : Console du navigateur (le plus rapide)

1. Ouvrez l'application dans votre navigateur
2. Appuyez sur **F12** pour ouvrir les DevTools
3. Allez dans l'onglet **Console**
4. Collez et exécutez ce code :

```javascript
localStorage.setItem("bartender-user-role", "owner");
location.reload();
```

5. La page se recharge → le menu "Rôles" devrait maintenant apparaître

## Option 2 : Via Firestore Console (permanent)

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet
3. Cliquez sur **Firestore Database** dans le menu de gauche
4. Naviguez vers la collection **users**
5. Trouvez votre document (votre uid)
6. Cliquez sur le document pour l'éditer
7. Ajoutez un champ :
   - **Field name:** `role`
   - **Type:** `string`
   - **Value:** `owner`
8. Cliquez sur **Save**
9. Rafraîchissez l'application

## Vérification

Dans la console du navigateur, tapez :
```javascript
localStorage.getItem("bartender-user-role")
```

Devrait retourner : `"owner"`

## Pourquoi le menu n'apparaît pas ?

Le menu "Rôles" n'est visible que si :
- Votre rôle est `owner` OU `admin`
- La permission `canManageUsers` est `true` (voir `client/lib/permissions.ts`)

Les `manager` et `employee` ne peuvent pas gérer les rôles.
