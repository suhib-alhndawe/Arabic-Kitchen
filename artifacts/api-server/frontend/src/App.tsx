import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import NotFound from "@/pages/not-found";

// Admin
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import MenuManagement from "@/pages/admin/MenuManagement";
import CategoriesManagement from "@/pages/admin/CategoriesManagement";
import MediaManager from "@/pages/admin/MediaManager";
import Settings from "@/pages/admin/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={Dashboard} />
          <Route path="/admin/menu" component={MenuManagement} />
          <Route path="/admin/categories" component={CategoriesManagement} />
          <Route path="/admin/media" component={MediaManager} />
          <Route path="/admin/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/menu" component={Menu} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Force RTL and Arabic font for the entire application */}
        <div dir="rtl" lang="ar" className="min-h-screen bg-background text-foreground font-arabic relative flex flex-col">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
