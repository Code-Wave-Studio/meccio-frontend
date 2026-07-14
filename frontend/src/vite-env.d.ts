/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL: string;
  /** Hostinger public uploads base — used on Cloudflare Pages builds */
  readonly VITE_UPLOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
