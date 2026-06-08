# Setup Guide - Football Team Management Mobile App

## Quick Start

### 1. Firebase Configuration

**Get your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to Project Settings → Your apps → select the web app
4. Copy the Firebase config object

**Update the config file:**
Edit `src/firebase/config.ts`:
```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 2. Firebase Rules Setup

**Authentication:**
- Enable "Email/Password" provider in Firebase Console
- Go to Authentication → Sign-in method → Email/Password → Enable

**Firestore:**
- Create database in Firestore (US region recommended)
- Use these security rules (in Firestore → Rules):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for all
    match /teams/{document=**} {
      allow read: if true;
    }
    match /players/{document=**} {
      allow read: if true;
    }
    match /matches/{document=**} {
      allow read: if true;
    }
    match /goals/{document=**} {
      allow read: if true;
    }
    match /assists/{document=**} {
      allow read: if true;
    }
    match /yellowCards/{document=**} {
      allow read: if true;
    }
    match /redCards/{document=**} {
      allow read: if true;
    }
    
    // User documents - each user can read/write their own
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // User roles - readable by authenticated users, writable by admins
    match /user_roles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 3. Install Dependencies

```bash
cd kickoffApp
npm install
```

### 4. Create Initial Data

To test the app, you need some data. Create collections in Firestore:

**Collections to create:**
- `teams`
- `players`
- `matches`
- `goals`
- `assists`
- `yellowCards`
- `redCards`
- `users`
- `user_roles`
- `settings`

**Sample team document:**
```json
{
  "id": "team-1",
  "name": "Manchester United",
  "primaryColor": "#DA291C",
  "founded": "1878",
  "stadium": "Old Trafford"
}
```

**Sample player document:**
```json
{
  "id": "player-1",
  "name": "John Doe",
  "position": "FW",
  "number": 7,
  "teamId": "team-1",
  "isManager": false,
  "createdAt": 1717410000000
}
```

**Sample match document:**
```json
{
  "id": "match-1",
  "matchDay": 1,
  "homeTeamId": "team-1",
  "awayTeamId": "team-2",
  "homeScore": 2,
  "awayScore": 1,
  "homeYellows": 1,
  "awayYellows": 0,
  "homeReds": 0,
  "awayReds": 0,
  "homePoints": 3,
  "awayPoints": 0,
  "status": "played",
  "scheduledDate": "2024-06-03T15:00:00Z",
  "createdAt": 1717410000000
}
```

### 5. Run the App

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

### 6. Testing Authentication

**Test user:**
- Email: `test@example.com`
- Password: `password123`

Or create a new account directly in the app.

## Environment Variables (Optional)

Create `.env` file in project root:
```
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
```

Then update `src/firebase/config.ts` to use environment variables.

## Troubleshooting

### App won't start
- Check Node version: `node --version` (should be v16+)
- Clear cache: `npm cache clean --force` and `expo cache clean`
- Reinstall: `rm -rf node_modules && npm install`

### Firebase connection error
- Verify internet connection
- Check Firebase config in `src/firebase/config.ts`
- Check network tab in browser DevTools (if using web)

### No data showing
- Verify Firestore has data in collections
- Check browser console for errors (if using web)
- Check Firestore security rules allow read access

### Auth stuck on loading
- Check `AuthContext.tsx` logs in console
- Verify Firebase Auth is enabled
- Check user exists in Firebase Auth

## Development Tips

### Debug Mode
Use React Query DevTools (comes with setup):
```bash
# DevTools will show in app (web only currently)
```

### Common Edits
- **Add new screen**: Create file in `src/screens/app/`
- **Add new hook**: Create file in `src/hooks/`
- **Add new query**: Update `src/firebase/firestore.ts` and `src/hooks/useAppData.ts`
- **Update types**: Edit `src/lib/types.ts`

### Navigation
- Add new tab: Edit `src/navigation/RootNavigator.tsx`
- Add stack navigator: Create new stack in RootNavigator

## Next Development Tasks

1. **Immediate (Blocking)**
   - [ ] Add Firebase config to `src/firebase/config.ts`
   - [ ] Create Firestore collections and sample data
   - [ ] Test sign in/sign up flow

2. **Priority (First Sprint)**
   - [ ] Add team detail screen with roster
   - [ ] Add match detail screen with events
   - [ ] Add user profile screen
   - [ ] Add sign out button

3. **Enhancement (Second Sprint)**
   - [ ] Add admin match recording interface
   - [ ] Add player/team photo upload
   - [ ] Add fixture generation
   - [ ] Improve error handling

4. **Polish (Third Sprint)**
   - [ ] Add loading skeletons
   - [ ] Add animations
   - [ ] Dark mode support
   - [ ] Offline caching

## Performance Optimization

- React Query caches with 2-10 min stale time
- Lazy load screens with React Navigation
- Memoize expensive components
- Avoid passing new objects as props

## Support

For issues:
1. Check the troubleshooting section
2. Look at console logs (Cmd+J on web, Expo app console)
3. Check Firebase console for errors
4. Refer to [React Native Docs](https://reactnative.dev/)
