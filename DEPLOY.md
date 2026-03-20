# ImageQuoter — Deploy Guide

## Stack
- **Auth**: Clerk
- **AI**: OpenAI GPT-4o-mini (direct browser calls)
- **Credits**: 3 free/day (localStorage) + paid (Firestore)
- **Hosting**: Firebase Hosting

---

## Setup (one time)

### 1. Create .env file in project root
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
VITE_OPENAI_API_KEY=sk-your_key_here
```

Get Clerk key: https://dashboard.clerk.com → API Keys
Get OpenAI key: https://platform.openai.com/api-keys

> ⚠️ The OpenAI key is exposed in the browser bundle. To limit abuse:
> Go to OpenAI → API Keys → Edit your key → Restrict to "Chat completions" only
> Optionally add usage limits in OpenAI billing settings.

### 2. Install & deploy
```bash
npm install
npm run deploy
```

---

## Firebase Console checklist

1. **Enable Firestore** → Firebase Console → Firestore Database → Create database
2. **Deploy rules** → `npm run deploy:rules`
3. **Add authorized domains** → Authentication → Settings → Authorized domains:
   - `imagequoter-55382.web.app`

---

## Local dev
```bash
npm run dev
```
Both Clerk and OpenAI work in local dev automatically via the .env file.

---

## Live URLs
```
https://imagequoter-55382.web.app
```
