// Copyright (c) Microsoft. All rights reserved.

using System;

namespace Microsoft.Azure.IoTSolutions.UIConfig.Services.Exceptions
{
    /// <summary>
    /// This exception is thrown when an external dependency returns any error
    /// </summary>
    public class ExternalDependencyException : Exception
    {
        public ExternalDependencyException() : base()
        {
        }

        public ExternalDependencyException(string message) : base(message)
        {
        }

        public ExternalDependencyException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
