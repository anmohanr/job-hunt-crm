#!/bin/bash
set -euo pipefail

EC2_HOST="${EC2_HOST:-jobs.anjanamohanraj.com}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_REPO_PATH="${EC2_REPO_PATH:-/home/ec2-user/app}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/job-hunt-crm-key.pem}"

echo "Deploying to ${EC2_USER}@${EC2_HOST} (${EC2_REPO_PATH})..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${EC2_USER}@${EC2_HOST}" bash -s <<EOF
set -euo pipefail
cd ${EC2_REPO_PATH}
echo "==> docker compose --env-file .env.production pull app"
docker compose --env-file .env.production pull app
echo "==> docker compose --env-file .env.production up -d app"
docker compose --env-file .env.production up -d app
echo "==> docker image prune"
docker image prune -f
echo "==> done"
EOF

echo "Deploy complete."
