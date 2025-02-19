# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files
COPY . .

# Build the TypeScript project
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Expose the app port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
