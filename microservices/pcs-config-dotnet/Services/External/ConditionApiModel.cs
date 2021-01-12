// Copyright (c) Microsoft. All rights reserved.

using Newtonsoft.Json;

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.External
{
    public class ConditionApiModel
    {
        [JsonProperty(PropertyName = "Field")]
        public string Field { get; set; }

        [JsonProperty(PropertyName = "Operator")]
        public string Operator { get; set; }

        [JsonProperty(PropertyName = "Value")]
        public string Value { get; set; }
    }
}
