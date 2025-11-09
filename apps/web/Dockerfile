# apps/web/Dockerfile
FROM node:20-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories || true
RUN apk update && apk add --no-cache python3 make g++ bash curl

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dev + prod deps so `next` is available for dev
RUN npm install --legacy-peer-deps --include=dev

# Copy project
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
