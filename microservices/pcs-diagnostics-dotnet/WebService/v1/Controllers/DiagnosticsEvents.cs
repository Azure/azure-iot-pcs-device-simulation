// Copyright (c) Microsoft. All rights reserved.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Filters;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Controllers
{
    [Route(Version.PATH + "/[controller]"), TypeFilter(typeof(ExceptionsFilterAttribute))]
    public sealed class DiagnosticsEvents : Controller
    {
        private readonly ILogDiagnostics logDiagnosticsService;
        private readonly IServicesConfig servicesConfig;

        public DiagnosticsEvents(
            ILogDiagnostics logDiagnosticsService,
            IServicesConfig servicesConfig)
        {
            this.logDiagnosticsService = logDiagnosticsService;
            this.servicesConfig = servicesConfig;
        }

        [HttpPost]
        public async Task<bool> PostAsync(
            [FromBody] DiagnosticsEventsApiModel data)
        {
            return await this.logDiagnosticsService.LogEventsAsync(data.ToServiceModel(this.servicesConfig));
        }
    }
}
