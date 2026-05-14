using System;
using System.Security.Cryptography;

namespace EmpPEP.UI.Common
{
    /// <summary>
    /// Helper for Content-Security-Policy: nonce generation and CSP header building.
    /// Use for per-page CSP on unauthenticated pages (Login, Error, NotAuthorized).
    /// </summary>
    public static class CspHelper
    {
        private static byte[] GetNonceBytes()
        {
            byte[] bytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(bytes);
            return bytes;
        }

        /// <summary>
        /// Generates a URL-safe, nonce value for use in CSP and in nonce attributes.
        /// </summary>
        public static string GenerateNonce()
        {
            string nonce = Convert.ToBase64String(GetNonceBytes());
            return nonce.TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }

        /// <summary>
        /// Builds a strict CSP header for pages with no scripts (e.g. Error, NotAuthorized).
        /// style-src allows 'self' and the given nonce for inline &lt;style&gt; tags.
        /// </summary>
        public static string BuildCspNoScript(string nonce)
        {
            return "default-src 'self'; script-src 'none'; style-src 'self' 'nonce-" + nonce + "'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests;";
        }

        /// <summary>
        /// Builds CSP header for pages with scripts (e.g. Login).
        /// script-src and style-src allow 'self' and the given nonce.
        /// </summary>
        public static string BuildCspWithScript(string nonce)
        {
            return BuildCspWithScript(nonce, null);
        }

        /// <summary>
        /// Builds CSP header for pages with scripts that call external APIs (e.g. Login).
        /// additionalConnectSrcOrigins: extra origins for connect-src (e.g. API base URL like "http://localhost:54659").
        /// </summary>
        public static string BuildCspWithScript(string nonce, string[] additionalConnectSrcOrigins)
        {
            string connectSrc = "'self'";
            if (additionalConnectSrcOrigins != null && additionalConnectSrcOrigins.Length > 0)
            {
                foreach (string origin in additionalConnectSrcOrigins)
                {
                    if (!string.IsNullOrWhiteSpace(origin))
                        connectSrc += " " + origin.Trim();
                }
            }
            return "default-src 'self'; script-src 'self' 'nonce-" + nonce + "'; style-src 'self' 'nonce-" + nonce + "'; img-src 'self' data:; font-src 'self'; connect-src " + connectSrc + "; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests;";
        }
    }
}
