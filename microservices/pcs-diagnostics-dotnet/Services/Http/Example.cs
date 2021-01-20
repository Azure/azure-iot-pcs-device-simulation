// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Diagnostics;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services.Http
{
    public class Example
    {
        private readonly IHttpClient httpClient;
        private readonly ILogger log;

        public Example(
            IHttpClient httpClient,
            ILogger logger)
        {
            this.httpClient = httpClient;
            this.log = logger;
        }

        public async Task GetAsync()
        {
            var request = new HttpRequest();

            try
            {
                request.SetUriFromString("https://192.168.0.1/v1/data?key=" + WebUtility.UrlEncode("some parameter"));
                request.AddHeader("X-Foo", "Bar");
                request.Options.Timeout = 5 * 1000;
                request.Options.AllowInsecureSSLServer = true;
                request.Options.EnsureSuccess = true;
                var response = await this.httpClient.GetAsync(request);

                Console.WriteLine(response.Content);
                Console.WriteLine(response.Headers.ETag);
                Console.WriteLine(response.StatusCode);
            }
            catch (HttpRequestException e)
            {
                this.log.Error("Request failed", () => new
                {
                    request.Uri,
                    e.Message
                });
                throw;
            }
        }

        public async Task PostAsync()
        {
            var request = new HttpRequest();
            request.SetUriFromString("http://192.168.0.1/v1/foobars");
            request.AddHeader("X-Foo", "Bar");
            request.Options.Timeout = 5 * 1000;
            request.Options.AllowInsecureSSLServer = true;
            request.Options.EnsureSuccess = false;

            request.SetContent(new Dictionary<string, DateTime>());
            request.SetContent(new DateTime());
            request.SetContent(new DateTime(), Encoding.UTF8, "application/json");

            var response = await this.httpClient.PostAsync(request);

            Console.WriteLine(response.Content);
            Console.WriteLine(response.Headers.ETag);
            Console.WriteLine(response.StatusCode);
        }
    }
}
