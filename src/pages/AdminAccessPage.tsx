import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MaterialIcon from "@/components/MaterialIcon";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { publicEnv } from "@/lib/env";
import { usePageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

export default function AdminAccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isConfigured, isLoading, signOut, user } = useAuth();
  const redirectTarget =
    searchParams.get("redirect") || publicEnv.adminDashboardPath;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageMetadata({
    title: "Admin Access | BleedPrints",
    description:
      "Hidden admin sign-in route for the BleedPrints catalog studio.",
    path: publicEnv.adminAccessPath,
    noIndex: true,
  });

  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAdmin, isLoading, navigate, redirectTarget]);

  const handleAdminLogin = async () => {
    if (!supabase) {
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing admin credentials",
        description: "Enter your email and password to continue.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Admin sign-in complete",
        description: "Checking your studio permissions now.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to sign in",
        description:
          error instanceof Error
            ? error.message
            : "Please review your admin credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reason = searchParams.get("reason");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-container-low pt-28 pb-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-black px-8 py-10 text-white shadow-sm md:px-12 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/65">
              Hidden Admin Access
            </p>
            <h1 className="mt-4 text-4xl font-headline font-extrabold tracking-tight md:text-5xl">
              Protected studio access for catalog and merchandising operations.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
              This route is intentionally excluded from the public navigation. Access still requires
              a valid login and an admin role in Supabase before the CMS opens.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Admin authentication is handled through Supabase Auth.",
                "Catalog writes should be protected by role-based row-level policies, not open browser policies.",
                "The public storefront no longer exposes admin URLs in the main navbar.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <MaterialIcon icon="verified_user" className="mt-0.5 text-secondary" />
                  <p className="text-sm leading-6 text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm md:p-8">
            {!isConfigured ? (
              <div className="rounded-2xl bg-destructive/10 p-6 text-sm leading-7 text-on-surface">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to enable admin auth.
              </div>
            ) : user && !isAdmin ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-destructive/10 p-5 text-sm leading-7 text-on-surface">
                  {reason === "unauthorized"
                    ? "This signed-in account is not mapped to an admin role in Supabase yet."
                    : "You are signed in, but this account does not currently have admin access."}
                </div>
                <p className="text-sm leading-7 text-on-surface-variant">
                  Promote the account to `admin` in the `user_profiles` table, then return to this hidden access URL.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/account"
                    className="inline-flex items-center justify-center rounded-xl bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
                  >
                    Go to account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut().then(() => {
                        navigate(publicEnv.adminAccessPath, { replace: true });
                      });
                    }}
                    className="rounded-xl bg-cta-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
                    Admin Login
                  </p>
                  <h2 className="mt-3 text-3xl font-headline font-extrabold tracking-tight">
                    Sign in to the catalog studio
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Use the admin account that has been promoted in Supabase. The studio opens only after role verification.
                  </p>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                    placeholder="admin@bleedprints.com"
                    type="email"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                    Password
                  </span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                    placeholder="••••••••"
                    type="password"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAdminLogin}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-cta-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in…" : "Unlock admin studio"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
