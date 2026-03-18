#!/bin/bash

# Deploy Domain Configuration for excelsior.cards
# This script deploys the DNS and nginx configuration

set -e

echo "🚀 Deploying domain configuration for excelsior.cards..."

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    echo "❌ Error: Please run this script from the infra/ directory"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Error: Terraform is not installed"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI is not configured"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

# Plan the deployment (use plan.tfplan so *.tfplan in .gitignore prevents accidental commit)
echo "📋 Planning deployment..."
terraform plan -out=plan.tfplan

# Ask for confirmation
echo ""
echo "⚠️  This will deploy the following changes:"
echo "   - DNS records for excelsior.cards"
echo "   - Nginx reverse proxy configuration"
echo "   - Updated EC2 instance with nginx"
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Apply the changes
echo "🚀 Applying changes..."
terraform apply plan.tfplan

# Clean up plan file (contains sensitive data; never commit)
rm -f plan.tfplan

echo ""
echo "✅ Domain configuration deployed successfully!"
echo ""

# Get the name servers from Terraform output
echo "🔧 IMPORTANT: Configure these name servers at your domain registrar:"
terraform output -raw dns_name_servers | tr -d '[]",' | tr ' ' '\n' | sed 's/^/   /'
echo ""

echo "🌐 Your application will be accessible at:"
echo "   http://excelsior.cards"
echo "   http://www.excelsior.cards"
echo ""
echo "📋 Next steps:"
echo "   1. Update your domain registrar's DNS settings with the name servers above"
echo "   2. Wait for DNS propagation (up to 48 hours)"
echo "   3. Test the domain: curl -I http://excelsior.cards"
echo "   4. Set up SSL certificates (see DOMAIN_SETUP.md)"
echo ""
echo "🔍 To check DNS propagation:"
echo "   dig excelsior.cards A"
echo "   nslookup excelsior.cards"
echo ""
echo "📊 To monitor the deployment:"
echo "   terraform output"
echo ""
