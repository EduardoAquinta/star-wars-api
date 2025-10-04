# Star Wars API - AWS Deployment Guide

This directory contains Terraform configuration to deploy the Star Wars API application to AWS EC2.

## Prerequisites

1. **AWS Account** - You'll need an active AWS account
2. **AWS CLI** - Install and configure with your credentials:
   ```bash
   aws configure
   ```
3. **Terraform** - Install Terraform CLI (https://www.terraform.io/downloads)
4. **SSH Key Pair** - Create an EC2 key pair in AWS Console and download the `.pem` file

## Cost Estimate

This configuration uses AWS Free Tier eligible resources:
- **EC2 Instance**: t2.micro (750 hours/month free for 12 months)
- **Elastic IP**: Free when attached to running instance
- **Security Groups**: Free
- **Data Transfer**: 15GB/month outbound free

**Expected cost**: $0/month within Free Tier limits, ~$8-10/month after Free Tier expires

## Quick Start

### 1. Configure Variables

Edit `terraform/variables.tf` or create a `terraform.tfvars` file:

```hcl
aws_region       = "us-east-1"
instance_type    = "t2.micro"
key_name         = "your-key-pair-name"
ssh_cidr_blocks  = ["YOUR.IP.ADDRESS/32"]  # Your public IP for SSH access
```

### 2. Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply configuration
terraform apply
```

Type `yes` when prompted to confirm.

### 3. Upload Application Files

After Terraform completes, you'll see the instance's public IP. Upload your application:

```bash
# From the project root directory
tar -czf app-files.tar.gz public/ server.js package.json

# Upload to EC2 (replace with your key and IP)
scp -i /path/to/your-key.pem app-files.tar.gz ec2-user@<PUBLIC_IP>:/tmp/

# SSH into the instance
ssh -i /path/to/your-key.pem ec2-user@<PUBLIC_IP>

# On the EC2 instance:
cd /home/ec2-user/star-wars-api
tar -xzf /tmp/app-files.tar.gz
sudo systemctl restart star-wars-api
```

### 4. Access Your Application

Open your browser to: `http://<PUBLIC_IP>:3000`

## File Structure

```
terraform/
├── main.tf           # Main Terraform configuration
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── user-data.sh      # EC2 initialization script
├── deploy.sh         # Deployment helper script
└── README.md         # This file
```

## What Gets Created

1. **EC2 Instance** (t2.micro)
   - Amazon Linux 2023
   - Node.js 18.x installed
   - Application running as systemd service
   - Auto-starts on boot

2. **Security Group**
   - Port 22 (SSH) - Restricted to your IP
   - Port 80 (HTTP) - Open to internet
   - Port 3000 (Node.js) - Open to internet

3. **Elastic IP**
   - Static public IP address
   - Persists across instance restarts

## Managing Your Deployment

### View Instance Status

```bash
terraform output
```

### SSH into Instance

```bash
ssh -i /path/to/your-key.pem ec2-user@<PUBLIC_IP>
```

### Check Application Logs

```bash
# On the EC2 instance
sudo journalctl -u star-wars-api -f
```

### Restart Application

```bash
sudo systemctl restart star-wars-api
```

### Update Application Code

```bash
# Upload new files
scp -i your-key.pem -r public/ ec2-user@<PUBLIC_IP>:/home/ec2-user/star-wars-api/

# Restart service
ssh -i your-key.pem ec2-user@<PUBLIC_IP> "sudo systemctl restart star-wars-api"
```

## Destroying Resources

When you're done, destroy all AWS resources to avoid charges:

```bash
cd terraform
terraform destroy
```

Type `yes` to confirm.

## Troubleshooting

### Application not accessible

1. Check security group allows port 3000
2. Check application is running: `sudo systemctl status star-wars-api`
3. Check logs: `sudo journalctl -u star-wars-api -n 50`

### SSH connection refused

1. Verify your IP is in `ssh_cidr_blocks`
2. Check instance is running in AWS Console
3. Verify security group rules

### User data script didn't run

1. Check `/var/log/user-data.log` on the instance
2. Manually run setup steps from `user-data.sh`

## Production Considerations

For production deployment, consider:

1. **Use HTTPS**: Set up SSL/TLS with AWS Certificate Manager and ALB
2. **Use a domain**: Register domain and use Route 53
3. **Enable backups**: Configure automated AMI snapshots
4. **Set up monitoring**: Use CloudWatch for logs and metrics
5. **Restrict SSH**: Limit SSH access to specific IPs only
6. **Use Auto Scaling**: For high availability
7. **Add health checks**: Implement application health endpoints

## Local vs EC2 Differences

The application works in both environments:

**Local Development:**
- `HOST=localhost` (default)
- `PORT=3000` (default)
- Run with: `npm start`

**EC2 Production:**
- `HOST=0.0.0.0` (accepts external connections)
- `PORT=3000` (configurable via environment)
- Runs as systemd service
- Auto-starts on boot

## Support

For issues or questions:
1. Check AWS EC2 console for instance status
2. Review CloudWatch logs
3. Check application logs on the instance
