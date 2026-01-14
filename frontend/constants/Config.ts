// detect if we're on localhost to toggle between local and production API
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://matecheck-backend-api.fly.dev';
