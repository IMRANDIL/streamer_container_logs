FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY src/ /app/src
EXPOSE 4001
CMD ["node", "src/server.js"]
