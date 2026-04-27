import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MaterialIcon from "@/components/MaterialIcon";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { publicEnv } from "@/lib/env";
import { usePageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

type AuthView = "signin" | "signup" | "phone";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConfigured, isLoading, profile, saveProfile, signOut, user } = useAuth();
  const redirectTarget = searchParams.get("redirect") || "/";
  const [view, setView] = useState<AuthView>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"request" | "verify">("request");
  const [emailForm, setEmailForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [phoneForm, setPhoneForm] = useState({
    fullName: "",
    phone: "",
    token: "",
  });

  usePageMetadata({
    title: "Sign In | BleedPrints",
    description:
      "Access your BleedPrints account with email, phone OTP, Google, or Apple sign-in.",
    path: "/auth",
    noIndex: true,
  });

  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isLoading, navigate, redirectTarget, user]);

  const authHeadline = useMemo(
    () =>
      view === "signup"
        ? "Create your BleedPrints account"
        : view === "phone"
          ? "Continue with your phone"
          : "Sign in to your account",
    [view],
  );

  const updateEmailForm = (key: keyof typeof emailForm, value: string) => {
    setEmailForm((current) => ({ ...current, [key]: value }));
  };

  const updatePhoneForm = (key: keyof typeof phoneForm, value: string) => {
    setPhoneForm((current) => ({ ...current, [key]: value }));
  };

  const handleEmailAuth = async () => {
    if (!supabase) {
      return;
    }

    if (!emailForm.email.trim() || !emailForm.password.trim()) {
      toast({
        title: "Missing credentials",
        description: "Email and password are required.",
      });
      return;
    }

    if (view === "signup" && !emailForm.fullName.trim()) {
      toast({
        title: "Missing name",
        description: "Add your full name so we can prepare your account.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (view === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: emailForm.email.trim(),
          password: emailForm.password,
          options: {
            emailRedirectTo: `${publicEnv.siteUrl}${redirectTarget}`,
            data: {
              full_name: emailForm.fullName.trim(),
              phone: emailForm.phone.trim() || null,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          await saveProfile({
            email: emailForm.email.trim(),
            phone: emailForm.phone.trim() || null,
            fullName: emailForm.fullName.trim(),
          });
        }

        toast({
          title: "Account created",
          description:
            data.session
              ? "You are signed in and ready to continue."
              : "Check your email to confirm your account, then come back to continue.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailForm.email.trim(),
          password: emailForm.password,
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Signed in",
          description: "Welcome back to BleedPrints.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: view === "signup" ? "Unable to create account" : "Unable to sign in",
        description:
          error instanceof Error
            ? error.message
            : "Please review your details and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneOtp = async () => {
    if (!supabase) {
      return;
    }

    if (!phoneForm.phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Enter your phone number to receive a login code.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (phoneStep === "request") {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneForm.phone.trim(),
          options: {
            shouldCreateUser: true,
            data: {
              full_name: phoneForm.fullName.trim() || null,
            },
          },
        });

        if (error) {
          throw error;
        }

        setPhoneStep("verify");
        toast({
          title: "Verification code sent",
          description: "Enter the SMS code to finish signing in.",
        });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneForm.phone.trim(),
          token: phoneForm.token.trim(),
          type: "sms",
        });

        if (error) {
          throw error;
        }

        if (phoneForm.fullName.trim()) {
          await saveProfile({
            phone: phoneForm.phone.trim(),
            fullName: phoneForm.fullName.trim(),
          });
        }

        toast({
          title: "Phone verified",
          description: "You are signed in and ready to continue.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Phone sign-in failed",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!supabase) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${publicEnv.siteUrl}${redirectTarget}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
      const providerName = provider === "google" ? "Google" : "Apple";
      const providerErrorMessage =
        error instanceof Error ? error.message : "Please try again in a moment.";
      const description =
        providerErrorMessage.includes("provider is not enabled") ||
        providerErrorMessage.includes("Unsupported provider")
          ? `Enable ${providerName} in Supabase Authentication > Providers before using this sign-in option.`
          : providerErrorMessage;
      toast({
        title: `Unable to start ${providerName} sign-in`,
        description,
      });
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-container-low pt-28 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-inverse-surface px-8 py-10 text-inverse-on-surface shadow-sm md:px-12 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-inverse-on-surface/70">
              Account Access
            </p>
            <h1 className="mt-4 text-4xl font-headline font-extrabold tracking-tight md:text-5xl">
              Sign in for order tracking, faster checkout, and saved details.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-inverse-on-surface/78">
              Customer accounts power order history, personalized checkout, and future drop access.
              Google, Apple, email, and phone sign-in are all supported through Supabase Auth.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: "inventory_2",
                  title: "Order tracking",
                  copy: "See real order updates instead of static sample history.",
                },
                {
                  icon: "bolt",
                  title: "Faster checkout",
                  copy: "Reuse your saved customer details across future purchases.",
                },
                {
                  icon: "verified_user",
                  title: "Secure identity",
                  copy: "Supabase handles sessions, provider auth, and account recovery flows.",
                },
                {
                  icon: "collections_bookmark",
                  title: "Saved preferences",
                  copy: "Build toward saved collections, wishlists, and collector perks.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <MaterialIcon icon={item.icon} className="text-secondary" />
                  <h2 className="mt-4 text-lg font-headline font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-inverse-on-surface/75">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm md:p-8">
            {!isConfigured ? (
              <div className="rounded-2xl bg-destructive/10 p-6 text-sm leading-7 text-on-surface">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to enable customer auth.
              </div>
            ) : user && profile ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
                    Already signed in
                  </p>
                  <h2 className="mt-3 text-3xl font-headline font-extrabold tracking-tight">
                    Welcome back{profile.fullName ? `, ${profile.fullName}` : ""}.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Your account session is active. Jump back into the collections or open your profile any time.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-xl bg-cta-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Browse collections
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-container-low p-1">
                  {[
                    { id: "signin", label: "Sign in" },
                    { id: "signup", label: "Register" },
                    { id: "phone", label: "Phone OTP" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setView(tab.id as AuthView);
                        if (tab.id === "phone") {
                          setPhoneStep("request");
                        }
                      }}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        view === tab.id
                          ? "bg-surface-container-lowest text-on-surface shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
                    {authHeadline}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {view === "signup"
                      ? "Create an account with email and password, then we will prepare your profile and order history."
                      : view === "phone"
                        ? "Use a one-time SMS code to sign in or create your account."
                        : "Use your email and password, or continue with your preferred sign-in provider."}
                  </p>
                </div>

                {view !== "phone" ? (
                  <div className="mt-8 grid gap-4">
                    {view === "signup" && (
                      <>
                        <label className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                            Full Name
                          </span>
                          <input
                            value={emailForm.fullName}
                            onChange={(event) =>
                              updateEmailForm("fullName", event.target.value)
                            }
                            className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                            placeholder="Julianne Moore"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                            Phone
                          </span>
                          <input
                            value={emailForm.phone}
                            onChange={(event) =>
                              updateEmailForm("phone", event.target.value)
                            }
                            className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                            placeholder="+91 98765 43210"
                          />
                        </label>
                      </>
                    )}
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                        Email
                      </span>
                      <input
                        value={emailForm.email}
                        onChange={(event) =>
                          updateEmailForm("email", event.target.value)
                        }
                        className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                        placeholder="you@example.com"
                        type="email"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                        Password
                      </span>
                      <input
                        value={emailForm.password}
                        onChange={(event) =>
                          updateEmailForm("password", event.target.value)
                        }
                        className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                        placeholder="Minimum 6 characters"
                        type="password"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleEmailAuth}
                      disabled={isSubmitting}
                      className="mt-2 rounded-xl bg-cta-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Working…"
                        : view === "signup"
                          ? "Create account"
                          : "Sign in"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 grid gap-4">
                    {phoneStep === "request" && (
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                          Full Name
                        </span>
                        <input
                          value={phoneForm.fullName}
                          onChange={(event) =>
                            updatePhoneForm("fullName", event.target.value)
                          }
                          className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                          placeholder="Julianne Moore"
                        />
                      </label>
                    )}
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                        Phone Number
                      </span>
                      <input
                        value={phoneForm.phone}
                        onChange={(event) =>
                          updatePhoneForm("phone", event.target.value)
                        }
                        className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </label>
                    {phoneStep === "verify" && (
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                          Verification Code
                        </span>
                        <input
                          value={phoneForm.token}
                          onChange={(event) =>
                            updatePhoneForm("token", event.target.value)
                          }
                          className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm"
                          placeholder="123456"
                        />
                      </label>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handlePhoneOtp}
                        disabled={isSubmitting}
                        className="rounded-xl bg-cta-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {isSubmitting
                          ? "Working…"
                          : phoneStep === "request"
                            ? "Send code"
                            : "Verify and sign in"}
                      </button>
                      {phoneStep === "verify" && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep("request");
                            updatePhoneForm("token", "");
                          }}
                          className="rounded-xl bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
                        >
                          Use another number
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-outline-variant/40" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-outline-variant/40" />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleOAuth("google")}
                      disabled={isSubmitting}
                      className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
                    >
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuth("apple")}
                      disabled={isSubmitting}
                      className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim"
                    >
                      Continue with Apple
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
