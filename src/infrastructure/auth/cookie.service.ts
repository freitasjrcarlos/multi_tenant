import { Response } from 'express';

export class CookieService {
  private cookieName = 'auth_token';
  private httpOnly = true;
  private secure = process.env.NODE_ENV === 'production';
  private sameSite: 'strict' | 'lax' | 'none' = 'strict';

  setToken(res: Response, token: string): void {
    res.cookie(this.cookieName, token, {
      httpOnly: this.httpOnly,
      secure: this.secure,
      sameSite: this.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearToken(res: Response): void {
    res.clearCookie(this.cookieName, {
      httpOnly: this.httpOnly,
      secure: this.secure,
      sameSite: this.sameSite,
    });
  }

  getTokenFromCookie(cookies: { [key: string]: string } | undefined): string | null {
    if (!cookies || !cookies[this.cookieName]) {
      return null;
    }
    return cookies[this.cookieName];
  }
}

