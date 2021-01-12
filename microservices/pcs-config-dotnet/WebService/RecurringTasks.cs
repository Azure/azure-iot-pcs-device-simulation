// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Threading;
using Microsoft.Azure.IoTSolutions.UIConfig.Services;
using Microsoft.Azure.IoTSolutions.UIConfig.Services.Diagnostics;

namespace Microsoft.Azure.IoTSolutions.UIConfig.WebService
{
    public interface IRecurringTasks
    {
        void Run();
    }

    public class RecurringTasks : IRecurringTasks
    {
        // When seed data creation fails, retry in few seconds
        // using a simple backoff logic
        private const int SEED_RETRY_INIT_SECS = 1;
        private const int SEED_RETRY_MAX_SECS = 8;

        // Allow some time for seed data to be created, shouldn't take too long though
        private const int SEED_TIMEOUT_SECS = 30;

        private readonly ISeed seed;
        private readonly ILogger log;

        public RecurringTasks(
            ISeed seed,
            ILogger logger)
        {
            this.seed = seed;
            this.log = logger;
        }

        public void Run()
        {
            this.SetupSeedData();
        }

        private void SetupSeedData(object context = null)
        {
            var pauseSecs = SEED_RETRY_INIT_SECS;
            while (true)
            {
                try
                {
                    this.log.Info("Creating seed data...", () => { });
                    this.seed.TrySeedAsync().Wait(SEED_TIMEOUT_SECS * 1000);
                    this.log.Info("Seed data created", () => { });
                    return;
                }
                catch (Exception e)
                {
                    this.log.Warn("Seed data setup failed, will retry in few seconds", () => new { pauseSecs, e });
                }

                this.log.Warn("Pausing thread before retrying seed data", () => new { pauseSecs });
                Thread.Sleep(pauseSecs * 1000);

                // Increase the pause, up to a maximum
                pauseSecs = Math.Min(pauseSecs + 1, SEED_RETRY_MAX_SECS);
            }
        }
    }
}
