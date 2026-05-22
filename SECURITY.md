# Security

## API keys and secrets

- **Never commit** `.env`, `.env.local`, or any file containing real API keys.
- Use `.env.example` files as templates with placeholder values only.
- Store production secrets in **Vercel**, **Render**, or your host’s environment variable UI.

### Local setup

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your real keys
```

### If keys were ever committed to Git

1. **Rotate keys immediately** in [Groq Console](https://console.groq.com/keys) and [Pinecone Console](https://app.pinecone.io).
2. Remove secrets from Git history before pushing (see below).
3. Do not reuse the old keys.

### Remove secrets from Git history (before first push)

If you have not pushed yet and only have a few commits:

```bash
# After fixing .env.example files to use placeholders:
git add server/.env.example .env.example
git commit --amend -m "Remove secrets from env examples"
```

If already pushed to GitHub, use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo`, then force-push, and rotate all exposed keys.

## Reporting

Do not open public issues with secret values. Rotate compromised keys first.
