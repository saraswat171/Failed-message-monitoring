#!/bin/bash

cd $1 || exit

#load k8s variables if exist
. ./etc/scripts/loadenv.sh ./etc/kubernetes/.env.k8s

#load env variables
. ./etc/scripts/loadenv.sh .env

if [ -z "$BUILD_ENV" ]; then
  # shellcheck disable=SC2039
  read -rp "SPECIFY THE BUILD ENVIRONMENT: " BUILD_ENV
fi

echo "deploying env: $BUILD_ENV"

if [[ -z $SKIP_REPLACE ]]; then
  #substitute envs
  . ./etc/ci-cd/substitute-envs.sh
fi

if [[ -z $SKIP_APPLY ]]; then
  echo "aliasing kubectl command"
  KUBECTLCMD="kubectl"

  if ! command -v kubectl &> /dev/null
  then
    KUBECTLCMD="microk8s.kubectl"
  fi

  function kubectl() {
    echo "$KUBECTLCMD ${@: 1}" | bash
  }

  SECRET_NAME="${KUB_SERVICE_NAME}-secrets"
  JOB_MIGRATE="${KUB_SERVICE_NAME}-migrate"
  # JOB_SEED="${KUB_SERVICE_NAME}-seed"
  KUB_NAMESPACE="${KUB_NAMESPACE_PREFIX}-${BUILD_ENV}"

  kubectl delete job ${JOB_MIGRATE} --namespace ${KUB_NAMESPACE}
  # kubectl delete job ${JOB_SEED} --namespace ${KUB_NAMESPACE}
  #kubectl delete namespace ${REBUILD_ENV_NAMESPACE}
  
  # kubectl apply -f "./etc/kubernetes/namespace.yml"

  kubectl apply \
      -f "./etc/kubernetes/migration-job.yml" \
      -f "./etc/kubernetes/deployment.yml" \
      -f "./etc/kubernetes/service.yml" \
      -f "./etc/kubernetes/handle-messages.deployment.yml" \
      # -f "./etc/kubernetes/dispatch-messages.cronjob.yml" \
    #   -f "./etc/kubernetes/seeder-job.yml" \   If exist then run after migration
fi