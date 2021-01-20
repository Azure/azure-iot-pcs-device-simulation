:: Copyright (c) Microsoft. All rights reserved.

@ECHO off & setlocal enableextensions enabledelayedexpansion

:: Note: use lowercase names for the Docker images
SET DOCKER_IMAGE="azureiotpcs/pcs-diagnostics-dotnet"

:: strlen("\scripts\docker\") => 16
SET APP_HOME=%~dp0
SET APP_HOME=%APP_HOME:~0,-16%
cd %APP_HOME%

:: The version is stored in a file, to avoid hardcoding it in multiple places
set /P APP_VERSION=<%APP_HOME%/version


:: Check dependencies
    docker version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOCKER

:: Whether to update the "latest" tag of the Docker image
    SET UPDATE_LATEST="no"
    echo Version to publish: %APP_VERSION%
    SET /p RESPONSE="Do you want to publish also the 'latest' version? [y/N] "
    IF "%RESPONSE%" == "y" (SET UPDATE_LATEST="yes")
    IF "%RESPONSE%" == "Y" (SET UPDATE_LATEST="yes")

    if %UPDATE_LATEST% == "no" (
        docker push %DOCKER_IMAGE%:%APP_VERSION%
    ) else (
        docker push %DOCKER_IMAGE%:%APP_VERSION%
        docker push %DOCKER_IMAGE%:latest
    )

    IF %ERRORLEVEL% NEQ 0 GOTO FAIL

:: - - - - - - - - - - - - - -
goto :END

:MISSING_DOCKER
  echo ERROR: 'docker' command not found.
  echo Install Docker and make sure the 'docker' command is in the PATH.
  echo Docker installation: https://www.docker.com/community-edition#/download
  exit /B 1

:FAIL
  echo Command failed
  endlocal
  exit /B 1

:END
endlocal
