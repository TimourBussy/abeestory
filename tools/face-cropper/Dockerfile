FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY src ./src
COPY tsconfig.json ./
COPY index.html style.css ./

RUN npm run build
RUN cp index.html style.css dist/

# Installe un serveur statique simple
RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
