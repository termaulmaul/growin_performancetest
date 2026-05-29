FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY server.js .
ENV PORT=8080 MOCK_LATENCY_MS=80 MOCK_ERROR_RATE=0
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=2s --retries=5 CMD wget -q -O- http://127.0.0.1:8080/health || exit 1
CMD ["node","server.js"]
