// Copyright (c) Microsoft. All rights reserved.

using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Helpers;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.External
{
    public interface IDeviceSimulationClient
    {
        Task<SimulationApiModel> GetSimulationAsync();
        Task UpdateSimulation(SimulationApiModel model);
    }

    public class DeviceSimulationClient : IDeviceSimulationClient
    {
        private const int SIMULATION_ID = 1;
        private readonly IHttpClientWrapper httpClient;
        private readonly string serviceUri;

        public DeviceSimulationClient(
            IHttpClientWrapper httpClient,
            IServicesConfig config)
        {
            this.httpClient = httpClient;
            this.serviceUri = config.DeviceSimulationApiUrl;
        }

        public async Task<SimulationApiModel> GetSimulationAsync()
        {
            return await this.httpClient.GetAsync<SimulationApiModel>($"{this.serviceUri}/simulations/{SIMULATION_ID}", $"Simulation {SIMULATION_ID}", true);
        }

        public async Task UpdateSimulation(SimulationApiModel model)
        {
            await this.httpClient.PutAsync($"{this.serviceUri}/simulations/{SIMULATION_ID}", $"Simulation {SIMULATION_ID}", model);
        }
    }
}
