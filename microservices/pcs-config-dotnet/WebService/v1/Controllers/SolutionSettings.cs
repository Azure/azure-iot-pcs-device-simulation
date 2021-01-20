// Copyright (c) Microsoft. All rights reserved.

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Models;
using Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Filters;
using Microsoft.Extensions.Primitives;

namespace Microsoft.Azure.IoTSolutions.UIConfig.WebService.v1.Controllers
{
    [Route(Version.PATH), TypeFilter(typeof(ExceptionsFilterAttribute))]
    public class SolutionSettingsController : Controller
    {
        private readonly IStorage storage;
        private static readonly string ACCESS_CONTROL_EXPOSE_HEADERS = "Access-Control-Expose-Headers";

        public SolutionSettingsController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet("solution-settings/theme")]
        public async Task<object> GetThemeAsync()
        {
            return await this.storage.GetThemeAsync();
        }

        [HttpPut("solution-settings/theme")]
        public async Task<object> SetThemeAsync([FromBody] object theme)
        {
            return await this.storage.SetThemeAsync(theme);
        }

        [HttpGet("solution-settings/logo")]
        public async Task GetLogoAsync()
        {
            var model = await this.storage.GetLogoAsync();
            this.SetImageResponse(model);
        }

        [HttpPut("solution-settings/logo")]
        public async Task SetLogoAsync()
        {
            MemoryStream memoryStream = new MemoryStream();
            this.Request.Body.CopyTo(memoryStream);
            byte[] bytes = memoryStream.ToArray();

            var model = new Logo
            {
                IsDefault = false
            };

            if (bytes.Length > 0)
            {
                model.SetImageFromBytes(bytes);
                model.Type = this.Request.ContentType;
            }

            if (this.Request.Headers[Logo.NAME_HEADER] != StringValues.Empty)
            {
                model.Name = this.Request.Headers[Logo.NAME_HEADER];
            }
        
            var response = await this.storage.SetLogoAsync(model);
            this.SetImageResponse(response);
        }

        private void SetImageResponse(Logo model)
        {
            if(model.Name != null)
            {
                this.Response.Headers.Add(Logo.NAME_HEADER, model.Name);
            }
            this.Response.Headers.Add(Logo.IS_DEFAULT_HEADER, model.IsDefault.ToString());
            this.Response.Headers.Add(SolutionSettingsController.ACCESS_CONTROL_EXPOSE_HEADERS,
                Logo.NAME_HEADER + "," + Logo.IS_DEFAULT_HEADER);
            if (model.Image != null)
            {
                var bytes = model.ConvertImageToBytes();
                this.Response.ContentType = model.Type;
                this.Response.Body.Write(bytes, 0, bytes.Length);
            }
        }
    }
}
