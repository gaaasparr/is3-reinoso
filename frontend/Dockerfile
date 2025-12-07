# Base de dependencias
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Etapa de desarrollo (hot reload)
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Etapa de build para producción
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:1 AS prod
COPY --from=build /app/dist/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
