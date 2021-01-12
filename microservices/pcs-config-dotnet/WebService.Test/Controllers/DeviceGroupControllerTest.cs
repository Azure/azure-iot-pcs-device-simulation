// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Models;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Controllers;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Models;
using Moq;
using WebService.Test.helpers;
using Xunit;

namespace WebService.Test.Controllers
{
    public class DeviceGroupControllerTest
    {
        private readonly Mock<IStorage> mockStorage;
        private readonly DeviceGroupController controller;
        private readonly Random rand;

        public DeviceGroupControllerTest()
        {
            this.mockStorage = new Mock<IStorage>();
            this.controller = new DeviceGroupController(this.mockStorage.Object);
            this.rand = new Random();
        }

        [Fact]
        public async Task GetAllAsyncTest()
        {
            var models = new[]
            {
                new DeviceGroup
                {
                    Id = this.rand.NextString(),
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    },
                    ETag = this.rand.NextString()
                },
                new DeviceGroup
                {
                    Id = this.rand.NextString(),
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    },
                    ETag = this.rand.NextString()
                },
                new DeviceGroup
                {
                    Id = this.rand.NextString(),
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    },
                    ETag = this.rand.NextString()
                }
            };

            this.mockStorage
                .Setup(x => x.GetAllDeviceGroupsAsync())
                .ReturnsAsync(models);

            var result = await this.controller.GetAllAsync();

            this.mockStorage
                .Verify(x => x.GetAllDeviceGroupsAsync(), Times.Once);

            Assert.Equal(result.Items.Count(), models.Length);
            foreach (var item in result.Items)
            {
                var model = models.Single(g => g.Id == item.Id);
                Assert.Equal(model.DisplayName, item.DisplayName);
                Assert.Equal(model.Conditions, item.Conditions);
                Assert.Equal(model.ETag, item.ETag);
            }
        }

        [Fact]
        public async Task GetAsyncTest()
        {
            var groupId = this.rand.NextString();
            var displayName = this.rand.NextString();
            var conditions = new List<DeviceGroupCondition>()
            {
                new DeviceGroupCondition()
                {
                    Key = this.rand.NextString(),
                    Operator = OperatorType.EQ,
                    Value = this.rand.NextString()
                }
            };
            var etag = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.GetDeviceGroupAsync(It.IsAny<string>()))
                .ReturnsAsync(new DeviceGroup
                {
                    Id = groupId,
                    DisplayName = displayName,
                    Conditions = conditions,
                    ETag = etag
                });

            var result = await this.controller.GetAsync(groupId);

            this.mockStorage
                .Verify(x => x.GetDeviceGroupAsync(
                    It.Is<string>(s => s == groupId)),
                    Times.Once);

            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions, conditions);
            Assert.Equal(result.ETag, etag);
        }

        [Fact]
        public async Task CreatAsyncTest()
        {
            var groupId = this.rand.NextString();
            var displayName = this.rand.NextString();
            var conditions = new List<DeviceGroupCondition>()
            {
                new DeviceGroupCondition()
                {
                    Key = this.rand.NextString(),
                    Operator = OperatorType.EQ,
                    Value = this.rand.NextString()
                }
            };
            var etag = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.CreateDeviceGroupAsync(It.IsAny<DeviceGroup>()))
                .ReturnsAsync(new DeviceGroup
                {
                    Id = groupId,
                    DisplayName = displayName,
                    Conditions = conditions,
                    ETag = etag
                });

            var result = await this.controller.CreateAsync(new DeviceGroupApiModel
            {
                DisplayName = displayName,
                Conditions = conditions
            });

            this.mockStorage
                .Verify(x => x.CreateDeviceGroupAsync(
                    It.Is<DeviceGroup>(m => m.DisplayName == displayName && m.Conditions.First() == conditions.First())),
                    Times.Once);

            Assert.Equal(result.Id, groupId);
            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions, conditions);
            Assert.Equal(result.ETag, etag);
        }

        [Fact]
        public async Task UpdateAsyncTest()
        {
            var groupId = this.rand.NextString();
            var displayName = this.rand.NextString();
            var conditions = new List<DeviceGroupCondition>()
            {
                new DeviceGroupCondition()
                {
                    Key = this.rand.NextString(),
                    Operator = OperatorType.EQ,
                    Value = this.rand.NextString()
                }
            };
            var etagOld = this.rand.NextString();
            var etagNew = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.UpdateDeviceGroupAsync(It.IsAny<string>(), It.IsAny<DeviceGroup>(), It.IsAny<string>()))
                .ReturnsAsync(new DeviceGroup
                {
                    Id = groupId,
                    DisplayName = displayName,
                    Conditions = conditions,
                    ETag = etagNew
                });

            var result = await this.controller.UpdateAsync(groupId,
                new DeviceGroupApiModel
                {
                    DisplayName = displayName,
                    Conditions = conditions,
                    ETag = etagOld
                });

            this.mockStorage
                .Verify(x => x.UpdateDeviceGroupAsync(
                    It.Is<string>(s => s == groupId),
                    It.Is<DeviceGroup>(m => m.DisplayName == displayName && m.Conditions.First() == conditions.First()),
                    It.Is<string>(s => s == etagOld)),
                    Times.Once);

            Assert.Equal(result.Id, groupId);
            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions, conditions);
            Assert.Equal(result.ETag, etagNew);
        }

        [Fact]
        public async Task DeleteAsyncTest()
        {
            var groupId = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.DeleteDeviceGroupAsync(It.IsAny<string>()))
                .Returns(Task.FromResult(0));

            await this.controller.DeleteAsync(groupId);

            this.mockStorage
                .Verify(x => x.DeleteDeviceGroupAsync(
                    It.Is<string>(s => s == groupId)),
                    Times.Once);
        }
    }
}
