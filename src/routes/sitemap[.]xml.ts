import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://harshafair-field-finder.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
        ];

        try {
          const [{ data: profiles }, { data: listings }] = await Promise.all([
            supabaseAdmin.from("profiles").select("id").limit(1000),
            supabaseAdmin.from("crop_listings").select("id").eq("status", "active").limit(1000),
          ]);
          for (const p of profiles ?? []) entries.push({ path: `/u/${p.id}`, changefreq: "weekly", priority: "0.7" });
          for (const l of listings ?? []) entries.push({ path: `/listings/${l.id}`, changefreq: "weekly", priority: "0.6" });
        } catch {
          // fall back to just the homepage
        }

        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq ?? "weekly"}</changefreq>\n    <priority>${e.priority ?? "0.5"}</priority>\n  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});