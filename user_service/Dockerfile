FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5002
EXPOSE 50051

CMD ["node", "src/app.js"]