// Copyright (c) Microsoft. All rights reserved.

using Microsoft.Azure.IoTSolutions.Diagnostics.Services;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Controllers;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Models;
using Moq;
using System.Collections.Generic;
using Xunit;

namespace WebService.Test.Controllers
{
    public class DiagnosticsEventsTest
    {
        private readonly Mock<ILogDiagnostics> logDiagnosticsService;
        private readonly Mock<ILogger> log;
        private readonly Mock<IServicesConfig> servicesConfig;
        private readonly DiagnosticsEvents target;
        private readonly DiagnosticsEventsApiModel data;

        public DiagnosticsEventsTest()
        {
            this.logDiagnosticsService = new Mock<ILogDiagnostics>();
            this.servicesConfig = new Mock<IServicesConfig>();
            this.log = new Mock<ILogger>();

            this.data = new DiagnosticsEventsApiModel();

            this.target = new DiagnosticsEvents(
                this.logDiagnosticsService.Object,
                this.servicesConfig.Object);
        }

        [Fact]
        public void ItReturnsTrueOnSuccess()
        {
            // Arrange
            this.logDiagnosticsService
                .Setup(x => x.LogEventsAsync(It.IsAny<DiagnosticsEventsServiceModel>()))
                .ReturnsAsync(true);

            // Act
            var result = this.target.PostAsync(this.data).Result;

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void ItReturnsFalseOnFailure()
        {
            // Arrange
            this.logDiagnosticsService
                .Setup(x => x.LogEventsAsync(It.IsAny<DiagnosticsEventsServiceModel>()))
                .ReturnsAsync(false);

            // Act
            var result = this.target.PostAsync(this.data).Result;

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ItSendsUserDataToRequest()
        {
            // Arrange
            this.data.EventType = "MockEvent";
            this.data.EventProperties = new Dictionary<string, object>();
            this.data.EventProperties.Add("id", "elevator - 01");
            this.data.EventProperties.Add("count", 1);
            this.data.SessionId = 123;
            this.data.UserProperties = new Dictionary<string, object>();
            this.data.UserProperties.Add("Property1", "Value1");
            this.data.UserProperties.Add("Property2", "Value2");

            this.logDiagnosticsService
                .Setup(x => x.LogEventsAsync(It.IsAny<DiagnosticsEventsServiceModel>()))
                .ReturnsAsync(true);

            // Act
            var result = this.target.PostAsync(this.data).Result;

            // Assert
            this.logDiagnosticsService.Verify(
                m => m.LogEventsAsync(It.Is<DiagnosticsEventsServiceModel>(arg => arg.EventType.Equals(this.data.EventType))));
            this.logDiagnosticsService.Verify(
                m => m.LogEventsAsync(It.Is<DiagnosticsEventsServiceModel>(arg => arg.EventProperties.Equals(this.data.EventProperties))));
            this.logDiagnosticsService.Verify(
                m => m.LogEventsAsync(It.Is<DiagnosticsEventsServiceModel>(arg => arg.SessionId == this.data.SessionId)));
            this.logDiagnosticsService.Verify(
                m => m.LogEventsAsync(It.Is<DiagnosticsEventsServiceModel>(arg => arg.UserProperties.Equals(this.data.UserProperties))));
        }
    }
}