/**
 * ConnectWise API Configuration
 *
 * Get these from: ConnectWise → Setup Tables → API Members
 * Create an API member and copy: Company ID, Public Key, Private Key
 * Client ID: Register at https://developer.connectwise.com/
 *
 * IMPORTANT: Do not commit real credentials. Use .env or a gitignored config.
 */

export const CONNECTWISE_CONFIG = {
  baseUrl:
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0',
  companyId: process.env.EXPO_PUBLIC_CW_COMPANY_ID || 'YOUR_COMPANY_ID',
  publicKey: process.env.EXPO_PUBLIC_CW_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  privateKey: process.env.EXPO_PUBLIC_CW_PRIVATE_KEY || 'YOUR_PRIVATE_KEY',
  clientId: process.env.EXPO_PUBLIC_CW_CLIENT_ID || 'YOUR_CLIENT_ID',
  /** When running on web, set this to your proxy URL to avoid CORS (e.g. http://localhost:3001) */
  proxyUrl: process.env.EXPO_PUBLIC_CW_PROXY_URL || '',
};
