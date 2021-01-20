// Copyright (c) Microsoft. All rights reserved.

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.Runtime
{
    public interface IServicesConfig
    {
        string StorageAdapterApiUrl { get; }
        string DeviceSimulationApiUrl { get; }
        string TelemetryApiUrl { get; }
        string SeedTemplate { get; }
        string AzureMapsKey { get; }
    }

    public class ServicesConfig : IServicesConfig
    {
        public string StorageAdapterApiUrl { get; set; }
        public string DeviceSimulationApiUrl { get; set; }
        public string TelemetryApiUrl { get; set; }
        public string SeedTemplate { get; set; }
        public string AzureMapsKey { get; set; }
    }
}
