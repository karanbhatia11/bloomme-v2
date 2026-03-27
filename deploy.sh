#!/bin/bash

# Bloomme Deployment Script
# This script deploys the application to EC2

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bloomme Deployment Script ===${NC}\n"

# Configuration
EC2_USER=${1:-"ec2-user"}
EC2_IP=${2:-""}
EC2_KEY=${3:-""}
APP_PORT=${4:-3000}
BACKEND_PORT=${5:-5000}

if [ -z "$EC2_IP" ]; then
    echo -e "${RED}Usage: ./deploy.sh <ec2-user> <ec2-ip> <key-file> [app-port] [backend-port]${NC}"
    echo "Example: ./deploy.sh ec2-user 54.123.45.67 ~/key.pem 3000 5000"
    exit 1
fi

echo -e "${BLUE}Configuration:${NC}"
echo "EC2 User: $EC2_USER"
echo "EC2 IP: $EC2_IP"
echo "App Port: $APP_PORT"
echo "Backend Port: $BACKEND_PORT"
echo ""

# Step 1: Push to GitHub
echo -e "${BLUE}Step 1: Pushing to GitHub...${NC}"
git push -u origin main || echo -e "${RED}GitHub push failed. Make sure you have authentication set up.${NC}"
echo ""

# Step 2: SSH into EC2 and deploy
echo -e "${BLUE}Step 2: Deploying to EC2...${NC}"

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" << 'DEPLOY_SCRIPT'
    echo "Connected to EC2. Installing dependencies..."

    # Update system
    sudo yum update -y || sudo apt update -y

    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs || sudo apt install -y nodejs
    fi

    # Clone or update repository
    if [ ! -d "/home/$USER/bloomme" ]; then
        echo "Cloning repository..."
        cd /home/$USER
        git clone https://github.com/karanbhatia11/bloomme-v2.git bloomme
    else
        echo "Updating repository..."
        cd /home/$USER/bloomme
        git pull origin main
    fi

    cd /home/$USER/bloomme

    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    npm run build

    # Install backend dependencies
    echo "Installing backend dependencies..."
    cd ../backend
    npm install

    # Install admin portal dependencies
    echo "Installing admin portal dependencies..."
    cd ../admin-portal
    npm install
    npm run build

    echo -e "\n✅ Deployment complete!"
    echo "Frontend build: $(pwd)/../frontend/out"
    echo "Backend ready to run"
    echo "Admin Portal built and ready on port 9000"
DEPLOY_SCRIPT

echo -e "${GREEN}✅ Deployment to EC2 complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. SSH into EC2: ssh -i $EC2_KEY $EC2_USER@$EC2_IP"
echo "2. Start services: cd bloomme && docker-compose up --build"
echo "3. Access services:"
echo "   - Frontend: http://$EC2_IP:5001"
echo "   - Backend API: http://$EC2_IP:5002"
echo "   - Admin Portal: http://$EC2_IP:5003"
