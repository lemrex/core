# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies first
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the app port (optional; your app should respect process.env.PORT)
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
