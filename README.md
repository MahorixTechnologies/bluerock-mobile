# bluerock-mobile

## Backend connection

The app uses `EXPO_PUBLIC_API_URL` for API calls.

Create a local env file:

```bash
cp .env.example .env
```

Set the URL to your backend (the app automatically appends `/api/v1` if missing).

Examples:

- iOS simulator / Android emulator:
  - `EXPO_PUBLIC_API_URL=http://localhost:3000`
- Physical device on the same Wi-Fi:
  - `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000`

## End-to-end dev accounts (seed)

If you run the backend seed, you can use:

- Admin (web admin UI): `admin@bluerock.com` / `admin123`
- Landlord (mobile): `landlord@bluerock.com` / `landlord123`
- Renter (mobile): `renter@bluerock.com` / `renter123`
# bluerock-mobile
