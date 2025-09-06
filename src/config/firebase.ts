// Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FB_API_KEY',
  'VITE_FB_AUTH_DOMAIN', 
  'VITE_FB_PROJECT_ID',
  'VITE_FB_STORAGE_BUCKET',
  'VITE_FB_MESSAGING_SENDER_ID',
  'VITE_FB_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
