import { Link, useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MaterialIcon from "@/components/MaterialIcon";
import { useAuth } from "@/context/AuthContext";
import { publicEnv } from "@/lib/env";
import { usePageMetadata } from "@/lib/seo";
import { toast } from "@/components/ui/use-toast";

export default function AccountPage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  usePageMetadata({
    title: "My Account | BleedPrints",
    description:
      "Manage your BleedPrints account, view saved profile details, and access live orders.",
    path: "/account",
    noIndex: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-container-low pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-secondary">
              My Account
            </p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
                  {profile?.fullName || "Collector account"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
                  Manage your account details, track recent purchases, and return to the storefront whenever you are ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      await signOut();
                      toast({
                        title: "Signed out",
                        description: "Your session has been cleared.",
                      });
                      navigate("/auth", { replace: true });
                    } catch (error) {
                      console.error(error);
                      toast({
                        title: "Unable to sign out",
                        description:
                          error instanceof Error ? error.message : "Please try again.",
                      });
                    }
                  })();
                }}
                className="rounded-xl bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
              >
                Sign out
              </button>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[1.5rem] bg-surface-container-low p-6">
                <h2 className="text-xl font-headline font-bold text-on-surface">
                  Profile
                </h2>
                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                      Full Name
                    </p>
                    <p className="mt-2 text-on-surface">{profile?.fullName || "Not added yet"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                      Email
                    </p>
                    <p className="mt-2 text-on-surface">{profile?.email || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                      Phone
                    </p>
                    <p className="mt-2 text-on-surface">{profile?.phone || "Not added yet"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                      Role
                    </p>
                    <p className="mt-2 capitalize text-on-surface">{profile?.role || "customer"}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.5rem] bg-inverse-surface p-6 text-inverse-on-surface">
                <h2 className="text-xl font-headline font-bold">Quick Actions</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/orders"
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
                  >
                    <MaterialIcon icon="receipt_long" className="text-secondary" />
                    <h3 className="mt-4 font-headline text-lg font-bold">My Orders</h3>
                    <p className="mt-2 text-sm leading-6 text-inverse-on-surface/75">
                      See live order history linked to your account.
                    </p>
                  </Link>
                  <Link
                    to="/shop"
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
                  >
                    <MaterialIcon icon="collections" className="text-secondary" />
                    <h3 className="mt-4 font-headline text-lg font-bold">Browse catalog</h3>
                    <p className="mt-2 text-sm leading-6 text-inverse-on-surface/75">
                      Return to the latest curated drops and product pages.
                    </p>
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      to={publicEnv.adminDashboardPath}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10 sm:col-span-2"
                    >
                      <MaterialIcon icon="admin_panel_settings" className="text-secondary" />
                      <h3 className="mt-4 font-headline text-lg font-bold">Open admin studio</h3>
                      <p className="mt-2 text-sm leading-6 text-inverse-on-surface/75">
                        Your account is marked as admin, so you can access the hidden catalog studio route.
                      </p>
                    </Link>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
