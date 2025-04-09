#!/bin/bash

cd $1 || exit

#load env variables
. ./etc/scripts/loadenv.sh .env

if [ -z "$BUILD_ENV" ]; then
  read -rp "SPECIFY THE BUILD ENVIRONMENT: " BUILD_ENV
fi

if [ -z "$BUILD_ENV" ]; then echo "BUILD_ENV empty"; exit 1; fi;
echo "BUILD_ENV READY"

if [ -z "$BUILD_KEY" ]; then
  # shellcheck disable=SC2039
  read -sr -p "ENTER THE SECRET PHRASE: " BUILD_KEY
  echo ""
fi

if [ -z "$BUILD_KEY" ]; then echo "BUILD_KEY empty"; exit 1; fi;
echo "BUILD_KEY READY"

SECRET_FILE=./etc/secrets.tar.gz.ssl
docker run -v "${PWD}:/app" kytel0925/ci-cd cp "./etc/secrets.${BUILD_ENV}.tar.gz.ssl" "$SECRET_FILE"
docker run -v "${PWD}:/app" kytel0925/ci-cd decrypt-secrets.sh "$BUILD_KEY"
docker run -v "${PWD}:/app" kytel0925/ci-cd rm "$SECRET_FILE"
