FROM caddy:2-alpine AS caddy-bin

FROM node:20-alpine
COPY --from=caddy-bin /usr/bin/caddy /usr/bin/caddy

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Caddy stores issued TLS certs here (mount a volume at /data to persist them).
ENV XDG_DATA_HOME=/data

EXPOSE 80 443
CMD ["sh", "-c", "node server.js & caddy run --config Caddyfile --adapter caddyfile"]
