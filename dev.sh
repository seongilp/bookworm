#!/usr/bin/env bash
# 책벌레 문장수집 - 로컬 개발 서버 (Nuxt 풀스택 + 로컬 D1)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/frontend"
echo "▶ http://localhost:3000  (API + 화면 통합, 로컬 D1)"
pnpm install
pnpm dev
