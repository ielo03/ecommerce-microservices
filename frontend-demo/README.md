# E-Commerce Frontend Demo for QA Environment

This directory contains a simple frontend demo application that interacts with the E-Commerce microservices deployed in the QA environment.

## Overview

The frontend demo is a single HTML file with JavaScript that allows you to:

- Check the health of all microservices
- Authenticate users (login/logout)
- View and create products
- View and create users
- View and create orders

## Connecting to the QA Environment

The frontend is configured to connect to the QA environment's API Gateway at:

```
http://a66d7a4e770c648488eb7ceedaed5de3-1091165914.us-west-2.elb.amazonaws.com
```

This URL is defined in the JavaScript code as the `apiGatewayUrl` variable.

## Current Status

Currently, the QA environment is running with placeholder nginx containers instead of the actual microservices. When you access the API Gateway URL directly, you'll see the default nginx welcome page:

```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed and working. Further configuration is required.
```

This is expected in this demo setup. In a real production environment, you would:

1. Build and push the actual microservice images to ECR
2. Configure nginx to proxy requests to the appropriate microservices
3. Set up proper routing in the API Gateway

The frontend is correctly configured to connect to the QA environment, but the API calls will not return actual data until the microservices are fully implemented.

## Running the Frontend Demo

### Option 1: Using the Script

We've provided a convenient script to open the frontend demo in your default browser:

```bash
# Make sure the script is executable
chmod +x open-qa-frontend.sh

# Run the script
./open-qa-frontend.sh
```

### Option 2: Manual Opening

You can also open the `index.html` file directly in your browser:

1. Navigate to this directory in your file explorer
2. Double-click on `index.html` to open it in your default browser

## Using the Frontend Demo

### Health Checks

Use the "Health Check" tab to verify the status of each microservice:

- API Gateway
- Product Service
- Order Service
- User Service

Note: Since we're using placeholder nginx containers, the health checks will likely fail or return unexpected responses.

### Authentication

Use the "Authentication" tab to log in with the following credentials:

- Email: john.doe@example.com
- Password: password123

Note: Authentication will not work until the actual user-service is implemented.

### Products

Use the "Products" tab to:

- View all products
- View a specific product by ID
- Create a new product

Note: These operations will not return actual data until the product-service is implemented.

### Users

Use the "Users" tab to:

- View all users
- View your user profile (when logged in)
- Register a new user

Note: These operations will not return actual data until the user-service is implemented.

### Orders

Use the "Orders" tab to:

- View your orders (when logged in)
- Create a new order

Note: These operations will not return actual data until the order-service is implemented.

## Next Steps for Full Implementation

To fully implement the microservices:

1. Build the actual microservice Docker images:

   ```bash
   cd /Users/colbydobson/cs/spring25/cs486/final/ecommerce-microservices
   docker-compose build
   ```

2. Push the images to ECR:

   ```bash
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com

   docker tag ecommerce-microservices-api-gateway:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/ecommerce-qa/api-gateway:1.0.0
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/ecommerce-qa/api-gateway:1.0.0

   # Repeat for other services
   ```

3. Update the deployment files to use the actual images

4. Redeploy the services:
   ```bash
   cd /Users/colbydobson/cs/spring25/cs486/final/ecommerce-infra/scripts
   ./deploy-qa.sh
   ```

## Troubleshooting

If you encounter issues connecting to the QA environment:

1. Verify that the QA environment is running:

   ```bash
   kubectl get pods -n ecommerce-qa
   ```

2. Check if the API Gateway service is available:

   ```bash
   kubectl get service api-gateway -n ecommerce-qa
   ```

3. Ensure the LoadBalancer has been provisioned and is accessible:

   ```bash
   curl -I http://a66d7a4e770c648488eb7ceedaed5de3-1091165914.us-west-2.elb.amazonaws.com
   ```

4. Check the browser console for any JavaScript errors or network issues

## Notes

- This is a simple demo frontend for testing purposes only
- In a production environment, you would use a more robust frontend framework like React, Angular, or Vue.js
- The frontend does not implement all features of the API, just the basic CRUD operations
