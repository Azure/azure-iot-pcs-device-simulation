// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;

namespace Services.Test.helpers
{
    public static class HashsetExtension
    {
        public static bool SetEquals<T>(this HashSet<T> me, IEnumerable<T> other)
        {
            return me.IsSubsetOf(other) && me.IsSupersetOf(other);
        }
    }
}
