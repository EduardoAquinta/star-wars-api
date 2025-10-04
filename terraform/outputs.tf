output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.star_wars_api.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.star_wars_api_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.star_wars_api.public_dns
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.star_wars_api_eip.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i /path/to/your-key.pem ec2-user@${aws_eip.star_wars_api_eip.public_ip}"
}
