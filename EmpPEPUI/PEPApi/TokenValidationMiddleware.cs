using Microsoft.Owin;
using System;
using System.IdentityModel.Tokens;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Owin.Security.OAuth;
using System.Linq;
using System.Collections.Generic;

namespace EmpPEP.WebApi
{
    public class TokenValidationMiddleware : OwinMiddleware
    {
        public TokenValidationMiddleware(OwinMiddleware next) : base(next) { }

        public override async Task Invoke(IOwinContext context)
        {
            var token = context.Request.Headers["Authorization"]?.Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token))
            {
                var isValid = ValidateToken(token);

                if (!isValid)
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    await context.Response.WriteAsync("Invalid or expired token.");
                    return;
                }
            }

            await Next.Invoke(context);
        }

        //private bool ValidateToken(string token)
        //{
        //    try
        //    {
        //        var ticket = Startup.OAuthAuthorizationServerOptions.AccessTokenFormat.Unprotect(token);

        //        if (ticket == null || ticket.Properties.ExpiresUtc <= DateTime.UtcNow)
        //        {
        //            return false; // Token expired or invalid
        //        }

        //        return true; // Token is valid
        //    }
        //    catch (Exception)
        //    {
        //        return false;
        //    }
        //}

        private static readonly Dictionary<string, DateTime> LogoutTimestamps = new Dictionary<string, DateTime>();

        public static void LogoutUser(string userId)
        {
            LogoutTimestamps[userId] = DateTime.UtcNow;
        }

        private bool ValidateToken(string token)
        {
            try
            {
                var ticket = Startup.OAuthAuthorizationServerOptions.AccessTokenFormat.Unprotect(token);

                if (ticket == null || ticket.Properties.ExpiresUtc <= DateTime.UtcNow)
                {
                    return false; // Token expired or invalid
                }

                var userId = ticket.Identity.FindFirst(ClaimTypes.Name)?.Value;

                if (LogoutTimestamps.TryGetValue(userId, out var logoutTime) && ticket.Properties.IssuedUtc <= logoutTime)
                {
                    return false; // Token was issued before logout
                }

                return true;
            }
            catch (Exception)
            {
                return false;
            }


        }
    }
}