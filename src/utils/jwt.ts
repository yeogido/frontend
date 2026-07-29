import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;
}

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);

    if (!exp) return false;

    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
