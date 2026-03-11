# ConnectWise Alerts — Step-by-Step Setup Guide

This guide walks you through connecting your CyberApp to the ConnectWise REST API to display High and Critical priority tickets as alerts.

---

## Step 1: Get ConnectWise API Credentials

### 1.1 Create an API Member

1. Log in to **ConnectWise Manage**
2. Go to **Setup** → **Members** → **API Members**
3. Click **Add API Member**
4. Fill in:
   - **Description**: e.g. `CyberApp Mobile`
   - **Inactive**: Unchecked
5. Save and note:
   - **Company ID** (your ConnectWise company ID)
   - **Public Key**
   - **Private Key** (shown only once — copy it now)

### 1.2 Register a Client ID

1. Go to [ConnectWise Developer Portal](https://developer.connectwise.com/)
2. Register your application to get a **Client ID**
3. Or use a placeholder like `cyberapp-mobile` for testing (some instances allow it)

---

## Step 2: Find Your ConnectWise Base URL

Your API base URL depends on your region:

| Region        | Base URL                                      |
|---------------|-----------------------------------------------|
| North America | `https://api-na.myconnectwise.net/v4_6_release/apis/3.0` |
| Europe        | `https://api-eu.myconnectwise.net/v4_6_release/apis/3.0` |
| Australia     | `https://api-au.myconnectwise.net/v4_6_release/apis/3.0` |

Check your ConnectWise login URL to confirm the region (e.g. `na.myconnectwise.net` → North America).

---

## Step 3: Configure the App

### Option A: Environment Variables (recommended)

1. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_CW_BASE_URL=https://api-na.myconnectwise.net/v4_6_release/apis/3.0
EXPO_PUBLIC_CW_COMPANY_ID=your_company_id
EXPO_PUBLIC_CW_PUBLIC_KEY=your_public_key
EXPO_PUBLIC_CW_PRIVATE_KEY=your_private_key
EXPO_PUBLIC_CW_CLIENT_ID=your_client_id
```

2. Add `.env` to `.gitignore` so credentials are not committed.

### Option B: Edit config directly

Edit `config/connectwise.ts` and replace the placeholder values:

```typescript
export const CONNECTWISE_CONFIG = {
  baseUrl: 'https://api-na.myconnectwise.net/v4_6_release/apis/3.0',
  companyId: 'YOUR_COMPANY_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
  clientId: 'YOUR_CLIENT_ID',
};
```

> ⚠️ **Security**: Never commit real credentials. Use environment variables or a gitignored config file.

---

## Step 4: Match Priority Names

ConnectWise priority names vary by instance. The app filters for:

- `Priority 1 - Critical`
- `Priority 2 - High`

To see your actual priority names:

1. In ConnectWise: **Setup** → **Service** → **Priorities**
2. Note the exact names (e.g. `Critical`, `High`, `1 - Critical`, etc.)

If your names differ, edit `services/connectwiseApi.ts` and update the `conditions` in `fetchHighCriticalTickets`:

```typescript
// Example: if your priorities are "Critical" and "High"
const conditions =
  'priority/name="Critical" or priority/name="High"';
```

---

## Step 5: Run the App

```bash
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan the QR code with Expo Go on your device

Open the **Alerts** section in the app. You should see High and Critical tickets from ConnectWise.

---

## Step 6: Verify the Integration

| Feature              | Description                                      |
|----------------------|--------------------------------------------------|
| **Auto-refresh**     | Alerts refresh every 60 seconds                  |
| **Pull-to-refresh**  | Pull down to refresh manually                    |
| **Refresh button**   | Tap the Refresh button in the header             |
| **Empty state**      | Shows "All clear" when no High/Critical tickets  |
| **Error handling**   | Shows error message and Retry if API fails      |

---

## Troubleshooting

### "ConnectWise API error 401"
- Check Company ID, Public Key, and Private Key
- Ensure the API member is active and has Service Board access

### "ConnectWise API error 403"
- Verify Client ID is registered and correct
- Check API member permissions for tickets

### "No alerts showing"
- Confirm you have tickets with High or Critical priority
- Verify priority names in the `conditions` string match your ConnectWise setup
- Check the base URL region (na/eu/au)

### CORS / "access control checks" (web only)
- In the **browser**, ConnectWise blocks requests from your app (CORS). Use the **proxy**:
  1. Install deps: `npm install`
  2. Start the proxy: `npm run proxy` (runs on http://localhost:3001)
  3. In `.env` add: `EXPO_PUBLIC_CW_PROXY_URL=http://localhost:3001`
  4. Restart Expo and open the app in the browser — alerts will load via the proxy.
- On **iOS/Android** or **Expo Go**, no proxy needed; the app calls ConnectWise directly.

---

## Architecture Overview

```
Rapid7 Alert (High/Critical)
        ↓
ConnectWise creates ticket (via integration)
        ↓
Your CyberApp
  ├── Polls /service/tickets every 60s
  ├── Filters by priority = High or Critical
  └── Shows alerts with company, summary, status, time
```

---

## API Reference

- **Endpoint**: `GET /service/tickets`
- **Auth**: Basic `companyId+publicKey:privateKey` (base64)
- **Headers**: `clientId`, `Content-Type: application/json`
- **Params**: `conditions`, `orderBy`, `pageSize`
