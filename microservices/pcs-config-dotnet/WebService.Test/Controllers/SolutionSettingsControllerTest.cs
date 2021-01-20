// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Models;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Controllers;
using Moq;
using WebService.Test.helpers;
using Xunit;

namespace WebService.Test.Controllers
{
    public class SolutionControllerTest
    {
        private readonly Mock<IStorage> mockStorage;
        private readonly SolutionSettingsController controller;
        private readonly Random rand;

        public SolutionControllerTest()
        {
            this.mockStorage = new Mock<IStorage>();
            this.controller = new SolutionSettingsController(this.mockStorage.Object);
            this.rand = new Random();
        }

        [Fact]
        public async Task GetThemeAsyncTest()
        {
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.GetThemeAsync())
                .ReturnsAsync(new
                {
                    Name = name,
                    Description = description
                });

            var result = await this.controller.GetThemeAsync() as dynamic;

            this.mockStorage
                .Verify(x => x.GetThemeAsync(), Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
        }

        [Fact]
        public async Task SetThemeAsyncTest()
        {
            var name = this.rand.NextString();
            var description = this.rand.NextString();

            this.mockStorage
                .Setup(x => x.SetThemeAsync(It.IsAny<object>()))
                .ReturnsAsync(new
                {
                    Name = name,
                    Description = description
                });

            var result = await this.controller.SetThemeAsync(new
            {
                Name = name,
                Description = description
            }) as dynamic;

            this.mockStorage
                .Verify(x => x.SetThemeAsync(
                    It.Is<object>(o => this.CheckTheme(o, name, description))),
                    Times.Once);

            Assert.Equal(result.Name.ToString(), name);
            Assert.Equal(result.Description.ToString(), description);
        }

        private bool CheckTheme(object obj, string name, string description)
        {
            var dynamiceObj = obj as dynamic;
            return dynamiceObj.Name.ToString() == name && dynamiceObj.Description.ToString() == description;
        }

        [Fact]
        public async Task GetLogoShouldReturnDefaultLogo()
        {
            using (var mockContext = new MockHttpContext())
            {
                this.controller.ControllerContext.HttpContext = mockContext.Object;

                this.mockStorage
                    .Setup(x => x.GetLogoAsync())
                    .ReturnsAsync(new Logo
                    {
                        Image = Logo.Default.Image,
                        Type = Logo.Default.Type,
                        IsDefault = true
                    });

                await this.controller.GetLogoAsync();

                this.mockStorage
                    .Verify(x => x.GetLogoAsync(), Times.Once);

                Assert.Equal(Logo.Default.Image, mockContext.GetBody());
                Assert.Equal(Logo.Default.Type, mockContext.Object.Response.ContentType);
                Assert.Equal("True", mockContext.GetHeader(Logo.IS_DEFAULT_HEADER));
            }
        }

        [Fact]
        public async Task GetLogoShouldReturnExpectedNameAndType()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();
            var name = this.rand.NextString();

            using (var mockContext = new MockHttpContext())
            {
                this.controller.ControllerContext.HttpContext = mockContext.Object;

                this.mockStorage
                    .Setup(x => x.GetLogoAsync())
                    .ReturnsAsync(new Logo
                    {
                        Image = image,
                        Type = type,
                        Name = name,
                        IsDefault = false
                    });

                await this.controller.GetLogoAsync();

                this.mockStorage
                    .Verify(x => x.GetLogoAsync(), Times.Once);

                Assert.Equal(image, mockContext.GetBody());
                Assert.Equal(type, mockContext.Object.Response.ContentType);
                Assert.Equal(name, mockContext.GetHeader(Logo.NAME_HEADER));
                Assert.Equal("False", mockContext.GetHeader(Logo.IS_DEFAULT_HEADER));
            }
        }

        [Fact]
        public async Task SetLogoShouldReturnGivenLogo()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();
 
            using (var mockContext = new MockHttpContext())
            {
                this.controller.ControllerContext.HttpContext = mockContext.Object;
               
                this.mockStorage
                    .Setup(x => x.SetLogoAsync(It.IsAny<Logo>()))
                    .ReturnsAsync((Logo logo) => logo);
                
                mockContext.Object.Request.ContentType = type;
                mockContext.SetBody(image);

                await this.controller.SetLogoAsync();

                this.mockStorage
                    .Verify(x => x.SetLogoAsync(
                        It.Is<Logo>(m => m.Image == image && m.Type == type && !m.IsDefault)),
                        Times.Once);
                
                Assert.Equal(image, mockContext.GetBody());
                Assert.Equal(type, mockContext.Object.Response.ContentType);
                Assert.Equal("False", mockContext.GetHeader(Logo.IS_DEFAULT_HEADER));
            }
        }

        [Fact]
        public async Task SetLogoShouldReturnGivenLogoAndName()
        {
            var image = this.rand.NextString();
            var type = this.rand.NextString();
            var name = this.rand.NextString();

            using (var mockContext = new MockHttpContext())
            {
                this.controller.ControllerContext.HttpContext = mockContext.Object;

                this.mockStorage
                    .Setup(x => x.SetLogoAsync(It.IsAny<Logo>()))
                    .ReturnsAsync((Logo logo) => logo);

                mockContext.Object.Request.ContentType = type;
                mockContext.SetBody(image);
                mockContext.SetHeader(Logo.NAME_HEADER, name);

                await this.controller.SetLogoAsync();

                this.mockStorage
                    .Verify(x => x.SetLogoAsync(
                        It.Is<Logo>(m => m.Image == image && m.Type == type && m.Name == name && !m.IsDefault)),
                        Times.Once);

                Assert.Equal(image, mockContext.GetBody());
                Assert.Equal(type, mockContext.Object.Response.ContentType);
                Assert.Equal(name, mockContext.GetHeader(Logo.NAME_HEADER));
                Assert.Equal("False", mockContext.GetHeader(Logo.IS_DEFAULT_HEADER));
            }
        }
    }
}
