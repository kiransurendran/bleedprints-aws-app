export const publicEnv = {
  // siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173",
  siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || "https://zippy-truffle-bcaf25.netlify.app",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  imageBackend: import.meta.env.VITE_IMAGE_BACKEND || "supabase-storage",
  imageCdnBaseUrl: import.meta.env.VITE_IMAGE_CDN_BASE_URL || "",
  edgeFunctionsBaseUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || "",
  adminAccessPath:
    import.meta.env.VITE_ADMIN_ACCESS_PATH || "/vault/meridian-entry",
  adminDashboardPath:
    import.meta.env.VITE_ADMIN_DASHBOARD_PATH || "/vault/meridian-entry/studio",
};

export const hasSupabaseEnv =
  Boolean(publicEnv.supabaseUrl) && Boolean(publicEnv.supabasePublishableKey);

export const hasRazorpayEnv = Boolean(publicEnv.razorpayKeyId);
