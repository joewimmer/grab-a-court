FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

FROM deps AS build
COPY backend backend
COPY database database
RUN npm run build -w backend

FROM node:22-alpine AS seed
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci
COPY backend backend
COPY database database
ENV DATABASE_PATH=/data/grab-a-court.db
ENV SEED_RESET=false
CMD ["npm", "run", "db:seed", "-w", "backend"]

FROM node:22-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev -w backend
COPY --from=build /app/backend/dist backend/dist
COPY database/schema.sql database/schema.sql
ENV PORT=3001
ENV DATABASE_PATH=/data/grab-a-court.db
EXPOSE 3001
CMD ["node", "backend/dist/server.js"]
