:: Copyright (c) Microsoft. All rights reserved.

@ECHO off & setlocal enableextensions enabledelayedexpansion

:: Used the passed in image name, if available
SET DOCKER_TAG=%1
IF [%1]==[] (
    :: Note: use lowercase names for the Docker images
    SET DOCKER_IMAGE=azureiotpcs/device-simulation-dotnet
    :: "testing" is the latest dev build, usually matching the code in the "master" branch
    SET DOCKER_TAG=%DOCKER_IMAGE%:testing
)

:: Debug|Release
SET CONFIGURATION=Release

:: strlen("\scripts\docker\") => 16
SET APP_HOME=%~dp0
SET APP_HOME=%APP_HOME:~0,-16%
cd %APP_HOME%

echo %ERRORLEVEL%
dotnet --version > NUL

:: Check dependencies
    :: Run dotnet --version and send its output to NUL. Then, take any errors
    :: (that's what '2' represenets, stderr, and send it to stdout (1)).
    :: If there is a value for %ERRORLEVEL% then jump to an error handler
    dotnet --version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOTNET
    docker version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_DOCKER
    git version > NUL 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO MISSING_GIT

:: Restore packages and build the application
    call dotnet restore
    IF %ERRORLEVEL% NEQ 0 GOTO FAIL

    echo.
    echo ##############################################
    echo ######### Running dotnet build... ############
    echo ##############################################
    echo.

    call dotnet build --configuration %CONFIGURATION%
    IF %ERRORLEVEL% NEQ 0 GOTO FAIL

:: Build the container image
    git log --pretty=format:%%H -n 1 > tmpfile.tmp
    SET /P COMMIT=<tmpfile.tmp
    DEL tmpfile.tmp
    SET DOCKER_LABEL2=Commit=%COMMIT%

    rmdir /s /q out\docker
    rmdir /s /q WebService\bin\Docker

    mkdir out\docker\webservice

    echo.
    echo ##############################################
    echo ######### Running dotnet publish... ##########
    echo ##############################################
    echo.

    :: Note that .Net 3 and .Net 2 handle relative paths differently (when using the --output flag)
    :: See https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-publish if the output files
    :: are missing.
    dotnet publish WebService      --configuration %CONFIGURATION% --output WebService\bin\Docker

    echo.
    echo #####################################################################################
    echo ####### Copying files from WebService\bin\Docker to out\docker\webservice... ########
    echo #####################################################################################
    echo.

    xcopy /s WebService\bin\Docker\*       out\docker\webservice\

    echo Copying .dockerignore...
    copy scripts\docker\.dockerignore               out\docker\
    copy scripts\docker\Dockerfile                  out\docker\
    copy scripts\docker\content\run.sh              out\docker\

    cd out\docker\
    echo Running docker build...
    docker build --compress --tag %DOCKER_TAG% --label "%DOCKER_LABEL2%" .

    IF %ERRORLEVEL% NEQ 0 GOTO FAIL

:: - - - - - - - - - - - - - -
goto :END

:MISSING_DOTNET
    echo ERROR: 'dotnet' command not found.
    echo Install .NET Core 2 and make sure the 'dotnet' command is in the PATH.
    echo Nuget installation: https://dotnet.github.io/
    exit /B 1

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
