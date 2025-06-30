/// <reference types="vite/client" />

import { IPreloadApi } from '@coffic/cosy-framework';

declare global {
  interface Window {
    ipc: IPreloadApi;
  }
}

export {};
