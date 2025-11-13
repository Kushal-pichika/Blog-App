### STAGE 1: Build ###
# Use an official Node.js image as the builder
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the production-ready static files
# (Vite's standard build command)
RUN npm run build

### STAGE 2: Serve ###
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.25-alpine

# Vite builds to the 'dist' folder. We copy that content.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]