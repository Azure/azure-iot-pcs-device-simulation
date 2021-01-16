:: Copyright (c) Microsoft. All rights reserved.

@ECHO off
setlocal

:: Used the passed in image name, if available
SET DOCKER_TAG=%1
IF [%1]==[] (
    :: Note: use lowercase names for the Docker images
    SET DOCKER_IMAGE=azureiotpcs/device-simulation-webui
    :: "testing" is the latest dev build, usually matching the code in the "master" branch
    SET DOCKER_TAG=%DOCKER_IMAGE%:testing
)

:: strlen("\scripts\docker\") => 16
SET APP_HOME=%~dp0
echo APP_HOME = %APP_HOME%
SET APP_HOME=%APP_HOME:~0,-16%
echo APP_HOME = %APP_HOME%
cd %APP_HOME%

:: Check dependencies
    docker version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOCKER
    git version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_GIT

:: Build the container image
    git log --pretty=format:%%H -n 1 > tmpfile.tmp
    SET /P COMMIT=<tmpfile.tmp
    DEL tmpfile.tmp

    SET DOCKER_LABEL1=Tags=Azure,IoT,Solutions,React,SPA
    SET DOCKER_LABEL2=Commit=%COMMIT%

    ECHO Creating out\docker in %APP_HOME%
    rmdir /s /q out\docker

    mkdir out\docker\src
    mkdir out\docker\build

    copy .env            out\docker\
    copy package.json    out\docker\
    xcopy /s src\*       out\docker\src\
    xcopy /s public\*    out\docker\public\

    copy scripts\docker\.dockerignore               out\docker\
    copy scripts\docker\Dockerfile                  out\docker\
    copy scripts\docker\content\run.sh              out\docker\
    copy scripts\docker\content\nginx.conf          out\docker\

    cd out\docker\

    :: note: images built in Windows don't contain a label with a datetime
    docker build --compress --tag %DOCKER_TAG% --label "%DOCKER_LABEL1%" --label "%DOCKER_LABEL2%" .

    IF %ERRORLEVEL% NEQ 0 GOTO FAIL

:: - - - - - - - - - - - - - -
goto :END

:MISSING_DOCKER
    echo ERROR: 'docker' command not found.
    echo Install Docker and make sure the 'docker' command is in the PATH.
    echo Docker installation: https://www.docker.com/community-edition#/download
    exit /B 1

:MISSING_GIT
    echo ERROR: 'git' command not found.
    echo Install Git and make sure the 'git' command is in the PATH.
    echo Git installation: https://git-scm.com
    exit /B 1

:FAIL
    echo Command failed
    endlocal
    exit /B 1

:END
endlocal
