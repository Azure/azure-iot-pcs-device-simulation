:: Note: use lowercase names for the Docker images

SET DOCKER_TAG=%1
IF [%1]==[] (
    :: Note: use lowercase names for the Docker images
    SET DOCKER_IMAGE=azureiotpcs/simulation-api-gateway

    :: "testing" is the latest dev build, usually matching the code in the "master" branch
    SET DOCKER_TAG=%DOCKER_IMAGE%:testing
)

docker build --compress --tag %DOCKER_TAG% .