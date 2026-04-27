import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { publicEnv } from "@/lib/env";

function RouteGuardState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="max-w-lg rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="text-2xl font-headline font-extrabold tracking-tight text-on-surface">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { isConfigured, isLoading, user } = useAuth();

  if (!isConfigured) {
    return (
      <RouteGuardState
        title="Supabase auth is not configured"
        description="Add your Supabase URL and publishable key to use authenticated pages like orders, account, and admin access."
      />
    );
  }

  if (isLoading) {
    return (
      <RouteGuardState
        title="Checking your session"
        description="We are confirming your account session before loading this page."
      />
    );
  }

  if (!user) {
    const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    );
  }

  return children;
}

export function RequireAdmin({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { isAdmin, isConfigured, isLoading, user } = useAuth();

  if (!isConfigured) {
    return (
      <RouteGuardState
        title="Admin auth is not configured"
        description="Add your Supabase frontend credentials before using the admin studio."
      />
    );
  }

  if (isLoading) {
    return (
      <RouteGuardState
        title="Checking admin access"
        description="We are verifying your admin session before opening the studio."
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`${publicEnv.adminAccessPath}?redirect=${encodeURIComponent(
          `${location.pathname}${location.search}${location.hash}`,
        )}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to={`${publicEnv.adminAccessPath}?reason=unauthorized`}
        replace
      />
    );
  }

  return children;
}
