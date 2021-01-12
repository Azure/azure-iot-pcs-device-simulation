// Copyright (c) Microsoft. All rights reserved.

using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Newtonsoft.Json;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Models
{
    public class StatusResultApiModel
    {
        [JsonProperty(PropertyName = "IsHealthy", Order = 10)]
        public bool IsHealthy { get; set; }

        [JsonProperty(PropertyName = "Message", Order = 20)]
        public string Message { get; set; }

        public StatusResultApiModel(StatusResultServiceModel servicemodel)
        {
            this.IsHealthy = servicemodel.IsHealthy;
            this.Message = servicemodel.Message;
        }
    }
}
