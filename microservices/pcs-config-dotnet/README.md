
[![Build][build-badge]][build-url]
[![Issues][issues-badge]][issues-url]
[![Gitter][gitter-badge]][gitter-url]

# Config Service Overview

This service handles communication with the [Storage Adapter] microservice to complete tasks.

The microservice provides a RESTful endpoint to make CRUD operations for
"devicegroups", "solution-settings", and "user-settings".
The data will be stored by the [Storage Adapter] microservice.

## Why?

This microservice was built as part of the 
[Azure IoT Remote Monitoring](https://github.com/Azure/azure-iot-pcs-remote-monitoring-dotnet)
project to provide a generic implementation for an end-to-end IoT solution.
More information [here][rm-arch-url].

## Features
* Create or update device groups
* Get all or a single device group
* Get or upload logo
* Get or set overall solution settings
* Get or set individual user settings

## Documentation
* View the API documentation in the [Wiki](https://github.com/Azure/pcs-config-dotnet/wiki)

# How to Use

## Running the Service with Docker
You can run the microservice and its dependencies using
[Docker](https://www.docker.com/) with the instructions
[here][run-with-docker-url].

## Running the Service Locally
## Prerequisites

### 1. Deploy Azure Services

This service has a dependency on the following Azure resources. 
Follow the instructions for 
[Deploy the Azure services](https://docs.microsoft.com/azure/iot-suite/iot-suite-remote-monitoring-deploy-local#deploy-the-azure-services).

* Cosmos DB
* Iot Hub
* Maps (optional)

### 2. Setup Dependencies

This service depends on the following repositories.
Run those services from the instructions in their READMEs in the following order.

1. [Storage Adapter Dotnet Microservice](https://github.com/Azure/pcs-storage-adapter-dotnet)
1. [Telemetry Dotnet Microservice](https://github.com/Azure/device-telemetry-dotnet)
1. [Device Simulation Dotnet Microservice](https://github.com/Azure/device-simulation-dotnet)

### 3. Environment variables required to run the service
In order to run the service, some environment variables need to be
created at least once. See specific instructions for IDE or command
line setup below for more information. More information on environment
variables [here](#configuration-and-environment-variables).

* `PCS_STORAGEADAPTER_WEBSERVICE_URL` - the url for
  the [Storage Adapter Webservice](https://github.com/Azure/pcs-storage-adapter-dotnet)
  used for key value storage
* `PCS_DEVICESIMULATION_WEBSERVICE_URL` - the url for
  the [Device Simulation Webservice](https://github.com/Azure/device-simulation-dotnet.git)
  used for key value storage
- `PCS_TELEMETRY_WEBSERVICE_URL` - the url for
  the [Telemetry Webservice](https://github.com/Azure/device-telemetry-dotnet.git)
  used for key value storage
*  `PCS_AZUREMAPS_KEY` - the [Azure Maps](https://azure.microsoft.com/services/azure-maps/) 
  API Key. This can be set to "static" if you do not have one.

## Running the service with Visual Studio or VS Code

1. Make sure the [Prerequisites](#prerequisites) are set up.
1. [Install .NET Core 2.x][dotnet-install]
1. Install any recent edition of Visual Studio (Windows/MacOS) or Visual
   Studio Code (Windows/MacOS/Linux).
   * If you already have Visual Studio installed, then ensure you have
   [.NET Core Tools for Visual Studio 2017][dotnetcore-tools-url]
   installed (Windows only).
   * If you already have VS Code installed, then ensure you have the [C# for Visual Studio Code (powered by OmniSharp)][omnisharp-url] extension installed.
1. Open the solution in Visual Studio or VS Code.
1. Define the following environment variables. See [Configuration and Environment variables](#configuration-and-environment-variables) for detailed information for setting these for your enviroment.
   1. `PCS_STORAGEADAPTER_WEBSERVICE_URL` = http://localhost:9022/v1
   1. `PCS_DEVICESIMULATION_WEBSERVICE_URL` = http://localhost:9003/v1
   1. `PCS_TELEMETRY_WEBSERVICE_URL` = http://localhost:9004/v1
   1. `PCS_AZUREMAPS_KEY` = static
1. Start the WebService project (e.g. press F5).
1. Use an HTTP client such as [Postman][postman-url], to exercise the
   [RESTful API](https://github.com/Azure/pcs-config-dotnet/wiki/API-Specs).

## Running the service from the command line

1. Make sure the [Prerequisites](#prerequisites) are set up.
1. Set the following environment variables in your system. 
More information on environment variables
[here](#configuration-and-environment-variables).
   1. `PCS_STORAGEADAPTER_WEBSERVICE_URL` = http://localhost:9022/v1
   1. `PCS_DEVICESIMULATION_WEBSERVICE_URL` = http://localhost:9003/v1
   1. `PCS_TELEMETRY_WEBSERVICE_URL` = http://localhost:9004/v1
   1. `PCS_AZUREMAPS_KEY` = static
1. Use the scripts in the [scripts](scripts) folder for many frequent tasks:
   *  `build`: compile all the projects and run the tests.
   *  `compile`: compile all the projects.
   *  `run`: compile the projects and run the service. This will prompt for
  elevated privileges in Windows to run the web service.

## Project Structure
This microservice contains the following projects:
* **WebService.csproj** - C# web service exposing REST interface for config functionality
* **WebService.Test.csproj** - Unit tests for web services functionality
* **Services.csproj** - C# assembly containining business logic for interacting 
with storage microserivce, telemetry microservice and device simulation microservice
* **Services.Test.csproj** - Unit tests for services functionality
* **Solution/scripts** - Contains build scripts, docker container creation scripts, 
and scripts for running the microservice from the command line

# Updating the Docker image
The `scripts` folder includes a [docker](scripts/docker) subfolder with the files
required to package the service into a Docker image:

* `Dockerfile`: docker images specifications
* `build`: build a Docker container and store the image in the local registry
* `run`: run the Docker container from the image stored in the local registry
* `content`: a folder with files copied into the image, including the entry point script

# Configuration and Environment variables

The service configuration is accessed via ASP.NET Core configuration
adapters, and stored in [appsettings.ini](WebService/appsettings.ini).
The INI format allows to store values in a readable format, with comments.

The configuration also supports references to environment variables, e.g. to
import credentials and network details. Environment variables are not
mandatory though, you can for example edit appsettings.ini and write
credentials directly in the file. Just be careful not sharing the changes,
e.g. sending a Pull Request or checking in the changes in git.

The configuration file in the repository references some environment
variables that need to be defined. Depending on the OS and the IDE used,
there are several ways to manage environment variables.

1. If you're using Visual Studio (Windows/MacOS), the environment
   variables are loaded from the project settings. Right click on WebService,
   and select Options/Properties, and find the section with the list of env
   vars. See [WebService/Properties/launchSettings.json](WebService/Properties/launchSettings.json).
1. Visual Studio Code (Windows/MacOS/Linux) loads the environment variables from
   [.vscode/launch.json](.vscode/launch.json)
1. When running the service **with Docker** or **from the command line**, the
   application will inherit environment variables values from the system. 
   * [This page][windows-envvars-howto-url] describes how to setup env vars
     in Windows. We suggest to edit and execute once the
     [env-vars-setup.cmd](scripts/env-vars-setup.cmd) script included in the
     repository. The settings will persist across terminal sessions and reboots.
   * For Linux and MacOS, we suggest to edit and execute
     [env-vars-setup](scripts/env-vars-setup) each time, before starting the
     service. Depending on OS and terminal, there are ways to persist values
     globally, for more information these pages should help:
     * https://stackoverflow.com/questions/13046624/how-to-permanently-export-a-variable-in-linux
     * https://stackoverflow.com/questions/135688/setting-environment-variables-in-os-x
     * https://help.ubuntu.com/community/EnvironmentVariables

# Contributing to the solution
Please follow our [contribution guildelines](CONTRIBUTING.md) and code style
conventions.

# Feedback
Please enter issues, bugs, or suggestions as 
[GitHub Issues](https://github.com/Azure/pcs-config-dotnet/issues).

# License
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the [MIT](LICENSE) License.

[build-badge]: https://img.shields.io/travis/Azure/pcs-config-dotnet.svg
[build-url]: https://travis-ci.org/Azure/pcs-config-dotnet
[issues-badge]: https://img.shields.io/github/issues/azure/pcs-config-dotnet.svg
[issues-url]: https://github.com/azure/pcs-config-dotnet/issues
[gitter-badge]: https://img.shields.io/gitter/room/azure/iot-solutions.js.svg
[gitter-url]: https://gitter.im/azure/iot-solutions
[windows-envvars-howto-url]: https://superuser.com/questions/949560/how-do-i-set-system-environment-variables-in-windows-10
[Storage Adapter]:https://github.com/Azure/pcs-storage-adapter-dotnet/blob/master/README.md
[rm-arch-url]:https://docs.microsoft.com/en-us/azure/iot-suite/iot-suite-remote-monitoring-sample-walkthrough
[run-with-docker-url]:https://docs.microsoft.com/azure/iot-suite/iot-suite-remote-monitoring-deploy-local#run-the-microservices-in-docker
[postman-url]: https://www.getpostman.com

[dotnet-install]: https://www.microsoft.com/net/learn/get-started
[vs-install-url]: https://www.visualstudio.com/downloads
[dotnetcore-tools-url]: https://www.microsoft.com/net/core#windowsvs2017
[omnisharp-url]: https://github.com/OmniSharp/omnisharp-vscode
