#!/bin/bash


set -e

# --- Load from .env file ---
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo "❌ .env file not found! Copy .env.example to .env first."
    exit 1
fi

# --- CONFIG from .env ---
CONTAINER_NAME="mariadb"   # ← this one is safe to keep (not a secret)

# --- COLORS ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "============================================"
echo "   Full Docker + MariaDB Setup Script"
echo "============================================"
echo ""

# ============================================
# PART 1: INSTALL DOCKER
# ============================================
echo "🐳 PART 1: Installing Docker..."
echo ""

# --- Check if Docker is already installed ---
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is already installed. Skipping installation.${NC}"
else
    echo "📦 Updating system packages..."
    sudo apt-get update -y

    echo "📦 Installing required dependencies..."
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    echo "🔑 Adding Docker's official GPG key..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo "📋 Setting up Docker repository..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    echo "📦 Installing Docker Engine..."
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    echo "👤 Adding current user to Docker group (no sudo needed)..."
    sudo usermod -aG docker $USER

    echo "🚀 Starting Docker service..."
    sudo systemctl enable docker
    sudo systemctl start docker

    echo -e "${GREEN}✅ Docker installed successfully.${NC}"
fi

# --- Verify Docker ---
docker --version
echo ""

# ============================================
# PART 2: INSTALL MARIADB IN DOCKER
# ============================================
echo "🗄️  PART 2: Setting up MariaDB in Docker..."
echo ""

# --- Check if container already exists ---
if [ "$(docker ps -aq -f name=^${CONTAINER_NAME}$)" ]; then
    echo -e "${YELLOW}⚠️  MariaDB container already exists.${NC}"
    read -p "   Remove and recreate it? (y/n): " CONFIRM
    if [[ "$CONFIRM" == "y" || "$CONFIRM" == "Y" ]]; then
        echo "🗑️  Removing old container..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        echo -e "${GREEN}✅ Old container removed.${NC}"
    else
        echo "▶️  Starting existing container..."
        docker start $CONTAINER_NAME
        echo -e "${GREEN}✅ Container started.${NC}"
        exit 0
    fi
fi

# --- Pull MariaDB image ---
echo "📦 Pulling MariaDB image..."
docker pull mariadb:latest
echo -e "${GREEN}✅ Image ready.${NC}"

# --- Run MariaDB container ---
echo "🚀 Starting MariaDB container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart always \
    -e MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
    -e MYSQL_DATABASE=$DB_NAME \
    -e MYSQL_USER=$DB_USER \
    -e MYSQL_PASSWORD=$DB_PASSWORD \
    -p $DB_PORT:3306 \
    -v mariadb_data:/var/lib/mysql \
    mariadb:latest

echo -e "${GREEN}✅ MariaDB container started.${NC}"

# --- Wait for MariaDB to be ready ---
echo ""
echo "⏳ Waiting for MariaDB to be ready..."
sleep 10

MAX_TRIES=10
COUNT=0
until docker exec $CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASSWORD -e "SELECT 1;" &> /dev/null; do
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        echo -e "${RED}❌ MariaDB did not start in time.${NC}"
        echo "   Run: docker logs $CONTAINER_NAME"
        exit 1
    fi
    echo "   Still waiting... ($COUNT/$MAX_TRIES)"
    sleep 3
done

echo -e "${GREEN}✅ MariaDB is ready!${NC}"

# ============================================
# DONE
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "============================================"
echo ""
echo "  Host:      localhost"
echo "  Port:      $DB_PORT"
echo "  Database:  $DB_NAME"
echo "  User:      $DB_USER"
echo "  Password:  $DB_PASSWORD"
echo ""
echo "  Connection URL:"
echo "  mysql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
echo ""
echo "  Connect via CLI:"
echo "  docker exec -it $CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASSWORD $DB_NAME"
echo ""
echo "  Stop the DB:"
echo "  docker stop $CONTAINER_NAME"
echo ""
echo "  View logs:"
echo "  docker logs $CONTAINER_NAME"
echo ""
echo -e "${YELLOW}⚠️  NOTE: Log out and back in for Docker permissions to take effect.${NC}"
echo "============================================"