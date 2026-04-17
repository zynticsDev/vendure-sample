# Use Node image
FROM node:20.10.0

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Build project
RUN npm run build

# Expose port
EXPOSE 3000

# Start Vendure
CMD ["npm", "run", "start:server"]