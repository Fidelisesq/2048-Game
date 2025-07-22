# Lambda@Edge function for security headers
resource "aws_lambda_function" "security_headers" {
  provider         = aws.us_east_1
  filename         = "security-headers.zip"
  function_name    = "2048-security-headers"
  role            = aws_iam_role.lambda_edge_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 5
  publish         = true

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [data.archive_file.security_headers_zip]
}

# Create Lambda@Edge deployment package
data "archive_file" "security_headers_zip" {
  type        = "zip"
  output_path = "security-headers.zip"
  source {
    content = templatefile("${path.module}/lambda/security-headers.js", {})
    filename = "index.js"
  }
}

# IAM role for Lambda@Edge
resource "aws_iam_role" "lambda_edge_role" {
  name = "2048-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
        }
      }
    ]
  })
}

# IAM policy for Lambda@Edge
resource "aws_iam_role_policy_attachment" "lambda_edge_policy" {
  role       = aws_iam_role.lambda_edge_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# AWS provider for us-east-1 (required for Lambda@Edge)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}