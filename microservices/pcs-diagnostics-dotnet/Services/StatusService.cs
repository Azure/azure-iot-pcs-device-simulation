// Copyright (c) Microsoft. All rights reserved.

using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.External;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services
{
    class StatusService : IStatusService
    {
        private readonly ILogger log;
        private readonly IDiagnosticsClient diagnosticsClient;
        private readonly IServicesConfig servicesConfig;

        public StatusService(
            ILogger logger,
            IDiagnosticsClient diagnosticsClient,
            IServicesConfig servicesConfig
            )
        {
            this.log = logger;
            this.diagnosticsClient = diagnosticsClient;
            this.servicesConfig = servicesConfig;
        }

        public async Task<StatusServiceModel> GetStatusAsync()
        {
            var result = new StatusServiceModel(true, "Alive and well!");
            var errors = new List<string>();

            // Check access to Config
            // TODO: Circular dependency keeps calling this method indefinetely
            // var configTuple = await this.diagnosticsClient.pingConfigServiceAsync();
            // SetServiceStatus("Config", configTuple, result, errors);

            result.Properties.Add("PcsConfigUrl", this.servicesConfig.PcsConfigUrl);
            result.Properties.Add("IoTHubName", this.servicesConfig.IoTHubName);
            this.log.Info(
                "Service status request",
                () => new
                {
                    Healthy = result.Status.IsHealthy,
                    result.Status.Message
                });

            if (errors.Count > 0)
            {
                result.Status.Message = string.Join("; ", errors);
            }
            return result;
        }

        private void SetServiceStatus(
            string dependencyName,
            StatusResultServiceModel serviceResult,
            StatusServiceModel result,
            List<string> errors
            )
        {
            if (!serviceResult.IsHealthy)
            {
                errors.Add(dependencyName + " check failed");
                result.Status.IsHealthy = false;
            }

            result.Dependencies.Add(dependencyName, serviceResult);
        }
    }
}
