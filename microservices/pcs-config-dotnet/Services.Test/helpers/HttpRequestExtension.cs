// Copyright (c) Microsoft. All rights reserved.

using System;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Http;
using Newtonsoft.Json;

namespace Services.Test.helpers
{
    internal static class HttpRequestExtension
    {
        public static bool Check(this IHttpRequest request, string uri)
        {
            return request.Uri.ToString() == uri;
        }

        public static bool Check<T>(this IHttpRequest request, string uri, Func<T, bool> validator)
        {
            if (request.Uri.ToString() != uri)
            {
                return false;
            }

            if (validator == null)
            {
                return true;
            }

            var model = JsonConvert.DeserializeObject<T>(request.Content.ReadAsStringAsync().Result);
            return validator(model);
        }
    }
}
