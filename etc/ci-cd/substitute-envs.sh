#!/bin/bash

BUILD_ENV_KUB_FILES_DIR="./etc/kubernetes/$BUILD_ENV"
if [[ -d "$BUILD_ENV_KUB_FILES_DIR" ]]; then
    mv -f "$BUILD_ENV_KUB_FILES_DIR"/* ./etc/kubernetes/
fi

# Replaces the variable names with their respective values
grep -rl localhost:32000/image:latest ./etc/kubernetes | xargs sed -i "s,localhost:32000/image:latest,${CONTAINER_IMAGE},"
grep -rl {BUILD_ENV} ./etc/kubernetes | xargs sed -i "s,{BUILD_ENV},${BUILD_ENV},"
grep -rl {KUB_HOSTNAME} ./etc/kubernetes | xargs sed -i "s,{KUB_HOSTNAME},${KUB_HOSTNAME},"
grep -rl {KUB_HOSTNAME_SECRET} ./etc/kubernetes | xargs sed -i "s,{KUB_HOSTNAME_SECRET},${KUB_HOSTNAME_SECRET},"
grep -rl {KUB_NAMESPACE_PREFIX} ./etc/kubernetes | xargs sed -i "s,{KUB_NAMESPACE_PREFIX},${KUB_NAMESPACE_PREFIX},"
grep -rl {KUB_SERVICE_NAME} ./etc/kubernetes | xargs sed -i "s,{KUB_SERVICE_NAME},${KUB_SERVICE_NAME},"

if [ -z "$CLOUD_ENVIRONMENT" ]; then
    # Replace container registry hostname to reachable localhost
    grep -rl ${CONTAINER_REGISTRY} ./etc/kubernetes | xargs sed -i "s,${CONTAINER_REGISTRY},localhost:32000,"

    # Delete all 'imagePullSecrets' references for cloud-only needs
    for file in $(grep -rl imagePullSecrets ./etc/kubernetes); do
        line=$(awk '/imagePullSecrets/{print NR}' $file)
        nextLine=$(($line + 1))
        sed -i "${line},${nextLine}d" $file
    done
fi