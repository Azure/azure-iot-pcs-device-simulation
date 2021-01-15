// Copyright (c) Microsoft. All rights reserved.

using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.v1.Models;
using Xunit;

namespace WebService.Test.Models
{
    public class DiagnosticsEventsApiModelTest
    {
        [Fact]
        public void ItSetsConfigDataInServiceModel()
        {
            // Arrange
            DiagnosticsEventsApiModel target = new DiagnosticsEventsApiModel();
            ServicesConfig config = new ServicesConfig
            {
                DeploymentId = "Id1",
                SolutionType = "Sample"
            };

            // Act
            DiagnosticsEventsServiceModel model = target.ToServiceModel(config);

            // Assert
            Assert.Equal(config.DeploymentId, model.DeploymentId);
            Assert.Equal(config.SolutionType, model.SolutionType);

            Assert.Null(model.SessionId);
        }

        [Fact]
        public void ItSetsConfigDataAndUserPropertiesInServiceModel()
        {
            // Arrange
            DiagnosticsEventsApiModel target = new DiagnosticsEventsApiModel();
            target.SessionId = 123;

            ServicesConfig config = new ServicesConfig
            {
                DeploymentId = "Id1",
                SolutionType = "Sample",
                SolutionName = "SampleSolution",
                IoTHubName = "SampleHub",
                CloudType = "Public",
                SubscriptionId = "12345"
            };

            // Act
            DiagnosticsEventsServiceModel model = target.ToServiceModel(config);

            // Assert
            Assert.Equal(config.DeploymentId, model.DeploymentId);
            Assert.Equal(config.SolutionType, model.SolutionType);
            Assert.Equal(target.SessionId, model.SessionId);
            Assert.Equal(config.SubscriptionId, model.UserProperties["SubscriptionId"]);
            Assert.Equal(config.SolutionName, model.UserProperties["SolutionName"]);
            Assert.Equal(config.CloudType, model.UserProperties["CloudType"]);
            Assert.Equal(config.IoTHubName, model.UserProperties["IoTHubName"]);
        }
    }
}