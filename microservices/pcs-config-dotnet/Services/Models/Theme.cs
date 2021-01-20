// Copyright (c) Microsoft. All rights reserved.

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.Models
{
    public class Theme
    {
        public string Name { get; private set; }
        public string Description { get; private set; }

        public static readonly Theme Default = new Theme
        {
            Name = "My Solution",
            Description = "My Solution Description"
        };
    }
}
