#!/usr/bin/env bash
# Copyright (c) Microsoft. All rights reserved.
# Note: Windows Bash doesn't support shebang extra params
set -e

while [ "$#" -gt 0 ]; do
    case "$1" in
        --git_access_token)             GIT_ACCESS_TOKEN="$2" ;;
        --from_docker_namespace)        FROM_DOCKER_NAMESPACE="$2" ;;
        --docker_tag)                   DOCKER_TAG="$2" ;;
    esac
    shift
done

# Set default values for optional parameters
FROM_DOCKER_NAMESPACE=${FROM_DOCKER_NAMESPACE:-azureiotpcs}
DOCKER_TAG=${DOCKER_TAG:-testing}

APP_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && cd .. && pwd )/"

NC="\033[0m" # no color
CYAN="\033[1;36m" # light cyan
YELLOW="\033[1;33m" # yellow
RED="\033[1;31m" # light red

failed() {
    SUB_MODULE=$1
    echo -e "${RED}Cannot find directory $SUB_MODULE${NC}"
    exit 1
}

tag_build_publish_repo() {
    SUB_MODULE=$1
    REPO_NAME=$2
    DOCKER_CONTAINER_NAME=${3:-$2}
    DESCRIPTION=$4

    echo
    echo -e "${CYAN}====================================     Start: Pull $SUB_MODULE repo     ====================================${NC}"
    echo
    echo -e "Current working directory ${CYAN}$APP_HOME$SUB_MODULE${NC}"
    echo
    cd $APP_HOME$SUB_MODULE || failed $SUB_MODULE

    git checkout master

    echo "set url"
    git remote set-url origin https://$GIT_ACCESS_TOKEN@github.com/Azure/$REPO_NAME.git

    echo "git pull"
    git pull --all --prune

    echo
    echo -e "${CYAN}====================================     End: Pull $SUB_MODULE repo     ====================================${NC}"
    echo

    echo
    echo -e "${CYAN}====================================     Start: Release for $SUB_MODULE    ====================================${NC}"
    echo

    # For documentation https://help.github.com/articles/creating-releases/
    echo
    echo -e "${CYAN}====================================     End: Release for $SUB_MODULE     ====================================${NC}"
    echo

    echo
    echo -e "${CYAN}====================================     Start: Building $SUB_MODULE     ====================================${NC}"
    echo

    BUILD_PATH="build"
    if [ "$SUB_MODULE" == "api-gateway" ]; then 
        BUILD_PATH="build"
    fi

    # Building docker containers
    echo "Building docker containers"
    echo $APP_HOME$SUB_MODULE/$BUILD_PATH
    /bin/bash $APP_HOME$SUB_MODULE/$BUILD_PATH

    echo
    echo -e "${CYAN}====================================     End: Building $SUB_MODULE     ====================================${NC}"
    echo
}

# DOTNET Microservices
tag_build_publish_repo api-gateway            azure-iot-pcs-device-simulation   simulation-api-gateway

set +e