import { env } from '../config/env.js';
import { HttpClientService } from '../services/http-client.service.js';

class AuthService {
  private readonly httpClient: HttpClientService;

  constructor() {
    this.httpClient = new HttpClientService(env.authServiceUrl);
  }

  // Helper para extraer solo Authorization
  private extractAuth(headers?: Record<string, string>) {
    const { authorization } = headers ?? {};
    return authorization ? { authorization } : {};
  }

  async login(queryParams?: unknown, headers?: Record<string, string>) {
    return this.httpClient.get('/auth/login', {
      params: queryParams,
      headers: this.extractAuth(headers),
    });
  }

  async callback(queryParams?: unknown, headers?: Record<string, string>) {
    return this.httpClient.get('/auth/callback', {
      params: queryParams,
      headers: this.extractAuth(headers),
    });
  }

  async logout(queryParams?: unknown, headers?: Record<string, string>) {
    return this.httpClient.get('/auth/logout', {
      params: queryParams,
      headers: this.extractAuth(headers),
    });
  }

  async me(headers?: Record<string, string>) {
    return this.httpClient.get('/auth/me', {
      headers: this.extractAuth(headers),
    });
  }

  async verify(body: unknown, headers?: Record<string, string>) {
    return this.httpClient.post('/auth/verify', body, {
      headers: this.extractAuth(headers),
    });
  }
}

export const authService = new AuthService();
