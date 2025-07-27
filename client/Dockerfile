# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app/client

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:stable-alpine

# Copy the built assets from the 'builder' stage
COPY --from=builder /app/client/build /usr/share/nginx/html

# !!! ADD THIS LINE !!!
# Copy our custom Nginx configuration file to the correct location
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# When the container starts, Nginx will serve the files
CMD ["nginx", "-g", "daemon off;"]