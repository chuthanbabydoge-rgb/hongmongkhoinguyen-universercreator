#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push || echo "DB push encountered issues (schema may already be up to date)"
