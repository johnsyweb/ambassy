FROM node:26-slim AS build-stage
ARG AUBE_VERSION=1.17.1
RUN apt-get update \
  && apt-get install -y curl ca-certificates \
  && curl -fsSL "https://github.com/jdx/aube/releases/download/v${AUBE_VERSION}/aube-v${AUBE_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C /usr/local/bin \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json aube-lock.yaml aube-workspace.yaml ./
COPY . .
RUN aube ci
RUN aube run build

FROM build-stage AS run-stage
CMD ["aube", "run", "start"]

FROM scratch AS export-stage
COPY --from=build-stage /app/dist .
