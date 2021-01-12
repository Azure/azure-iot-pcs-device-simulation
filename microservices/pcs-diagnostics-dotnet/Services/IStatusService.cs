// Copyright (c) Microsoft. All rights reserved.

using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using System.Threading.Tasks;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services
{
    public interface IStatusService
    {
        Task<StatusServiceModel> GetStatusAsync();
    }
}
