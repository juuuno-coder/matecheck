// detect if we're on localhost to toggle between local and production API
// Note: When running on Android via Expo Go, 'localhost' refers to the device itself.
// You might need to change 'localhost' to your computer's local IP address (e.g., 192.168.x.x) for Android testing.
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://matecheck-backend-api.fly.dev';
