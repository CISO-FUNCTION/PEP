using System;
using System.Linq;
using System.Web.Http;
using EmpPEP.WebApi.Models;
using EmpPEP.WebApi.Providers;
using Microsoft.AspNet.Identity;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Owin;
using PEPApi;
using PEPApi.App_Start;

[assembly: OwinStartup(typeof(EmpPEP.WebApi.Startup))]

namespace EmpPEP.WebApi
{
    public partial class Startup
    {
        public static OAuthAuthorizationServerOptions OAuthAuthorizationServerOptions { get; private set; }

        public void Configuration(IAppBuilder app)
        {

            var myProvider = new MyAuthorizationServerProvider();

            OAuthAuthorizationServerOptions = new OAuthAuthorizationServerOptions
            {
                AllowInsecureHttp = true,
                TokenEndpointPath = new PathString("/token"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                Provider = myProvider
            };

            app.Use<TokenValidationMiddleware>(); // Add Middleware for Token Validation

            app.UseOAuthAuthorizationServer(OAuthAuthorizationServerOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());

            HttpConfiguration config = new HttpConfiguration();
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));
            WebApiConfig.Register(config);

        }
    }
}
