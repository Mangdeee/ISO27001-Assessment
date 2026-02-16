FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including serve package
RUN npm ci && npm install -g serve

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "3000"]
