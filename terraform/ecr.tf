# ECR Repository for Docker images
resource "aws_ecr_repository" "star_wars_api" {
  name                 = "star-wars-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "star-wars-api"
  }
}

# ECR Lifecycle Policy - Keep only last 10 images to save storage
resource "aws_ecr_lifecycle_policy" "star_wars_api_policy" {
  repository = aws_ecr_repository.star_wars_api.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# IAM policy for GitHub Actions to push to ECR
resource "aws_iam_user" "github_actions" {
  name = "github-actions-ecr-push"

  tags = {
    Name = "GitHub Actions ECR Push User"
  }
}

resource "aws_iam_user_policy" "github_actions_ecr" {
  name = "github-actions-ecr-push-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = aws_ecr_repository.star_wars_api.arn
      }
    ]
  })
}

# Create access key for GitHub Actions
resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# Output ECR details
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.star_wars_api.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.star_wars_api.arn
}

output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = true
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}
