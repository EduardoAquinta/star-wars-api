#!/bin/bash
set -e

# Log everything to a file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting Star Wars API application setup..."

# Update system
yum update -y

# Install Node.js 18.x (LTS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Create app directory
mkdir -p /home/ec2-user/star-wars-api
cd /home/ec2-user/star-wars-api

# Create package.json
cat > package.json <<'EOF'
{
  "name": "star-wars-api-app",
  "version": "1.0.0",
  "description": "Star Wars API web application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.7.0"
  }
}
EOF

# Create server.js
cat > server.js <<'EOF'
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Serve static files from the public directory
app.use(express.static('public'));

// API proxy endpoint to avoid CORS issues
app.get('/api/:category', async (req, res) => {
  const { category } = req.params;
  const page = req.query.page || 1;

  try {
    const response = await fetch(`https://swapi.dev/api/${category}/?page=${page}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from SWAPI' });
  }
});

// API endpoint to get specific item
app.get('/api/:category/:id', async (req, res) => {
  const { category, id } = req.params;

  try {
    const response = await fetch(`https://swapi.dev/api/${category}/${id}/`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from SWAPI' });
  }
});

// Only listen if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`Star Wars API server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
EOF

# Create public directory structure
mkdir -p public

# Download or create frontend files from GitHub (you'll need to provide these)
# For now, we'll create placeholder files that you should replace with your actual files

# Create a simple startup script
cat > start.sh <<'EOF'
#!/bin/bash
cd /home/ec2-user/star-wars-api
npm install
node server.js
EOF

chmod +x start.sh

# Set proper ownership
chown -R ec2-user:ec2-user /home/ec2-user/star-wars-api

# Install npm dependencies as ec2-user
su - ec2-user -c "cd /home/ec2-user/star-wars-api && npm install"

# Create systemd service for auto-start
cat > /etc/systemd/system/star-wars-api.service <<'EOF'
[Unit]
Description=Star Wars API Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/star-wars-api
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
systemctl daemon-reload
systemctl enable star-wars-api.service
systemctl start star-wars-api.service

echo "Star Wars API application setup complete!"
echo "Application should be running on port 3000"
systemctl status star-wars-api.service
