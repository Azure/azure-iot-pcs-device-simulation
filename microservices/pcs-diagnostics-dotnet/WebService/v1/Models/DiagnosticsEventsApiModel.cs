// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Models
{
    public class DiagnosticsEventsApiModel
    {
        [JsonProperty(PropertyName = "EventType", Order = 10)]
        public string EventType { get; set; }

        [JsonProperty(PropertyName = "EventProperties", Order = 20)]
        public Dictionary<string, object> EventProperties { get; set; }

        [JsonProperty(PropertyName = "UserProperties", Order = 30)]
        public Dictionary<string, object> UserProperties { get; set; }

        [JsonProperty(PropertyName = "SessionId", Order = 40)]
        public long? SessionId { get; set; }

        private const string CLOUD_TYPE_KEY = "CloudType";
        private const string IOTHUB_NAME_KEY = "IoTHubName";
        private const string SUBSCRIPTION_ID_KEY = "SubscriptionId";
        private const string SOLUTION_NAME_KEY = "SolutionName";

        public DiagnosticsEventsApiModel()
        {
        }

        public DiagnosticsEventsServiceModel ToServiceModel(IServicesConfig servicesConfig)
        {
            if (!string.IsNullOrEmpty(servicesConfig.CloudType)
                || !string.IsNullOrEmpty(servicesConfig.SubscriptionId)
                || !string.IsNullOrEmpty(servicesConfig.IoTHubName)
                || !string.IsNullOrEmpty(servicesConfig.SolutionName))
            {
                if (this.UserProperties == null)
                {
                    this.UserProperties = new Dictionary<string, object>();
                }
                if (!string.IsNullOrEmpty(servicesConfig.CloudType))
                {
                    this.UserProperties[CLOUD_TYPE_KEY] = servicesConfig.CloudType;
                }
                if (!string.IsNullOrEmpty(servicesConfig.IoTHubName))
                {
                    this.UserProperties[IOTHUB_NAME_KEY] = servicesConfig.IoTHubName;
                }
                if (!string.IsNullOrEmpty(servicesConfig.SubscriptionId))
                {
                    this.UserProperties[SUBSCRIPTION_ID_KEY] = servicesConfig.SubscriptionId;
                }
                if (!string.IsNullOrEmpty(servicesConfig.SolutionName))
                {
                    this.UserProperties[SOLUTION_NAME_KEY] = servicesConfig.SolutionName;
                }
            }

            return new DiagnosticsEventsServiceModel
            {
                EventId = Guid.NewGuid().ToString(),
                EventType = this.EventType,
                EventProperties = this.EventProperties,
                DeploymentId = servicesConfig.DeploymentId,
                SolutionType = servicesConfig.SolutionType,
                Timestamp = DateTimeOffset.UtcNow,
                SessionId = this.SessionId,
                UserProperties = this.UserProperties
            };
        }
    }
}
