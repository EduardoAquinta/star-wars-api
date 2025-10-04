#!/bin/bash
set -e

echo "=========================================="
echo "Star Wars API - AWS Deployment Script"
echo "=========================================="

# Check if frontend files need to be uploaded
if [ ! -d "../public" ]; then
    echo "Error: public directory not found!"
    exit 1
fi

# Create a deployment package
echo "Creating deployment package..."
cd ..
tar -czf terraform/app-files.tar.gz public/ server.js package.json

cd terraform

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Show plan
echo "Planning infrastructure changes..."
terraform plan

# Ask for confirmation
read -p "Do you want to apply these changes? (yes/no): " confirm

if [ "$confirm" == "yes" ]; then
    # Apply Terraform
    echo "Applying Terraform configuration..."
    terraform apply -auto-approve

    # Get outputs
    echo ""
    echo "=========================================="
    echo "Deployment Complete!"
    echo "=========================================="
    terraform output

    # Get public IP
    PUBLIC_IP=$(terraform output -raw instance_public_ip)

    # Wait for instance to be fully ready
    echo ""
    echo "Waiting for instance to be ready (this may take a few minutes)..."
    sleep 60

    # Upload application files to EC2
    echo ""
    echo "Uploading application files to EC2..."
    echo "Note: You'll need to have your SSH key configured"

    # This assumes you have the SSH key set up
    # scp -i /path/to/your-key.pem app-files.tar.gz ec2-user@${PUBLIC_IP}:/home/ec2-user/
    # ssh -i /path/to/your-key.pem ec2-user@${PUBLIC_IP} "cd /home/ec2-user && tar -xzf app-files.tar.gz && cd star-wars-api && cp -r ../public . && sudo systemctl restart star-wars-api"

    echo ""
    echo "Manual steps required:"
    echo "1. Upload your application files: scp -i your-key.pem app-files.tar.gz ec2-user@${PUBLIC_IP}:/tmp/"
    echo "2. SSH into instance: ssh -i your-key.pem ec2-user@${PUBLIC_IP}"
    echo "3. Extract files: tar -xzf /tmp/app-files.tar.gz -C /home/ec2-user/star-wars-api/"
    echo "4. Restart service: sudo systemctl restart star-wars-api"
    echo ""
    echo "Application URL: http://${PUBLIC_IP}:3000"
else
    echo "Deployment cancelled."
fi
