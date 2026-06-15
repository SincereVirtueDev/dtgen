FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# In development, we mount volumes, but for production we would run build.
# We'll just run npm run dev from docker-compose
