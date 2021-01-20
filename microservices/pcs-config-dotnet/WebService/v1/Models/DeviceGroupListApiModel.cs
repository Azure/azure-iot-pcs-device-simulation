// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Models;
using Newtonsoft.Json;

namespace Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Models
{
    public class DeviceGroupListApiModel
    {
        public IEnumerable<DeviceGroupApiModel> Items { get; set; }

        [JsonProperty("$metadata")]
        public Dictionary<string, string> Metadata { get; set; }

        public DeviceGroupListApiModel(IEnumerable<DeviceGroup> models)
        {
            this.Items = models.Select(m => new DeviceGroupApiModel(m));

            this.Metadata = new Dictionary<string, string>
            {
                { "$type", $"DeviceGroupList;{Version.NUMBER}" },
                { "$url", $"/{Version.PATH}/devicegroups" }
            };
        }
    }
}
