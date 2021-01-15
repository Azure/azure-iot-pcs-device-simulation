// Copyright (c) Microsoft. All rights reserved.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Filters;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Models;

namespace Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Controllers
{
    [Route(Version.PATH + "/devicegroups"), TypeFilter(typeof(ExceptionsFilterAttribute))]
    public class DeviceGroupController : Controller
    {
        private readonly IStorage storage;

        public DeviceGroupController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public async Task<DeviceGroupListApiModel> GetAllAsync()
        {
            return new DeviceGroupListApiModel(await this.storage.GetAllDeviceGroupsAsync());
        }

        [HttpGet("{id}")]
        public async Task<DeviceGroupApiModel> GetAsync(string id)
        {
            return new DeviceGroupApiModel(await this.storage.GetDeviceGroupAsync(id));
        }

        [HttpPost]
        public async Task<DeviceGroupApiModel> CreateAsync([FromBody] DeviceGroupApiModel input)
        {
            return new DeviceGroupApiModel(await this.storage.CreateDeviceGroupAsync(input.ToServiceModel()));
        }

        [HttpPut("{id}")]
        public async Task<DeviceGroupApiModel> UpdateAsync(string id, [FromBody] DeviceGroupApiModel input)
        {
            return new DeviceGroupApiModel(await this.storage.UpdateDeviceGroupAsync(id, input.ToServiceModel(), input.ETag));
        }

        [HttpDelete("{id}")]
        public async Task DeleteAsync(string id)
        {
            await this.storage.DeleteDeviceGroupAsync(id);
        }
    }
}
