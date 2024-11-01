# Use Node.js as base image
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the application source code
COPY src/ ./src

# Command to run the log writer script located in the src directory
CMD ["node", "src/log_writer.js"]
