# Deploy Jira Proxy — Supabase Edge Function

## What this does
Runs server-side on Supabase — browser calls Edge Function → Edge Function calls Jira.
No CORS issues ever again. Jira token never exposed.

## Step 1 — Install Supabase CLI
```bash
# Mac
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop install supabase

# Or via npm (any platform)
npm install -g supabase
```

## Step 2 — Login to Supabase
```bash
supabase login
```
Opens browser → click "Authorize" → done.

## Step 3 — Link your project
```bash
cd supabase-edge
supabase link --project-ref lfhlpdonndbpaczyssor
```

## Step 4 — Deploy the Edge Function
```bash
supabase functions deploy jira-proxy
```

You'll see:
```
✓ Function jira-proxy deployed to https://lfhlpdonndbpaczyssor.supabase.co/functions/v1/jira-proxy
```

## Step 5 — Test it works
```bash
curl -X POST https://lfhlpdonndbpaczyssor.supabase.co/functions/v1/jira-proxy \
  -H "Authorization: Bearer sb_publishable_Q4QljtXuRCynqfaXOLQuWw_IW25knRT" \
  -H "Content-Type: application/json" \
  -d '{
    "jiraUrl": "https://garageplug.atlassian.net",
    "email": "ashish.jha@garageplug.com",
    "token": "YOUR_JIRA_TOKEN",
    "method": "GET",
    "path": "/project/OTB"
  }'
```

Should return your Jira project details.

## Step 6 — Upload new index.html to GitHub
Upload the OTB_EdgeFunction.zip → index.html to your GitHub repo → Vercel redeploys.

## Done!
Go to Settings → Jira → Save & Connect → ✓ Connected with live data.

---

## If you don't have CLI / prefer dashboard:

1. Go to supabase.com → your project → Edge Functions
2. Click "New Function" → name it `jira-proxy`
3. Paste the contents of `supabase/functions/jira-proxy/index.ts`
4. Click Deploy
