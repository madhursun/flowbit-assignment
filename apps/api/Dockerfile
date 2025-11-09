# apps/api/Dockerfile
FROM node:20-alpine

# Add repositories mirror (optional) and install build tools for native modules
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories || true
RUN apk update && apk add --no-cache python3 make g++ bash curl

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev so tsx is available)
RUN npm install --legacy-peer-deps --include=dev

# Copy project files
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
