# Use an official Node runtime as a parent image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the app with host 0.0.0.0 to access from outside container
CMD ["npm", "run", "dev", "--", "--host"]
