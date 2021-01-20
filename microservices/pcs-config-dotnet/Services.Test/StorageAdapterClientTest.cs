// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Exceptions;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.External;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Http;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Runtime;
using Moq;
using Newtonsoft.Json;
using Services.Test.helpers;
using Xunit;

namespace Services.Test
{
    public class StorageAdapterClientTest
    {
        private const string MOCK_SERVICE_URI = @"http://mockstorageadapter";

        private readonly Mock<IHttpClient> mockHttpClient;
        private readonly StorageAdapterClient client;
        private readonly Random rand;

        public StorageAdapterClientTest()
        {
            this.mockHttpClient = new Mock<IHttpClient>();
            this.client = new StorageAdapterClient(
                this.mockHttpClient.Object,
                new ServicesConfig
                {
                    StorageAdapterApiUrl = MOCK_SERVICE_URI
                },
                new Logger("UnitTest", LogLevel.Debug));
            this.rand = new Random();
        }

        [Fact]
        public async Task GetAsyncTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();
            var data = this.rand.NextString();
            var etag = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.OK,
                IsSuccessStatusCode = true,
                Content = JsonConvert.SerializeObject(new ValueApiModel
                {
                    Key = key,
                    Data = data,
                    ETag = etag
                })
            };

            this.mockHttpClient
                .Setup(x => x.GetAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            var result = await this.client.GetAsync(collectionId, key);

            this.mockHttpClient
                .Verify(x => x.GetAsync(
                        It.Is<IHttpRequest>(r => r.Check($"{MOCK_SERVICE_URI}/collections/{collectionId}/values/{key}"))),
                    Times.Once);

            Assert.Equal(result.Key, key);
            Assert.Equal(result.Data, data);
            Assert.Equal(result.ETag, etag);
        }

        [Fact]
        public async Task GetAsyncNotFoundTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.NotFound,
                IsSuccessStatusCode = false
            };

            this.mockHttpClient
                .Setup(x => x.GetAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            await Assert.ThrowsAsync<ResourceNotFoundException>(async () =>
                await this.client.GetAsync(collectionId, key));
        }

        [Fact]
        public async Task GetAllAsyncTest()
        {
            var collectionId = this.rand.NextString();
            var models = new[]
            {
                new ValueApiModel
                {
                    Key = this.rand.NextString(),
                    Data = this.rand.NextString(),
                    ETag = this.rand.NextString()
                },
                new ValueApiModel
                {
                    Key = this.rand.NextString(),
                    Data = this.rand.NextString(),
                    ETag = this.rand.NextString()
                },
                new ValueApiModel
                {
                    Key = this.rand.NextString(),
                    Data = this.rand.NextString(),
                    ETag = this.rand.NextString()
                }
            };

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.OK,
                IsSuccessStatusCode = true,
                Content = JsonConvert.SerializeObject(new ValueListApiModel { Items = models })
            };

            this.mockHttpClient
                .Setup(x => x.GetAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            var result = await this.client.GetAllAsync(collectionId);

            this.mockHttpClient
                .Verify(x => x.GetAsync(
                        It.Is<IHttpRequest>(r => r.Check($"{MOCK_SERVICE_URI}/collections/{collectionId}/values"))),
                    Times.Once);

            Assert.Equal(result.Items.Count(), models.Length);
            foreach (var item in result.Items)
            {
                var model = models.Single(m => m.Key == item.Key);
                Assert.Equal(model.Data, item.Data);
                Assert.Equal(model.ETag, item.ETag);
            }
        }

        [Fact]
        public async Task CreateAsyncTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();
            var data = this.rand.NextString();
            var etag = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.OK,
                IsSuccessStatusCode = true,
                Content = JsonConvert.SerializeObject(new ValueApiModel
                {
                    Key = key,
                    Data = data,
                    ETag = etag
                })
            };

            this.mockHttpClient
                .Setup(x => x.PostAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            var result = await this.client.CreateAsync(collectionId, data);

            this.mockHttpClient
                .Verify(x => x.PostAsync(
                        It.Is<IHttpRequest>(r => r.Check<ValueApiModel>($"{MOCK_SERVICE_URI}/collections/{collectionId}/values", m => m.Data == data))),
                    Times.Once);

            Assert.Equal(result.Key, key);
            Assert.Equal(result.Data, data);
            Assert.Equal(result.ETag, etag);
        }

        [Fact]
        public async Task UpdateAsyncTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();
            var data = this.rand.NextString();
            var etagOld = this.rand.NextString();
            var etagNew = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.OK,
                IsSuccessStatusCode = true,
                Content = JsonConvert.SerializeObject(new ValueApiModel
                {
                    Key = key,
                    Data = data,
                    ETag = etagNew
                })
            };

            this.mockHttpClient
                .Setup(x => x.PutAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            var result = await this.client.UpdateAsync(collectionId, key, data, etagOld);

            this.mockHttpClient
                .Verify(x => x.PutAsync(
                        It.Is<IHttpRequest>(r => r.Check<ValueApiModel>($"{MOCK_SERVICE_URI}/collections/{collectionId}/values/{key}", m => m.Data == data && m.ETag == etagOld))),
                    Times.Once);

            Assert.Equal(result.Key, key);
            Assert.Equal(result.Data, data);
            Assert.Equal(result.ETag, etagNew);
        }

        [Fact]
        public async Task UpdateAsyncConflictTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();
            var data = this.rand.NextString();
            var etag = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.Conflict,
                IsSuccessStatusCode = false
            };

            this.mockHttpClient
                .Setup(x => x.PutAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            await Assert.ThrowsAsync<ConflictingResourceException>(async () =>
                await this.client.UpdateAsync(collectionId, key, data, etag));
        }

        [Fact]
        public async Task DeleteAsyncTest()
        {
            var collectionId = this.rand.NextString();
            var key = this.rand.NextString();

            var response = new HttpResponse
            {
                StatusCode = HttpStatusCode.OK,
                IsSuccessStatusCode = true
            };

            this.mockHttpClient
                .Setup(x => x.DeleteAsync(It.IsAny<IHttpRequest>()))
                .ReturnsAsync(response);

            await this.client.DeleteAsync(collectionId, key);

            this.mockHttpClient
                .Verify(x => x.DeleteAsync(
                        It.Is<IHttpRequest>(r => r.Check($"{MOCK_SERVICE_URI}/collections/{collectionId}/values/{key}"))),
                    Times.Once);
        }
    }
}
