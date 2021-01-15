:: Copyright (c) Microsoft. All rights reserved.

:: Prepare the environment variables used by the application.

:: Some settings are used to connect to an external dependency, e.g. backend diagnostics service
:: Depending on which settings and which dependencies are needed, edit the list of variables

:: Type of solution. E.g DeviceSimulation, RemoteMonitoring, etc.
SETX PCS_SOLUTION_TYPE "Enter solution type here"

:: Unique id of solution deployment
SETX PCS_DEPLOYMENT_ID "Enter deployment id here"

:: Subscription Id solution was deployed with
SETX PCS_SUBSCRIPTION_ID "Enter Azure Subscription id here"

:: Cloud Type (ex. Global, China) solution was deployed in
SETX PCS_CLOUD_TYPE "Enter cloud type here"

:: Name of IoT Hub used in solution
SETX PCS_IOTHUB_NAME "Enter IoT Hub name here"

:: Name of solution
SETX PCS_SOLUTION_NAME "Enter solution name here"
