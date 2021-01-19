:: Copyright (c) Microsoft Corporation.
:: Licensed under the MIT license.

@echo off
setlocal enableDelayedExpansion

SET MICROSERVICES_DIRECTORY=microservices
SET MICROSERVICES_DOTNET=device-simulation-dotnet pcs-storage-adapter-dotnet pcs-diagnostics-dotnet pcs-config-dotnet
SET SERVICENAME_APIGATEWAY=api-gateway
SET SERVICENAME_WEBUI=pcs-simulation-webui
SET ALLCOMPONENTS=%MICROSERVICES_DOTNET% %SERVICENAME_APIGATEWAY% %SERVICENAME_WEBUI%

:: This script is used to build and push the docker images for IoT Device Simulation to a container repository

IF "%1"=="" (
    ECHO.
    ECHO This script builds all of the components ^(Web UI, .Net microservices, and the API gateway^) that are
    ECHO used by IoT Device Simulation deployments. It builds Docker containers for each and pushes them
    ECHO to the Docker container repository for the currently logged in user. A deployed IoT Device Simulation
    ECHO solution includes an Azure VM image that references these containers at startup.
    ECHO.
    ECHO Usage:
    ECHO  --prefix:  the Docker repository to push to
    ECHO  --service: [optional] a specific microservices or component to build. Available options include:
    ECHO             %ALLCOMPONENTS%
    ECHO  --tag:     [optional] the Docker tag to use for each Docker image build. The default value is 'latest'
    ECHO.
    ECHO Examples:
    ECHO  .\buildAndPush --prefix examplereponame
    ECHO  .\buildAndPush --prefix examplereponame --service device-simulation-dotnet
    GOTO :EOF
)
:: Check dependencies
    dotnet --version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOTNET
    docker version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOCKER

:: Process parameters
:: https://stackoverflow.com/questions/3973824/windows-bat-file-optional-argument-parsing/8162578#8162578
SET prefix=
SET service=all
SET tag=latest

:ArgumentLoop 
IF /i NOT "%1"=="" (
    IF "%1"=="--service" (
        SET service=%~2
        SHIFT
    )
    IF "%1"=="--prefix" (
        SET prefix=%~2
        SHIFT
    )
    IF "%1"=="--tag" (
        SET tag=%~2
        SHIFT
    )
    SHIFT
    goto :ArgumentLoop
)

IF "%prefix%" EQU "" ECHO ERROR: Docker image prefix must be specified. & GOTO :EOF

:: verify that the requested service/component is valid
IF [%service%] NEQ [all] (
    FOR %%a IN (%ALLCOMPONENTS%) DO (
        IF "%service%"=="%%a" GOTO :PreBuildReport
    )
    ECHO Invalid service/component name. Supported values are:
    FOR %%a IN (%ALLCOMPONENTS%) DO ECHO  %%a
    GOTO :EOF
)

:PreBuildReport
ECHO.
ECHO The following values will be used:
ECHO   Image repository:    %prefix%
ECHO   Service(s) to build: %service%
ECHO   Image tag to use:    %tag%
ECHO.
SET /P inputValidated=Is this correct (Y/N)? 
IF /i "%inputValidated%"=="Y" GOTO :beginBuild
IF /i "%inputValidated%" NEQ "Y" GOTO :EOF

:beginBuild

SET "var=%cd%"
cd %~dp0

:: Build and push .Net microservices
:: (two IF statements to substiture for a logical 'OR' operator)
FOR %%a IN (%ALLCOMPONENTS%) DO (
    IF %service%==%%a CALL :BuildAndPush %%a & GOTO :EOF
    IF %service%==all CALL :BuildAndPush %%a
)

GOTO :EOF

:: Build Docker images and push
:BuildAndPush

SETLOCAL
SET component=%1

:: The API Gateway source folder uses a different structure
:: than that of the other microservices
IF "%1"=="%SERVICENAME_APIGATEWAY%" (
    SET dockerfilePath=.
) ELSE (
    SET dockerfilePath=scripts/docker
)

ECHO.
ECHO.
ECHO ###############################################################
ECHO # Building and pushing Docker image for %component%
ECHO ###############################################################
ECHO.
ECHO.

:: change directory to the folder of the component that we're building
SET microservicePath=%~dp0%MICROSERVICES_DIRECTORY%\%component%\
CD %microservicePath%

SET imageName=%prefix%/%component%:%tag%
CALL %dockerfilePath%\build.cmd %imageName% || ECHO ERROR building %component% && EXIT /B 1

ECHO Pushing %imageName% to container repository
docker push %imageName% || ECHO ERROR pushing %imageName% && EXIT /B 1

ECHO.
ECHO ## Successfully pushed image %imageName%
ECHO.

EXIT /B 0

GOTO :EOF

:MISSING_DOCKER
    ECHO ERROR: 'docker' command not found.
    ECHO Install Docker and make sure the 'docker' command is in the PATH.
    ECHO Docker installation: https://www.docker.com/community-edition#/download
    GOTO :EOF

:MISSING_DOTNET
    ECHO ERROR: 'dotnet' command not found.
    ECHO Install .NET Core 2 and make sure the 'dotnet' command is in the PATH.
    ECHO Nuget installation: https://dotnet.github.io/
    GOTO :EOF