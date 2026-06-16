import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireAdmin, RequireAuth } from "@/components/route-guards";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { publicEnv } from "@/lib/env";
import { createAppQueryClient } from "@/lib/query-client";

const HomePage = lazy(() => import("./pages/HomePage"));
const PosterDetailPage = lazy(() => import("./pages/PosterDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const CreatePosterPage = lazy(() => import("./pages/CreatePosterPage"));
const AdminCmsPage = lazy(() => import("./pages/AdminCmsPage"));
const AdminAccessPage = lazy(() => import("./pages/AdminAccessPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const FeaturedSeriesPage = lazy(() => import("./pages/FeaturedSeriesPage"));
const StaticContentPage = lazy(() => import("./pages/StaticContentPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = createAppQueryClient();

function RouteLoadingState() {
  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
      <div className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest px-8 py-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
          Loading
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          Preparing the next BleedPrints page.
        </p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingState />}>
              <Routes>
                <Route path="/collections" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<HomePage />} />
                <Route path="/series/summer-solstice" element={<FeaturedSeriesPage />} />
                <Route path="/poster/:slug" element={<PosterDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout"
                  element={
                    <RequireAuth>
                      <CheckoutPage />
                    </RequireAuth>
                  }
                />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route
                  path="/orders"
                  element={
                    <RequireAuth>
                      <OrderHistoryPage />
                    </RequireAuth>
                  }
                />
                <Route path="/create" element={<CreatePosterPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/account"
                  element={
                    <RequireAuth>
                      <AccountPage />
                    </RequireAuth>
                  }
                />
                <Route path={publicEnv.adminAccessPath} element={<AdminAccessPage />} />
                <Route
                  path={publicEnv.adminDashboardPath}
                  element={
                    <RequireAdmin>
                      <AdminCmsPage />
                    </RequireAdmin>
                  }
                />
                <Route path="/:contentSlug" element={<StaticContentPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
