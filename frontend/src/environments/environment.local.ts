export const environment = {
  production: true,
  // If we are on 'frontend' (Docker), call 'http://backend'
  // If we are on 'localhost' (Windows), call 'http://backend.localhost'
  apiUrl: window.location.hostname === 'frontend' 
    ? 'http://backend' 
    : 'http://backend.localhost',
};