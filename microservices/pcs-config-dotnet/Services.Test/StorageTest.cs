// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Exceptions;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.External;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Models;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Runtime;
using Moq;
using Newtonsoft.Json;
using Services.Test.helpers;
using Xunit;

namespace Services.Test
{
    public class StorageTest
    {
        private readonly string azureMapsKey;
        private readonly Mock<IStorageAdapterClient> mockClient;
        private readonly Storage storage;
        private readonly Random rand;

        public StorageTest()
        {
            this.rand = new Random();

            this.azureMapsKey = this.rand.NextString();
            this.mockClient = new Mock<IStorageAdapterClient>();
            this.storage = new Storage(
                this.mockClient.Object,
                new ServicesConfig
                {
                    AzureMapsKey = this.azureMapsKey
                });
        }

        [Fact]
        public async Task GetThemeAsyncTest()
        {
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(new
                    {
                        Name = name,
                        Description = description
                    })
                });

            var result = await this.storage.GetThemeAsync() as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.THEME_KEY)),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
            Assert.Equal(result.AzureMapsKey.ToString(), this.azureMapsKey);
        }

        [Fact]
        public async Task GetThemeAsyncDefaultTest()
        {
            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new ResourceNotFoundException());

            var result = await this.storage.GetThemeAsync() as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.THEME_KEY)),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), Theme.Default.Name);
            Assert.Equal(result.Description.ToString(), Theme.Default.Description);
            Assert.Equal(result.AzureMapsKey.ToString(), this.azureMapsKey);
        }

        [Fact]
        public async Task SetThemeAsyncTest()
        {
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            var theme = new
            {
                Name = name,
                Description = description
            };

            this.mockClient
                .Setup(x => x.UpdateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(theme)
                });

            var result = await this.storage.SetThemeAsync(theme) as dynamic;

            this.mockClient
                .Verify(x => x.UpdateAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.THEME_KEY),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(theme)),
                        It.Is<string>(s => s == "*")),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
            Assert.Equal(result.AzureMapsKey.ToString(), this.azureMapsKey);
        }

        [Fact]
        public async Task GetUserSettingAsyncTest()
        {
            var id = this.rand.NextString();
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(new
                    {
                        Name = name,
                        Description = description
                    })
                });

            var result = await this.storage.GetUserSetting(id) as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.USER_COLLECTION_ID),
                        It.Is<string>(s => s == id)),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
        }

        [Fact]
        public async Task SetUserSettingAsyncTest()
        {
            var id = this.rand.NextString();
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            var setting = new
            {
                Name = name,
                Description = description
            };

            this.mockClient
                .Setup(x => x.UpdateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(setting)
                });

            var result = await this.storage.SetUserSetting(id, setting) as dynamic;

            this.mockClient
                .Verify(x => x.UpdateAsync(
                        It.Is<string>(s => s == Storage.USER_COLLECTION_ID),
                        It.Is<string>(s => s == id),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(setting)),
                        It.Is<string>(s => s == "*")),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
        }

        [Fact]
        public async Task GetLogoShouldReturnExpectedLogo()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();

            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(new Logo
                    {
                        Image = image,
                        Type = type,
                        IsDefault = false
                    })
                });

            var result = await this.storage.GetLogoAsync() as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.LOGO_KEY)),
                    Times.Once);

            Assert.Equal(image, result.Image.ToString());
            Assert.Equal(type, result.Type.ToString());
            Assert.Null(result.Name);
            Assert.False(result.IsDefault);
        }

        [Fact]
        public async Task GetLogoShouldReturnExpectedLogoAndName()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();
            var name = this.rand.NextString();

            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(new Logo
                    {
                        Image = image,
                        Type = type,
                        Name = name,
                        IsDefault = false
                    })
                });

            var result = await this.storage.GetLogoAsync() as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.LOGO_KEY)),
                    Times.Once);

            Assert.Equal(image, result.Image.ToString());
            Assert.Equal(type, result.Type.ToString());
            Assert.Equal(name, result.Name.ToString());
            Assert.False(result.IsDefault);
        }

        [Fact]
        public async Task GetLogoShouldReturnDefaultLogoOnException()
        {
            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new ResourceNotFoundException());

            var result = await this.storage.GetLogoAsync() as dynamic;

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.LOGO_KEY)),
                    Times.Once);

            Assert.Equal(Logo.Default.Image, result.Image.ToString());
            Assert.Equal(Logo.Default.Type, result.Type.ToString());
            Assert.Equal(Logo.Default.Name, result.Name.ToString());
            Assert.True(result.IsDefault);
        }

        [Fact]
        public async Task SetLogoShouldNotOverwriteOldNameWithNull()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();

            var oldImage = this.rand.NextString();
            var oldType = this.rand.NextString();
            var oldName = this.rand.NextString();

            var logo = new Logo
            {
                Image = image,
                Type = type
            };
            
            Logo result = await SetLogoHelper(logo, oldImage, oldName, oldType, false);

            this.mockClient
                .Verify(x => x.UpdateAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.LOGO_KEY),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(logo)),
                        It.Is<string>(s => s == "*")),
                    Times.Once);

            Assert.Equal(image, result.Image.ToString());
            Assert.Equal(type, result.Type.ToString());
            // If name is not set, old name should remain
            Assert.Equal(oldName, result.Name.ToString());
            Assert.False(result.IsDefault);
        }

        [Fact]
        public async Task SetLogoShouldSetAllPartsOfLogoIfNotNull()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();
            var name = this.rand.NextString();

            var oldImage = this.rand.NextString();
            var oldType = this.rand.NextString();
            var oldName = this.rand.NextString();

            var logo = new Logo
            {
                Image = image,
                Type = type,
                Name = name
            };

            Logo result = await SetLogoHelper(logo, oldImage, oldName, oldType, false);

            Assert.Equal(image, result.Image.ToString());
            Assert.Equal(type, result.Type.ToString());
            Assert.Equal(name, result.Name.ToString());
            Assert.False(result.IsDefault);
        }

        [Fact]
        public async Task GetAllDeviceGroupsAsyncTest()
        {
            var groups = new[]
            {
                new DeviceGroup
                {
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    }
                },
                new DeviceGroup
                {
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    }
                },
                new DeviceGroup
                {
                    DisplayName = this.rand.NextString(),
                    Conditions = new List<DeviceGroupCondition>()
                    {
                        new DeviceGroupCondition()
                        {
                            Key = this.rand.NextString(),
                            Operator = OperatorType.EQ,
                            Value = this.rand.NextString()
                        }
                    }
                }
            };

            var items = groups.Select(g => new ValueApiModel
            {
                Key = this.rand.NextString(),
                Data = JsonConvert.SerializeObject(g),
                ETag = this.rand.NextString()
            }).ToList();

            this.mockClient
                .Setup(x => x.GetAllAsync(It.IsAny<string>()))
                .ReturnsAsync(new ValueListApiModel { Items = items });

            var result = (await this.storage.GetAllDeviceGroupsAsync()).ToList();

            this.mockClient
                .Verify(x => x.GetAllAsync(
                        It.Is<string>(s => s == Storage.DEVICE_GROUP_COLLECTION_ID)),
                    Times.Once);

            Assert.Equal(result.Count, groups.Length);
            foreach (var g in result)
            {
                var item = items.Single(i => i.Key == g.Id);
                var group = JsonConvert.DeserializeObject<DeviceGroup>(item.Data);
                Assert.Equal(g.DisplayName, group.DisplayName);
                Assert.Equal(g.Conditions.First().Key, group.Conditions.First().Key);
                Assert.Equal(g.Conditions.First().Operator, group.Conditions.First().Operator);
                Assert.Equal(g.Conditions.First().Value, group.Conditions.First().Value);
            }
        }

        [Fact]
        public async Task GetDeviceGroupsAsyncTest()
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

            this.mockClient
                .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Key = groupId,
                    Data = JsonConvert.SerializeObject(new DeviceGroup
                    {
                        DisplayName = displayName,
                        Conditions = conditions
                    }),
                    ETag = etag
                });

            var result = await this.storage.GetDeviceGroupAsync(groupId);

            this.mockClient
                .Verify(x => x.GetAsync(
                        It.Is<string>(s => s == Storage.DEVICE_GROUP_COLLECTION_ID),
                        It.Is<string>(s => s == groupId)),
                    Times.Once);

            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions.First().Key, conditions.First().Key);
            Assert.Equal(result.Conditions.First().Operator, conditions.First().Operator);
            Assert.Equal(result.Conditions.First().Value, conditions.First().Value);
        }

        [Fact]
        public async Task CreateDeviceGroupAsyncTest()
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

            var group = new DeviceGroup
            {
                DisplayName = displayName,
                Conditions = conditions
            };

            this.mockClient
                .Setup(x => x.CreateAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Key = groupId,
                    Data = JsonConvert.SerializeObject(group),
                    ETag = etag
                });

            var result = await this.storage.CreateDeviceGroupAsync(group);

            this.mockClient
                .Verify(x => x.CreateAsync(
                        It.Is<string>(s => s == Storage.DEVICE_GROUP_COLLECTION_ID),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(group, Formatting.Indented, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }))),
                    Times.Once);

            Assert.Equal(result.Id, groupId);
            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions.First().Key, conditions.First().Key);
            Assert.Equal(result.Conditions.First().Operator, conditions.First().Operator);
            Assert.Equal(result.Conditions.First().Value, conditions.First().Value);
            Assert.Equal(result.ETag, etag);
        }

        [Fact]
        public async Task UpdateDeviceGroupAsyncTest()
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

            var group = new DeviceGroup
            {
                DisplayName = displayName,
                Conditions = conditions
            };

            this.mockClient
                .Setup(x => x.UpdateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Key = groupId,
                    Data = JsonConvert.SerializeObject(group),
                    ETag = etagNew
                });

            var result = await this.storage.UpdateDeviceGroupAsync(groupId, group, etagOld);

            this.mockClient
                .Verify(x => x.UpdateAsync(
                        It.Is<string>(s => s == Storage.DEVICE_GROUP_COLLECTION_ID),
                        It.Is<string>(s => s == groupId),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(group, Formatting.Indented, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore })),
                        It.Is<string>(s => s == etagOld)),
                    Times.Once);

            Assert.Equal(result.Id, groupId);
            Assert.Equal(result.DisplayName, displayName);
            Assert.Equal(result.Conditions.First().Key, conditions.First().Key);
            Assert.Equal(result.Conditions.First().Operator, conditions.First().Operator);
            Assert.Equal(result.Conditions.First().Value, conditions.First().Value);
            Assert.Equal(result.ETag, etagNew);
        }

        [Fact]
        public async Task DeleteDeviceGroupAsyncTest()
        {
            var groupId = this.rand.NextString();

            this.mockClient
                .Setup(x => x.DeleteAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(0));

            await this.storage.DeleteDeviceGroupAsync(groupId);

            this.mockClient
                .Verify(x => x.DeleteAsync(
                        It.Is<string>(s => s == Storage.DEVICE_GROUP_COLLECTION_ID),
                        It.Is<string>(s => s == groupId)),
                    Times.Once);
        }

        private async Task<Logo> SetLogoHelper(Logo logo, string oldImage, string oldName, string oldType, bool isDefault)
        {
            this.mockClient
                .Setup(x => x.UpdateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((string id, string key, string value, string etag) => new ValueApiModel
                {
                    Data = value
                });

            this.mockClient.Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ValueApiModel
                {
                    Data = JsonConvert.SerializeObject(new Logo
                    {
                        Image = oldImage,
                        Type = oldType,
                        Name = oldName,
                        IsDefault = false
                    })
                });

            Logo result = await this.storage.SetLogoAsync(logo);

            this.mockClient
                .Verify(x => x.UpdateAsync(
                        It.Is<string>(s => s == Storage.SOLUTION_COLLECTION_ID),
                        It.Is<string>(s => s == Storage.LOGO_KEY),
                        It.Is<string>(s => s == JsonConvert.SerializeObject(logo)),
                        It.Is<string>(s => s == "*")),
                    Times.Once);

            return result;
        }

    }
}
