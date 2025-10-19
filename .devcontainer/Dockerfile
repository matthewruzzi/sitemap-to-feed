FROM denoland/deno:bin AS deno
FROM mcr.microsoft.com/devcontainers/base:bookworm
COPY --from=deno /deno /usr/local/bin/deno
