FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

FROM nginx:latest AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/conf.d/ /etc/nginx/conf.d/
EXPOSE 8081

