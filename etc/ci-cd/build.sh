#!/bin/bash

cd $1 || exit

echo "decrypting secrets"
bash ./etc/ci-cd/decrypt-secrets.sh .

echo "setting up configurations"
cp ./etc/secrets/.env .env

echo "building ${CONTAINER_IMAGE}"
docker build -t "$CONTAINER_IMAGE" .
docker push "$CONTAINER_IMAGE"
