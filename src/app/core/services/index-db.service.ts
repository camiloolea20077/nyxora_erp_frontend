import { Injectable } from '@angular/core';
import localforage from 'localforage';

import { TokenResponse } from '../models/auth.model';

/** Persistencia de la sesión en IndexedDB (localforage). */
@Injectable({ providedIn: 'root' })
export class IndexDbService {
  private readonly KEY = 'nyxora.session';

  constructor() {
    localforage.config({
      name: 'nyxora-erp',
      storeName: 'session',
      version: 1.0,
    });
  }

  async saveSession(session: TokenResponse): Promise<void> {
    await localforage.setItem<TokenResponse>(this.KEY, session);
  }

  async loadSession(): Promise<TokenResponse | null> {
    return (await localforage.getItem<TokenResponse>(this.KEY)) ?? null;
  }

  async clear(): Promise<void> {
    await localforage.removeItem(this.KEY);
  }

  async getToken(): Promise<string | null> {
    return (await this.loadSession())?.accessToken ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getToken());
  }
}
