# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Etapa "base": fundamento común para todas las demás etapas.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# ---------------------------------------------------------------------------
# Etapa "dependencies": instala TODAS las dependencias (prod + dev),
# incluyendo el toolchain nativo que pide "canvas" (chartjs-node-canvas).
# ---------------------------------------------------------------------------
FROM base AS dependencies

RUN apk add --no-cache --virtual .build-deps \
    build-base pkgconfig python3 \
    cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev

# "puppeteer" no se usa todavía en el código (ver Fase 2 del chat): evitamos
# que su postinstall descargue Chromium (~300MB). Si en el futuro se
# implementa generación de PDF/reportes vía Puppeteer, elimina esta línea
# y evalúa migrar la imagen base a node:22-bookworm-slim + `apt install chromium`.
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Etapa "development": imagen usada por docker-compose en desarrollo.
# El código fuente NO se copia aquí: llega por bind mount (Fase 7),
# lo que permite hot-reload con nodemon sin reconstruir la imagen.
# ---------------------------------------------------------------------------
FROM dependencies AS development

ENV NODE_ENV=development

EXPOSE 3006

CMD ["pnpm", "run", "dev"]

# ---------------------------------------------------------------------------
# Etapa "production-dependencies": reutiliza el node_modules ya compilado
# y le quita devDependencies (nodemon) sin recompilar nada nativo.
# ---------------------------------------------------------------------------
FROM dependencies AS production-dependencies

RUN pnpm prune --prod

# ---------------------------------------------------------------------------
# Etapa "production": imagen final, mínima, sin compilador ni cabeceras -dev.
# ---------------------------------------------------------------------------
FROM base AS production

ENV NODE_ENV=production

# Solo las librerías compartidas en tiempo de ejecución que "canvas" necesita
# para hacer dlopen del addon nativo compilado en la etapa anterior.
RUN apk add --no-cache cairo pango jpeg giflib librsvg && \
    addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

COPY --from=production-dependencies --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --chown=nodeapp:nodeapp . .

USER nodeapp

EXPOSE 3006

CMD ["node", "index.js"]
