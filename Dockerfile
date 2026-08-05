FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_ENV=production
ENV EXPO_PUBLIC_API_URL=http://localhost:3000

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

ARG EXPO_PUBLIC_API_URL=http://localhost:3000
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npm run export:web

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
