using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace EmpPEP.Framework.Helper
{
    public class Utility
    {
        public static List<T2> ConvertToList<T1, T2>(List<T1> lstSource)
            where T1 : class, new()
            where T2 : class, new()
        {
            List<T2> listTarget = new List<T2>(lstSource.Count);
            foreach (var item in lstSource)
            {
                T2 objTarget = new T2();
                objTarget = (T2)Utility.ConvertToObject(item, objTarget);
                listTarget.Add(objTarget);
            }
            return listTarget;
        }

        public static object ConvertToObject(object source, object target)
        {
            //find the list of properties in the source object
            Type sourceType = source.GetType();
            IList<PropertyInfo> sourcePropertyList =
              new List<PropertyInfo>(sourceType.GetProperties());
            //find the list of properties present in the target/destination 

            Type targetType = target.GetType();
            IList<PropertyInfo> targetPropertyList =
               new List<PropertyInfo>(targetType.GetProperties());
            //assign value of source object property to the target object.

            foreach (PropertyInfo propertyTarget in targetPropertyList)
            {
                PropertyInfo property = null;
                //find the property which is present in the target object.

                foreach (PropertyInfo propertySource in sourcePropertyList)
                {
                    //if find the property store it
                    if (propertySource.Name == propertyTarget.Name)
                    {
                        property = propertySource;
                        break;
                    }
                }
                //if target property exists in the source
                if (property != null)
                {
                    // take value of source
                    object value = property.GetValue(source, null);
                    //assign it into the target property 
                    propertyTarget.SetValue(target, value, null);
                }
            }
            return target;
        }

        /// <summary>
        /// True when <c>Environment</c> in Web.config is production (<c>Production</c> or <c>Prod</c>).
        /// All other values (e.g. Local, Development, Dev, Test, Staging) are treated as non-production for mail routing.
        /// </summary>
        public static bool IsProductionEnvironment()
        {
            var env = (ConfigurationManager.AppSettings["Environment"] ?? string.Empty).Trim();
            return env.Equals("Production", StringComparison.OrdinalIgnoreCase)
                || env.Equals("Prod", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Legacy name: true when not in production (mail may still go to real recipients if <c>OverrideMailToTest</c> is empty).
        /// Prefer <see cref="IsProductionEnvironment"/> or <see cref="ShouldSendMailOnlyToOverrideRecipients"/>.
        /// </summary>
        public static bool ShouldRedirectAllMailToTest()
        {
            return !IsProductionEnvironment();
        }

        /// <summary>
        /// When true, <see cref="SendMail"/> replaces To/CC/Bcc with <c>OverrideMailToTest</c> (semicolon/comma separated).
        /// Rules: non-production <c>Environment</c> + non-empty <c>OverrideMailToTest</c>.
        /// Production <c>Environment</c> always uses real recipients.
        /// Set <c>UseRealMailRecipients</c> = true to force real recipients even in non-production (optional safety for test servers).
        /// </summary>
        public static bool ShouldSendMailOnlyToOverrideRecipients()
        {
            var useReal = ConfigurationManager.AppSettings["UseRealMailRecipients"];
            if (string.Equals(useReal?.Trim(), "true", StringComparison.OrdinalIgnoreCase) || useReal?.Trim() == "1")
                return false;

            if (IsProductionEnvironment())
                return false;

            var overrideToTest = ConfigurationManager.AppSettings["OverrideMailToTest"];
            if (string.IsNullOrWhiteSpace(overrideToTest))
                return false;

            return true;
        }

        public static void SendMail(MailMessage mailmsg)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            string password = ConfigurationManager.AppSettings["Password"] ?? ConfigurationManager.AppSettings["MailPassword"];
            string host = ConfigurationManager.AppSettings["MailHost"];
            string userName = ConfigurationManager.AppSettings["UserName"];
            string portSetting = ConfigurationManager.AppSettings["Port"] ?? ConfigurationManager.AppSettings["smtp_port"];
            int port = int.TryParse(portSetting, out int p) ? p : 587;
            string domain = ConfigurationManager.AppSettings["Domain"];

            var credentials = string.IsNullOrEmpty(domain)
                ? new NetworkCredential(userName, password)
                : new NetworkCredential(userName, password, domain);

            var smtp = new SmtpClient
            {
                Host = host,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = credentials,
                Port = port,
                EnableSsl = true,
            };

            try
            {
                MailMessage message = mailmsg;

                // Non-production Environment: send only to OverrideMailToTest when configured. See ShouldSendMailOnlyToOverrideRecipients.
                string overrideToTest = ConfigurationManager.AppSettings["OverrideMailToTest"];
                if (ShouldSendMailOnlyToOverrideRecipients())
                {
                    message.To.Clear();
                    message.CC.Clear();
                    message.Bcc.Clear();
                    foreach (var addr in overrideToTest.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        var a = addr.Trim();
                        if (!string.IsNullOrEmpty(a)) message.To.Add(a);
                    }
                }

                smtp.Send(message);
            }
            catch (Exception e)
            {
                // Consider logging: System.Diagnostics.Debug.WriteLine(e.Message);
                throw;
            }
        }
    }
}
