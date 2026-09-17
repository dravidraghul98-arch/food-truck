// Cookie utility module for Arabian Delights session storage

export function setCookie(name: string, value: string, days: number = 7): void {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    // SameSite=Lax; Secure flag if HTTPS
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secureFlag}; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed setting cookie:', err);
  }
}

export function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (err) {
    console.warn('Failed getting cookie:', err);
  }
  return null;
}

export function deleteCookie(name: string): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed deleting cookie:', err);
  }
}

export const SESSION_COOKIE_NAME = 'arabian_delights_session_user';

export function setSessionCookie(user: any, days = 7): void {
  if (user) {
    setCookie(SESSION_COOKIE_NAME, JSON.stringify(user), days);
  } else {
    deleteCookie(SESSION_COOKIE_NAME);
  }
}

export function getSessionCookie(): any | null {
  const cookieStr = getCookie(SESSION_COOKIE_NAME);
  if (!cookieStr) return null;
  try {
    return JSON.parse(cookieStr);
  } catch {
    return null;
  }
}
