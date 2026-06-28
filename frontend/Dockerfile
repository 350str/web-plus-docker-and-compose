FROM node:16-alpine AS build

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm i
COPY . .
RUN npm run build

FROM nginx:latest AS production

WORKDIR /usr/src/app/frontend

COPY --from=build /usr/src/app/frontend/build ./
COPY nginx/conf.d/ /etc/nginx/conf.d/

EXPOSE 3000

