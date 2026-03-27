#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ProcessIQ - Démarrage Infrastructure ${NC}"
echo -e "${BLUE}========================================${NC}"

if ! docker info > /dev/null 2>&1; then
  echo -e "${RED} Docker n'est pas lancé. Veuillez démarrer Docker Desktop.${NC}"
  exit 1
fi

echo -e "${GREEN} Docker est opérationnel${NC}"

echo -e "${YELLOW} Nettoyage des conteneurs existants...${NC}"
docker compose down --remove-orphans 2>/dev/null || true

echo -e "${YELLOW}Construction des images Docker...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}Démarrage de MongoDB...${NC}"
docker compose up -d mongodb

echo -e "${YELLOW}Attente que MongoDB soit prêt...${NC}"
RETRIES=30
until docker compose exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo -e "${RED} MongoDB n'a pas démarré à temps.${NC}"
    exit 1
  fi
  echo -e "${YELLOW} MongoDB pas encore prêt, attente... ($RETRIES essais restants)${NC}"
  sleep 2
done

echo -e "${GREEN} MongoDB est prêt${NC}"

USERS_COUNT=$(docker compose exec mongodb mongosh processiq --quiet --eval "db.users.countDocuments()" 2>/dev/null || echo "0")
echo -e "${BLUE}Utilisateurs en base : ${USERS_COUNT}${NC}"

if [ "$USERS_COUNT" -lt "1000" ] 2>/dev/null; then
  echo -e "${YELLOW} Seed insuffisant, relance...${NC}"
  docker compose exec mongodb mongosh processiq /docker-entrypoint-initdb.d/seed.js
fi

echo -e "${YELLOW}Démarrage du Backend...${NC}"
docker compose up -d backend

echo -e "${YELLOW}Attente que le Backend soit prêt...${NC}"
RETRIES=30
until curl -sf http://localhost:3000/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo -e "${RED}Backend n'a pas démarré à temps.${NC}"
    docker compose logs backend
    exit 1
  fi
  echo -e "${YELLOW}Backend pas encore prêt... ($RETRIES essais restants)${NC}"
  sleep 2
done

echo -e "${GREEN}Backend est prêt${NC}"

echo -e "${YELLOW}Démarrage du Frontend et Nginx...${NC}"
docker compose up -d frontend nginx

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Infrastructure démarrée avec succès !${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Application  : http://localhost${NC}"
echo -e "${GREEN}Backend API  : http://localhost/api${NC}"
echo -e "${GREEN}Metrics      : http://localhost/metrics${NC}"
echo -e "${GREEN}MongoDB      : localhost:27017${NC}"
echo -e "${BLUE}========================================${NC}"