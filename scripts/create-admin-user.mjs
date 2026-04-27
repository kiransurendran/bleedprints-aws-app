import process from "node:process";
import { createClient } from "@supabase/supabase-js";

for (const envFile of [".env.local", ".env"]) {
  try {
    process.loadEnvFile?.(envFile);
  } catch {
    // Ignore missing env files and fall back to current process.env.
  }
}

const [email, password, ...fullNameParts] = process.argv.slice(2);
const fullName = fullNameParts.join(" ").trim();

if (!email || !password) {
  console.error(
    'Usage: npm run create-admin-user -- you@example.com "strong-password" "Your Name"',
  );
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminAccessPath =
  process.env.VITE_ADMIN_ACCESS_PATH || "/vault/meridian-entry";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: fullName ? { full_name: fullName } : undefined,
});

if (error) {
  console.error(`Unable to create admin auth user: ${error.message}`);
  process.exit(1);
}

if (!data.user) {
  console.error("Supabase returned no user record.");
  process.exit(1);
}

const { error: profileError } = await supabase.from("user_profiles").upsert(
  {
    user_id: data.user.id,
    email: data.user.email,
    phone: data.user.phone || null,
    full_name: fullName || data.user.user_metadata?.full_name || null,
    avatar_url:
      typeof data.user.user_metadata?.avatar_url === "string"
        ? data.user.user_metadata.avatar_url
        : null,
    role: "admin",
  },
  {
    onConflict: "user_id",
  },
);

if (profileError) {
  console.error(`Auth user created, but admin profile sync failed: ${profileError.message}`);
  process.exit(1);
}

console.log("Admin user created successfully.");
console.log(`Email: ${data.user.email}`);
console.log(`User ID: ${data.user.id}`);
console.log(`Admin login path: ${adminAccessPath}`);
