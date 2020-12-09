# Overview
The deployment folder contains a Node.js script which, once configured, deploys all the cloud resources (IoT Hub, Virtual Machines, etc.) necessary to run an Azure IoT Device Simulation. Once the deployment succeeds, you will be presented with a URL to access the Simulation UI.
Requirements
- Node.js version 12.18.4 or newer
- Azure subscription
- Windows 10

# Deployment
Deployment is performed by providing the necessary configurations and then by running a Node.js deployment script. In order to get started: 
1. Modify armtemplate/parameters.json to add required configuration values. 
2. Navigate to the 'deployment' directory
3. Run the following command (which requires Node.js to be installed):
```nmp run deploy```
4. Authenticate against Azure by proceeding through the authentication process when prompted.

After performing all of the steps above, the script will create a resource group in your Azure subscription and will deploy the Azure services necessary to run Device Simulation. 

# How to clean up from a failed deployment
The deployment process creates resources and registers an AAD application in your subscription. If your deployment fails, you will need to go to the Azure portal (https://portal.azure.com) and delete the Azure Active Directory (AAD) application registration (this will have the same name as your solution, which is specified in armtemplate/parameters.json).
# How to clear out credentials
When you authenticate against Azure, an authentication token is stored on your PC. If your authentication token ever needs to be deleted, delete the '.iot-device-simulation' folder under the %userprofile% folder (ex: C:\Users\<your user name>\.iot-device-simulation)
# Known issues
## Deployment fails during authentication.
Some Azure subscriptions have subscription access policies which disallow the method of authentication that the deployment script uses (device authentication). Deployment is only supported against subscriptions that do allow device authentication. 
If you encounter authentication errors, delete the stored credentials that the deployment script creates (see 'How to clear out credentials')
## Only the Azure Cloud is supported
Support for deploying to other Clouds is not available.
