terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security Group for EC2 instance
resource "aws_security_group" "star_wars_api_sg" {
  name        = "star-wars-api-sg"
  description = "Security group for Star Wars API application"

  # Allow HTTP traffic
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Node.js app port (for testing)
  ingress {
    description = "Node.js app"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH (only if needed for debugging)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr_blocks
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "star-wars-api-sg"
  }
}

# EC2 Instance
resource "aws_instance" "star_wars_api" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.star_wars_api_sg.id]
  key_name              = var.key_name

  user_data = file("${path.module}/user-data.sh")

  # Use instance metadata service v2 (more secure)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "star-wars-api-server"
  }

  # Wait for instance to be ready
  provisioner "local-exec" {
    command = "echo 'Waiting for instance to be ready...'"
  }
}

# Elastic IP (optional, for consistent public IP)
resource "aws_eip" "star_wars_api_eip" {
  instance = aws_instance.star_wars_api.id
  domain   = "vpc"

  tags = {
    Name = "star-wars-api-eip"
  }
}
