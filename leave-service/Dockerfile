FROM node:18-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install --production

# copy app
COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]
