FROM node:22-alpine

WORKDIR /app

COPY docker/durable-streams/package.json ./package.json
RUN npm install --omit=dev

COPY docker/durable-streams/server.mjs ./server.mjs

ENV DURABLE_STREAMS_PORT=4437
ENV DURABLE_STREAMS_HOST=0.0.0.0
ENV DURABLE_STREAMS_DATA_PATH=/data/streams

EXPOSE 4437

CMD ["node", "server.mjs"]
