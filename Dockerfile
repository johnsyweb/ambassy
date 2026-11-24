FROM node:26-slim@sha256:0c6375bcc1ee170c22bd04e11b7c1ff9afc3bb16a865a2629308ceb4b72380ff AS build-stage
ARG AUBE_VERSION=1.40.0
RUN apt-get update \
  && apt-get install -y curl ca-certificates \
  && curl -fsSL "https://github.com/jdx/aube/releases/download/v${AUBE_VERSION}/aube-v${AUBE_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C /usr/local/bin \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json aube-lock.yaml aube-workspace.yaml ./
COPY . .
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN aube ci
RUN aube run build

FROM build-stage AS run-stage
CMD ["aube", "run", "start"]

FROM scratch AS export-stage
COPY --from=build-stage /app/dist .
