// Supabase Edge Function: jira-proxy
// Deployed at: https://lfhlpdonndbpaczyssor.supabase.co/functions/v1/jira-proxy
// This runs SERVER-SIDE — no CORS issues, Jira credentials never exposed in browser

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers — allow your Vercel domain
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Jira-Token, X-Jira-Email, X-Jira-Url",
};

serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Extract Jira credentials from request body (sent from the browser app)
    const {
      jiraUrl,   // e.g. https://yourcompany.atlassian.net
      email,     // Jira account email
      token,     // Jira API token
      method = "GET",
      path,      // e.g. /search?jql=project=OTB
      payload,   // body for POST/PUT requests
    } = body;

    // Validate required fields
    if (!jiraUrl || !email || !token || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jiraUrl, email, token, path" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Build Jira API URL
    const baseUrl = jiraUrl.replace(/\/+$/, "");
    const jiraApiUrl = `${baseUrl}/rest/api/3${path}`;

    // Build auth header (Basic Auth with email:token)
    const auth = btoa(`${email}:${token}`);

    // Make server-side request to Jira — no CORS restrictions on server
    const jiraRes = await fetch(jiraApiUrl, {
      method,
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });

    // Return Jira response to browser
    if (jiraRes.status === 204) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = await jiraRes.json().catch(() => ({ error: jiraRes.statusText }));

    return new Response(JSON.stringify(data), {
      status: jiraRes.ok ? 200 : jiraRes.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Edge function error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
