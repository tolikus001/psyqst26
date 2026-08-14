'use client';

import { useEffect, useState } from 'react';

export interface NotibotUser {
  id?: string;
  displayName?: string;
  photoURL?: string;
  balance?: number;
  aiCredits?: number;
  aiCreditsSpent?: number;
}

export interface NotibotApp {
  shopId?: string;
  platform?: string;
  theme?: string;
  colors?: {
    background?: string;
    textPrimary?: string;
    textSecondary?: string;
    primaryMain?: string;
  };
}

export interface NotibotFormAnswer {
  title: string;
  answers: string[];
}

export interface NotibotBridgeInterface {
  user: NotibotUser;
  app: NotibotApp;
  onUpdate: (callback: (user: NotibotUser, app: NotibotApp) => void) => void;
  openProduct: (id: string | number) => void;
  openArticle: (id: string | number) => void;
  openStorefront: () => void;
  openUserCard: () => void;
  openPortal: (config?: Record<string, any>) => void;
  openLink: (url: string) => void;
  setScrollLock: (locked: boolean) => void;
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid', fallback?: boolean) => void;
  hapticNotification: (type?: 'success' | 'error' | 'warning', fallback?: boolean) => void;
  hapticSelection: (fallback?: boolean) => void;
  submitForm: (formId: string | number, answers: NotibotFormAnswer[]) => Promise<any>;
  callAiHook: (hookId: string, input: string, variables?: Record<string, any>, options?: { imageUrl?: string } | string) => Promise<any>;
  callAiHookStream: (hookId: string, input: string, variables?: Record<string, any>, arg4?: any, arg5?: any) => Promise<any>;
  uploadFile: (file: File) => Promise<{ url: string; fileName: string; fileType: string; fileSize: number }>;
}

declare global {
  interface Window {
    notibot?: NotibotBridgeInterface;
    notibotInitData?: { user?: NotibotUser; app?: NotibotApp };
    NotibotBridgeError?: any;
  }
}

export function useNotibot() {
  const [user, setUser] = useState<NotibotUser | null>(null);
  const [app, setApp] = useState<NotibotApp | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.notibot && typeof window.notibot.onUpdate === 'function') {
      window.notibot.onUpdate((u: NotibotUser, a: NotibotApp) => {
        setUser(u);
        setApp(a);
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  return { user, app, isReady };
}

