#!/usr/bin/env bash
# Run before git push: ./scripts/check-secrets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Checking for exposed secrets..."

FAIL=0

# Block real keys in tracked files (Groq / Pinecone patterns)
if git grep -E 'gsk_[a-zA-Z0-9]{20,}|pcsk_[a-zA-Z0-9]{20,}' -- ':!*.md' ':!scripts/check-secrets.sh' 2>/dev/null; then
  echo "ERROR: Possible API keys found in tracked files (see above)."
  FAIL=1
fi

# Block .env files from being tracked
for f in .env server/.env client/.env; do
  if git ls-files --error-unmatch "$f" 2>/dev/null; then
    echo "ERROR: $f is tracked by git — remove it with: git rm --cached $f"
    FAIL=1
  fi
done

# Warn if .env.example contains non-placeholder keys
for f in .env.example server/.env.example client/.env.example; do
  if [[ -f "$f" ]] && grep -qE 'GROQ_API_KEY=gsk_|PINECONE_API_KEY=pcsk_' "$f" 2>/dev/null; then
    echo "ERROR: $f contains real API keys — use your_groq_api_key_here placeholders only."
    FAIL=1
  fi
done

if [[ $FAIL -eq 1 ]]; then
  echo "Secret check failed. Fix issues before pushing to GitHub."
  exit 1
fi

echo "OK — no obvious secrets in tracked files."
