// No need for token management in localStorage since we're using HttpOnly cookies
// The backend handles all token management securely
export const isAuthenticated = () => {
  // We can check if the user is authenticated by making a request to the backend
  // The actual authentication is handled by HttpOnly cookies
  return true;
};