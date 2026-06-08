# Multi-stage build. The build stage runs the full static-site toolchain; a separate deps stage
# resolves only production dependencies (dropping the dev toolchain — Vite, Nx, Angular build,
# Storybook, Playwright, Vitest, Biome); the runtime stage carries just those plus the build
# output. Secrets are read from the environment at runtime, so none are ever baked in.

# ---- build: produce the prerendered site (dist/) with the full toolchain ----
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock .bun-version ./
COPY patches ./patches
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- deps: production-only node_modules (no dev toolchain) ----
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock .bun-version ./
COPY patches ./patches
# Workspace members' manifests must be present for the workspace install to resolve.
COPY packages ./packages
COPY scripts ./scripts
RUN bun install --production --frozen-lockfile

# ---- runtime: slim Bun with only production deps + the built site ----
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies (much smaller than the build toolchain), the package sources the server
# runs from, the build output, static assets, the scripts it imports, and the tsconfig path map.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json

# Drop privileges: the oven/bun images ship a non-root `bun` user. The app only reads its files
# and binds an unprivileged port, so it never needs root. (TLS termination is Caddy's job, in a
# separate container.)
USER bun

# Report real health (not just "process alive") so deploys can wait for healthy and roll back, and
# the restart policy can recover a wedged process. Uses Bun itself — the slim image has no curl.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD bun -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 3000
CMD ["bun", "run", "packages/api/src/index.ts"]
