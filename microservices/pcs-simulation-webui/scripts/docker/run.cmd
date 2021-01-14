:: Copyright (c) Microsoft. All rights reserved.

@ECHO off & setlocal enableextensions enabledelayedexpansion

:: Usage:
:: scripts\docker\run         : Starts the stable version
:: scripts\docker\run testing : Starts the testing version

:: Note: use lowercase names for the Docker images
SET DOCKER_IMAGE=azureiotpcs/device-simulation-webui
SET STABLE_VERSION=millennium

IF "%1"=="" goto :STABLE
IF "%1"=="testing" goto :TESTING

:STABLE
  echo Starting Simulation Web UI [%STABLE_VERSION%] ...
  docker run -it -p 10080:80 -p 10443:443 %DOCKER_IMAGE%:%STABLE_VERSION%
  goto :END

:TESTING
  echo Starting Simulation Web UI [testing version] ...
  docker run -it -p 10080:80 -p 10443:443 %DOCKER_IMAGE%:testing
  goto :END


:END

endlocal
