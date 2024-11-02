FROM node:23-slim AS build-stage
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY . .
RUN pnpm it
RUN pnpm run build

FROM build-stage AS run-stage
CMD ["pnpm", "run", "start"]

FROM scratch AS export-stage
COPY --from=build-stage /app/dist .
