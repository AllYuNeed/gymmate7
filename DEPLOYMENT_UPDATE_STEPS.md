# Mortal Gyms Update Deployment Steps

## 1. Push Code

1. Commit these website changes to GitHub.
2. Let Vercel deploy the new commit.
3. Confirm these URLs load after deployment:
   - `https://mortalgyms.com/`
   - `https://mortalgyms.com/sitemap.xml`
   - `https://mortalgyms.com/robots.txt`
   - `https://mortalgyms.com/deleteuserdata`

## 2. Supabase

Run the new migration in Supabase:

```bash
supabase db push
```

Or paste the SQL from:

```text
supabase/migrations/20260616120000_guild_reports_streak_security.sql
```

This adds:

- user reports table and RLS
- co-leader guild permissions
- safe guild ownership transfer RPC
- co-leader guild boss summon permissions
- Sunday-protected streak RPCs

## 3. Google Analytics

1. Open Google Analytics.
2. Create or open the Mortal Gyms web data stream.
3. Copy the Measurement ID, for example `G-XXXXXXXXXX`.
4. In Vercel, open Project Settings > Environment Variables.
5. Add:

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

6. Redeploy Vercel.

## 4. Google Search Console

1. Open Google Search Console.
2. Add property: `https://mortalgyms.com`.
3. Use DNS verification if possible.
4. Submit sitemap:

```text
https://mortalgyms.com/sitemap.xml
```

5. Request indexing for the home page and `/deleteuserdata`.

## 5. Security Check

After Vercel deploys, confirm response headers include:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

## 6. Android App Reminder

Because the Capacitor app loads `https://mortalgyms.com`, this website deployment updates the Android app experience too. If you change native Android assets or plugins later, rebuild and upload a new AAB with a higher `versionCode`.
