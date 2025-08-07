import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database; // comes from wrangler.toml [[d1_databases]]
}


export interface Env {
  DB: D1Database; // comes from wrangler.toml [[d1_databases]]
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    // health check
    if (pathname === "/ping") return new Response("ok");

    if (pathname === "/collect" && request.method === "POST") {
      // basic payload from client
      let body: any = {};
      try { body = await request.json(); } catch {}

      const now = new Date().toISOString();
      const url = body.url ?? "";
      const ref = body.referrer ?? "";
      const ua = request.headers.get("user-agent") ?? "";
      const method = request.method;
      const meta = JSON.stringify(body.meta ?? {});

      // CF provides geodata & (depending on plan) connecting IP
      // prefer CF-Connecting-IP, else fall back (be careful with privacy)
      const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for") ??
        "";

      // @ts-ignore - Workers add cf to Request
      const country = (request as any).cf?.country ?? "";

      await env.DB.prepare(
        `INSERT INTO events (ts, url, referrer, ua, ip, country, method, meta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(now, url, ref, ua, ip, country, method, meta).run();

      return new Response(null, { status: 204 });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;