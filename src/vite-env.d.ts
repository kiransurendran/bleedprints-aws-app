/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_IMAGE_BACKEND?: string;
  readonly VITE_IMAGE_CDN_BASE_URL?: string;
  readonly VITE_ADMIN_ACCESS_PATH?: string;
  readonly VITE_ADMIN_DASHBOARD_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
