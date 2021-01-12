// Copyright (c) Microsoft. All rights reserved.

using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Helpers;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.External
{
    public interface IDeviceTelemetryClient
    {
        Task UpdateRuleAsync(RuleApiModel rule, string etag);
    }

    public class DeviceTelemetryClient : IDeviceTelemetryClient
    {
        private readonly IHttpClientWrapper httpClient;
        private readonly string serviceUri;

        public DeviceTelemetryClient(
            IHttpClientWrapper httpClient,
            IServicesConfig config)
        {
            this.httpClient = httpClient;
            this.serviceUri = config.TelemetryApiUrl;
        }

        public async Task UpdateRuleAsync(RuleApiModel rule, string etag)
        {
            rule.ETag = etag;

            await this.httpClient.PutAsync($"{this.serviceUri}/rules/{rule.Id}", $"Rule {rule.Id}", rule);
        }
    }
}
