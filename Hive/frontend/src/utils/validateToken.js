// Checks if a JWT token exists and is not expired
export function validateToken(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // exp is in seconds, Date.now() in ms
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}
