import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Farmora" },
      { name: "description", content: "Farm Direct Connect links farmers directly to buyers for fair prices and transparent transactions." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Farmora" },
      { property: "og:description", content: "Farm Direct Connect links farmers directly to buyers for fair prices and transparent transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Farmora" },
      { name: "twitter:description", content: "Farm Direct Connect links farmers directly to buyers for fair prices and transparent transactions." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/VZEcQfMhg3Q4zMwthE2wtEDtM9C3/social-images/social-1777618654980-Firefly_Gemini_Flash_Create_a_website_hero_background_for_a_SaaS_product._Theme-_Sell_Your_Crops_at_the_Pr_307699.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/VZEcQfMhg3Q4zMwthE2wtEDtM9C3/social-images/social-1777618654980-Firefly_Gemini_Flash_Create_a_website_hero_background_for_a_SaaS_product._Theme-_Sell_Your_Crops_at_the_Pr_307699.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";

  return (
    <AuthProvider>
      {!isDashboard && !isLogin && <Navbar />}
      <main className={!isDashboard && !isLogin ? "pt-16" : ""}>
        <Outlet />
      </main>
      {!isDashboard && !isLogin && <Footer />}
      <Toaster />
    </AuthProvider>
  );
}
