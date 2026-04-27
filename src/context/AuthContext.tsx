import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase/client";

type UserRole = "customer" | "admin";

type UserProfileRow = {
  user_id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
};

export type AuthProfile = {
  userId: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
};

type SaveProfileInput = {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  isAdmin: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  saveProfile: (input: SaveProfileInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapProfileRow = (row: UserProfileRow): AuthProfile => ({
  userId: row.user_id,
  email: row.email,
  phone: row.phone,
  fullName: row.full_name,
  avatarUrl: row.avatar_url,
  role: row.role,
});

const buildFallbackProfile = (user: User): AuthProfile => ({
  userId: user.id,
  email: user.email ?? null,
  phone: user.phone ?? null,
  fullName:
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user.user_metadata?.name ?? null,
  avatarUrl:
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null,
  role: "customer",
});

async function fetchProfile(user: User): Promise<AuthProfile> {
  if (!supabase) {
    return buildFallbackProfile(user);
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, email, phone, full_name, avatar_url, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return buildFallbackProfile(user);
  }

  return mapProfileRow(data as UserProfileRow);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextProfile = await fetchProfile(nextSession.user);
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (error) {
        console.error("Unable to load user profile:", error);
        if (isMounted) {
          setProfile(buildFallbackProfile(nextSession.user));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    try {
      setProfile(await fetchProfile(session.user));
    } catch (error) {
      console.error("Unable to refresh profile:", error);
      setProfile(buildFallbackProfile(session.user));
    }
  }, [session]);

  const saveProfile = useCallback(
    async (input: SaveProfileInput) => {
      if (!supabase || !session?.user) {
        return;
      }

      const payload = {
        user_id: session.user.id,
        email: input.email ?? session.user.email ?? profile?.email ?? null,
        phone: input.phone ?? session.user.phone ?? profile?.phone ?? null,
        full_name:
          input.fullName ??
          profile?.fullName ??
          (typeof session.user.user_metadata?.full_name === "string"
            ? session.user.user_metadata.full_name
            : null),
        avatar_url:
          input.avatarUrl ??
          profile?.avatarUrl ??
          (typeof session.user.user_metadata?.avatar_url === "string"
            ? session.user.user_metadata.avatar_url
            : null),
      };

      const { error } = await supabase.from("user_profiles").upsert(payload, {
        onConflict: "user_id",
      });

      if (error) {
        throw error;
      }

      await refreshProfile();
    },
    [profile, refreshProfile, session],
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isAdmin: profile?.role === "admin",
      isConfigured: isSupabaseConfigured,
      isLoading,
      refreshProfile,
      saveProfile,
      signOut,
    }),
    [isLoading, profile, refreshProfile, saveProfile, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
