// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.Models
{
    public class DeviceGroup
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public IEnumerable<DeviceGroupCondition> Conditions { get; set; }
        public string ETag { get; set; }
    }
}
