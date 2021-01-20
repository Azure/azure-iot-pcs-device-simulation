// Copyright (c) Microsoft. All rights reserved.

using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService;
using WebService.Test.helpers;
using WebService.Test.helpers.Http;
using Xunit;
using Xunit.Abstractions;

namespace WebService.Test.IntegrationTests
{
    public class ServiceStatusTest
    {
        private readonly IHttpClient httpClient;

        public ServiceStatusTest(ITestOutputHelper log)
        {
            this.httpClient = new HttpClient(log);
        }

        /// <summary>
        /// Integration test using a real HTTP instance.
        /// Bootstrap a real HTTP server and test a request to the
        /// status endpoint.
        /// </summary>
        [Fact, Trait(Constants.TYPE, Constants.INTEGRATION_TEST)]
        public void TheServiceIsHealthyViaHttpServer()
        {
            // Arrange
            var address = WebServiceHost.GetBaseAddress();
            var host = new WebHostBuilder()
                .UseUrls(address)
                .UseKestrel()
                .UseStartup<Startup>()
                .Build();
            host.Start();

            // Act
            var request = new HttpRequest(address + "/v1/status");
            request.AddHeader("X-Foo", "Bar");
            var response = this.httpClient.GetAsync(request).Result;

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        /// <summary>
        /// Integration test using a test server.
        /// Bootstrap a test server and test a request to the
        /// status endpoint
        /// </summary>
        [Fact, Trait(Constants.TYPE, Constants.INTEGRATION_TEST)]
        public void TheServiceIsHealthyViaTestServer()
        {
            // Arrange
            var hostBuilder = new WebHostBuilder().UseStartup<Startup>();

            using (var server = new TestServer(hostBuilder))
            {
                // Act
                var request = server.CreateRequest("/v1/status");
                request.AddHeader("X-Foo", "Bar");
                var response = request.GetAsync().Result;

                // Assert
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            }
        }
    }
}
