// Copyright (c) Microsoft. All rights reserved.

using System;
using System.IO;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using Microsoft.Azure.IoTSolutions.Diagnostics.WebService.Auth;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.WebService.Runtime
{
    public interface IConfig
    {
        /// <summary>Web service listening port</summary>
        int Port { get; }

        /// <summary>Service layer configuration</summary>
        IServicesConfig ServicesConfig { get; }

        // Client authentication and authorization configuration
        IClientAuthConfig ClientAuthConfig { get; }
    }

    /// <summary>Web service configuration</summary>
    public class Config : IConfig
    {
        private const string APPLICATION_KEY = "diagnostics:";
        private const string PortKey = APPLICATION_KEY + "webservice_port";
        private const string PCS_CONFIG_URL = APPLICATION_KEY + "pcs_config_url";
        private const string PCS_SOLUTION_TYPE = APPLICATION_KEY + "solution_type";
        private const string PCS_DEPLOYMENT_ID = APPLICATION_KEY + "deployment_id";
        private const string PCS_SUBSCRIPTION_ID = APPLICATION_KEY + "subscription_id";
        private const string PCS_IOTHUB_NAME = APPLICATION_KEY + "iothub_name";
        private const string PCS_CLOUD_TYPE = APPLICATION_KEY + "cloud_type";
        private const string PCS_SOLUTION_NAME = APPLICATION_KEY + "solution_name";
        private const string USER_CONSENT_POLLING_INTERVAL_KEY = APPLICATION_KEY + "user_consent_polling_interval_seconds";

        private const string CLIENT_AUTH_KEY = APPLICATION_KEY + "ClientAuth:";
        private const string CORS_WHITELIST_KEY = CLIENT_AUTH_KEY + "cors_whitelist";
        private const string AUTH_TYPE_KEY = CLIENT_AUTH_KEY + "auth_type";
        private const string AUTH_REQUIRED_KEY = CLIENT_AUTH_KEY + "auth_required";

        private const string JWT_KEY = APPLICATION_KEY + "ClientAuth:JWT:";
        private const string JWT_ALGOS_KEY = JWT_KEY + "allowed_algorithms";
        private const string JWT_ISSUER_KEY = JWT_KEY + "issuer";
        private const string JWT_AUDIENCE_KEY = JWT_KEY + "audience";
        private const string JWT_CLOCK_SKEW_KEY = JWT_KEY + "clock_skew_seconds";

        private const string APPINSIGHTS_INSTRUMENTATION_KEY = APPLICATION_KEY + "appinsights_instrumentation_key";

        /// <summary>Web service listening port</summary>
        public int Port { get; }

        /// <summary>Client auth configuration</summary>
        public IClientAuthConfig ClientAuthConfig { get; }

        /// <summary>Service layer configuration</summary>
        public IServicesConfig ServicesConfig { get; }

        public Config(IConfigData configData)
        {
            this.Port = configData.GetInt(PortKey);

            this.ServicesConfig = new ServicesConfig
            {
                PcsConfigUrl = configData.GetString(PCS_CONFIG_URL),
                SolutionType = configData.GetString(PCS_SOLUTION_TYPE),
                DeploymentId = configData.GetString(PCS_DEPLOYMENT_ID),
                SubscriptionId = configData.GetString(PCS_SUBSCRIPTION_ID),
                CloudType = configData.GetString(PCS_CLOUD_TYPE),
                IoTHubName = configData.GetString(PCS_IOTHUB_NAME),
                SolutionName = configData.GetString(PCS_SOLUTION_NAME),
                UserConsentPollingIntervalSecs = configData.GetInt(USER_CONSENT_POLLING_INTERVAL_KEY, 300),
                AppInsightsInstrumentationKey = configData.GetString(APPINSIGHTS_INSTRUMENTATION_KEY)
            };

            this.ClientAuthConfig = new ClientAuthConfig
            {
                // By default CORS is disabled
                CorsWhitelist = configData.GetString(CORS_WHITELIST_KEY, string.Empty),
                // By default Auth is required
                AuthRequired = configData.GetBool(AUTH_REQUIRED_KEY, true),
                // By default auth type is JWT
                AuthType = configData.GetString(AUTH_TYPE_KEY, "JWT"),
                // By default the only trusted algorithms are RS256, RS384, RS512
                JwtAllowedAlgos = configData.GetString(JWT_ALGOS_KEY, "RS256,RS384,RS512").Split(','),
                JwtIssuer = configData.GetString(JWT_ISSUER_KEY, String.Empty),
                JwtAudience = configData.GetString(JWT_AUDIENCE_KEY, String.Empty),
                // By default the allowed clock skew is 2 minutes
                JwtClockSkew = TimeSpan.FromSeconds(configData.GetInt(JWT_CLOCK_SKEW_KEY, 120)),
            };
        }

        private static string MapRelativePath(string path)
        {
            if (path.StartsWith(".")) return AppContext.BaseDirectory + Path.DirectorySeparatorChar + path;
            return path;
        }
    }
}
