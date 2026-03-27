# Bloomme Deployment Guide

## Project Status
- ✅ Git repository initialized with 2 commits
- ✅ Frontend & Backend code ready
- ✅ Docker configuration complete
- ❌ GitHub push pending (authentication issue)
- ⏳ EC2 deployment ready (awaiting server details)

## GitHub Push Issue

Currently encountering a **403 Forbidden** error when trying to push to GitHub. This is likely due to:

1. **Missing `repo` scope** on the PAT token - Regenerate your PAT with these scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)

2. **Repository permissions** - Ensure your GitHub account has write access to the repository

### To Fix:
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate a new token with `repo` and `workflow` scopes
3. Provide the new token for authentication

## Local Deployment with Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Quick Start
```bash
cd /Users/karanbhatia/Desktop/Bloomme
docker-compose up --build
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Nginx Proxy: http://localhost:80

## EC2 Deployment

### Prerequisites
1. AWS EC2 instance running (Ubuntu or Amazon Linux)
2. EC2 security group allows ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (frontend), 5000 (backend)
3. SSH key pair (.pem file)

### Deployment Steps

```bash
./deploy.sh <ec2-user> <ec2-ip> <key-file-path> [app-port] [backend-port]
```

**Example:**
```bash
./deploy.sh ec2-user 54.123.45.67 ~/bloomme-key.pem 3000 5000
```

**Parameters:**
- `<ec2-user>`: User on EC2 (usually `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
- `<ec2-ip>`: Public IP address of your EC2 instance
- `<key-file-path>`: Path to your .pem SSH key file
- `[app-port]`: Frontend port (default: 3000)
- `[backend-port]`: Backend port (default: 5000)

### Manual EC2 Setup (if automation fails)

1. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Install dependencies:**
   ```bash
   # Update system
   sudo yum update -y  # for Amazon Linux
   # or
   sudo apt update -y  # for Ubuntu

   # Install Node.js
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Clone and setup repository:**
   ```bash
   cd /home/ec2-user
   git clone https://github.com/karanbhatia11/bloomme-v2.git bloomme
   cd bloomme
   ```

4. **Install and build frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

5. **Install backend:**
   ```bash
   cd ../backend
   npm install
   ```

6. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Project Structure

```
bloomme/
├── frontend/              # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── public/          # Static assets
│   └── package.json
├── backend/             # Node.js backend
│   ├── src/            # Source code
│   └── package.json
├── docker-compose.yml   # Docker compose config
├── deploy.sh           # EC2 deployment script
└── README.md
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
```

## Troubleshooting

### GitHub Push Issues
- Verify PAT token is valid and has `repo` scope
- Check GitHub username matches repository owner
- Ensure 2FA is not blocking token authentication

### Docker Issues
- Ensure ports 3000, 5000, 80 are not in use
- Run `docker-compose down` to stop all services
- Check logs: `docker-compose logs -f [service-name]`

### EC2 Connection Issues
- Verify security group rules allow SSH (port 22)
- Check .pem file permissions: `chmod 400 your-key.pem`
- Verify EC2 instance is running and accessible

## Next Steps

1. **Resolve GitHub authentication** - Provide valid PAT token with proper scopes
2. **Test local deployment** - Run `docker-compose up` to verify everything works
3. **Set up EC2 instance** - Ensure instance is running and accessible
4. **Deploy to EC2** - Run `./deploy.sh` with your instance details
5. **Configure domain** - Point your domain to EC2 public IP once deployed

## Support

For deployment issues:
- Check Docker logs: `docker-compose logs`
- SSH into EC2 and check application logs
- Verify environment variables are properly set
- Ensure all ports are accessible in security groups
