# Use an official Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# --- IMPORTANT ---
# Change '5000' to whatever port your Express app listens on
EXPOSE 5000

# The command to start your backend server
# (This runs the "start" script in your package.json)
CMD ["npm", "start"]