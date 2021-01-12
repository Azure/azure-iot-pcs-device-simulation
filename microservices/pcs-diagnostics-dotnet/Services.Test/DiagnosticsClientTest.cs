// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Net;
using System.Net.Http.Headers;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.External;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Http;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace Services.Test.External
{
    public class DiagnosticsClientTest
    {
        private const string DIAGNOSTICS_SERVICE_URL = @"http://diagnostics";
        private const string PCS_CONFIG_URL = @"http://config";
        private readonly Mock<IHttpClient> mockHttpClient;
        private readonly Mock<ILogger> mockLogger;
        private readonly DiagnosticsEventsServiceModel data;

        public DiagnosticsClientTest()
        {
            this.mockHttpClient = new Mock<IHttpClient>();
            this.mockLogger = new Mock<ILogger>();
            this.data = new DiagnosticsEventsServiceModel
            {
                EventId = "MockEventId",
                EventType = "MockEvent",
                DeploymentId = "MockDeploymentId",
                SolutionType = "MockSolutionType",
                Timestamp = DateTimeOffset.UtcNow,
            };
        }

        [Fact]
        public void ItShouldReturnTrueIfUserConsentWasSuccessfullyRetrieved()
        {
            // Arrange
            var response = new HttpResponse();

            DiagnosticsClient target = new DiagnosticsClient(
                this.mockHttpClient.Object,
                new ServicesConfig
                {
                    PcsConfigUrl = PCS_CONFIG_URL
                },
                this.mockLogger.Object);

            this.mockHttpClient
                .Setup(x => x.GetAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            // Act
            var result = target.CheckUserConsentAsync().Result;

            // Assert
            this.mockHttpClient.Verify(x => x.GetAsync(It.IsAny<HttpRequest>()), Times.Once);
            Assert.True(result);
        }

        [Fact]
        public void ItShouldReturnFalseIfUserConsentCouldNotBeRetrieved()
        {
            // Arrange
            var response = new HttpResponse(HttpStatusCode.InternalServerError, null, null);

            DiagnosticsClient target = new DiagnosticsClient(
                this.mockHttpClient.Object,
                new ServicesConfig
                {
                    PcsConfigUrl = PCS_CONFIG_URL
                },
                this.mockLogger.Object);

            this.mockHttpClient
                .Setup(x => x.GetAsync(It.IsAny<IHttpRequest>()))
                .ThrowsAsync(new Exception());

            // Act
            var result = target.CheckUserConsentAsync().Result;

            // Assert
            this.mockHttpClient.Verify(x => x.GetAsync(It.IsAny<HttpRequest>()), Times.Once);
            Assert.False(result);
        }

        [Fact]
        public void ItShouldReturnFalseIfConfigUrlIsEmpty()
        {
            // Arrange
            var response = new HttpResponse();

            DiagnosticsClient target = new DiagnosticsClient(
                this.mockHttpClient.Object,
                new ServicesConfig(),
                this.mockLogger.Object);

            // Act
            var result = target.CheckUserConsentAsync().Result;

            // Assert
            this.mockHttpClient.Verify(x => x.GetAsync(It.IsAny<HttpRequest>()), Times.Never);
            Assert.False(result);
        }
    }
}