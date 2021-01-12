// Copyright (c) Microsoft. All rights reserved.

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.IoTSolutions.StorageAdapter.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.StorageAdapter.WebService.v1.Filters;
using Microsoft.Azure.IoTSolutions.StorageAdapter.WebService.v1.Models;

namespace Microsoft.Azure.IoTSolutions.StorageAdapter.WebService.v1.Controllers
{
    [Route(Version.PATH + "/[controller]"), TypeFilter(typeof(ExceptionsFilterAttribute))]
    public sealed class StatusController : Controller
    {
        private readonly ILogger log;

        public StatusController(ILogger logger)
        {
            this.log = logger;
        }

        public StatusApiModel Get()
        {
            // TODO: calculate the actual service status
            var isOk = true;

            this.log.Info("Service status request", () => new { Healthy = isOk });
            return new StatusApiModel(isOk, "Alive and well");
        }
    }
}
