// Copyright (c) Microsoft. All rights reserved.

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime
{
    public interface IServicesConfig
    {
        string PcsConfigUrl { get; }
        string SolutionType { get; }
        string DeploymentId { get; }
        string SubscriptionId { get; }
        string IoTHubName { get; }
        string CloudType { get; }
        string SolutionName { get; }
        string AppInsightsInstrumentationKey { get; }
        int UserConsentPollingIntervalSecs { get; }
    }

    public class ServicesConfig : IServicesConfig
    {
        public string PcsConfigUrl { get; set; }
        public string SolutionType { get; set; }
        public string DeploymentId { get; set; }
        public string SubscriptionId { get; set; }
        public string IoTHubName { get; set; }
        public string CloudType { get; set; }
        public string SolutionName { get; set; }
        public string AppInsightsInstrumentationKey { get; set; }
        public int UserConsentPollingIntervalSecs { get; set; }
    }
}