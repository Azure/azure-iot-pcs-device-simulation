// Copyright (c) Microsoft. All rights reserved.

using System.Net;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("Services.Test")]

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.Http
{
    public interface IHttpResponse
    {
        HttpStatusCode StatusCode { get; }
        bool IsSuccessStatusCode { get; }
        HttpResponseHeaders Headers { get; }
        string Content { get; }
        bool IsRetriableError { get; }
    }

    public class HttpResponse : IHttpResponse
    {
        private const int TOO_MANY_REQUESTS = 429;

        public HttpResponse()
        {
        }

        public HttpStatusCode StatusCode { get; internal set; }
        public bool IsSuccessStatusCode { get; internal set; }
        public HttpResponseHeaders Headers { get; internal set; }
        public string Content { get; internal set; }

        public bool IsRetriableError => this.StatusCode == HttpStatusCode.NotFound ||
                                        this.StatusCode == HttpStatusCode.RequestTimeout ||
                                        (int) this.StatusCode == TOO_MANY_REQUESTS;
    }
}
