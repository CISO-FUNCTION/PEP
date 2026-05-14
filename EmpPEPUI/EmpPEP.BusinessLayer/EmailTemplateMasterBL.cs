using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Configuration;
using System.Net.Mail;
using System.Text.RegularExpressions;
namespace EmpPEP.BusinessLayer
{
    public class EmailTemplateMasterBL
    {

        #region "Public Methods"
        public EmailTemplateMasterEntity Get(int id)
        {
            using (var emailTemplateRepository = new EmailTemplateRepository())
            {
                var template = emailTemplateRepository.Get(id);
                if (template == null)
                    return new EmailTemplateMasterEntity();
                return (EmailTemplateMasterEntity)Utility.ConvertToObject(template, new EmailTemplateMasterEntity());
            }
        }

        public EmailTemplateMasterEntity GetByEventId(int eventId)
        {
            using (var emailTemplateRepository = new EmailTemplateRepository())
            {
                EmailTemplateMaster template = emailTemplateRepository.GetByEventId(eventId);
                if (template != null)
                {
                    EmailTemplateMasterEntity emailTemplateMasterEntity = (EmailTemplateMasterEntity)Utility.ConvertToObject(template, new EmailTemplateMasterEntity());
                    return emailTemplateMasterEntity;
                }
                return null;
            }
        }

        public bool Put(EmailTemplateMasterEntity emailTemplateMasterEntity)
        {
            using (var emailTemplateRepository = new EmailTemplateRepository())
            {
                EmailTemplateMaster EmailTemplateMaster = emailTemplateRepository.Get(emailTemplateMasterEntity.EmailTemplateId);
                if (EmailTemplateMaster != null)
                {
                    EmailTemplateMaster.Body = emailTemplateMasterEntity.Body;
                    return emailTemplateRepository.Update(EmailTemplateMaster);
                }
                return false;
            }
        }
        public int sendMailToKRADefaulter(string EmailIds)
        {
            EmailTemplateMasterEntity emailTemplateMasterEntity = Get(1);
            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();



            MailMessage message = new MailMessage(fromaddress, EmailIds);

            message.Subject = emailTemplateMasterEntity.Subject;
            message.Body = emailTemplateMasterEntity.Body;
            message.IsBodyHtml = true;
            Utility.SendMail(message);
            return 1;
        }

        public void sendMailToNextRMForinpurating(string EmailIds)
        {
            EmailTemplateMasterEntity emailTemplateMasterEntity = Get(1);
            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();


            MailMessage message = new MailMessage(fromaddress, EmailIds);

            message.Subject = emailTemplateMasterEntity.Subject;
            message.Body = emailTemplateMasterEntity.Body;
            message.IsBodyHtml = true;
            Utility.SendMail(message);
            //  return 1;
        }
        public string HumanisedDate(DateTime date)
        {
            string ordinal;

            switch (date.Day)
            {
                case 1:
                case 21:
                case 31:
                    ordinal = "st";
                    break;
                case 2:
                case 22:
                    ordinal = "nd";
                    break;
                case 3:
                case 23:
                    ordinal = "rd";
                    break;
                default:
                    ordinal = "th";
                    break;
            }

            return string.Format("{0:dddd dd}{1} {0:MMMM yyyy}", date, ordinal);
        }
        public void Sendsms(string body, string number)
        {
            using (var web = new System.Net.WebClient())
            {
                try
                {
                    string msgText = " PEP ALERT \n\n";

                    msgText = msgText + body;

                    string userName = "igtraveldesk";
                    string userPassword = "11829574";
                    string msgRecepient = number;
                    // msgText = "test";
                    String postData = "";
                    String retval = "";


                    String sid = "INFOTS";
                    String mtype = "N";
                    String DR = "Y";
                    //  postData += "http://smscountry.com/SMSCwebservice_Bulk.aspx?" + "User=" + System.Web.HttpUtility.UrlEncode(userName, System.Text.Encoding.GetEncoding("UTF-8")) + "&passwd=" + userPassword + "&mobilenumber=" + msgRecepient + "&message=" + System.Web.HttpUtility.UrlEncode(msgText, System.Text.Encoding.GetEncoding("UTF-8")) + "&sid=" + sid + "&mtype=" + mtype + "&DR=" + DR;

                    string result = web.DownloadString(postData);

                }
                catch (Exception ex)
                {
                    //Catch and show the exception if needed. Donot supress. :)  

                }
            }
        }

        public int sendMailToAcknowBC(int ToEmployeeId, int FromEmployeeId, int actionTypeId)
        {
            //var array = EmailIds.Split(',');
            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
            GetEmpDetailsByEmpId_ResultEntity ToEmployeeDetails = employeeMasterBL.GetEmployeeDetails(ToEmployeeId);
            GetEmpDetailsByEmpId_ResultEntity FromEmployeeDetails = employeeMasterBL.GetEmployeeDetails(FromEmployeeId);
            EmailTemplateMasterEntity emailTemplateMasterEntity = new EmailTemplateMasterEntity();
            string number = employeeMasterBL.GetEmployeeNumber(ToEmployeeDetails.OldEmployeeCode);
            if (actionTypeId == 3)
            {
                emailTemplateMasterEntity = Get(7);
            }
            else
            {
                emailTemplateMasterEntity = Get(5);
            }
            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();

            string ToEmployeeName = ToEmployeeDetails.FirstName + " " + ToEmployeeDetails.LastName;
            string FromEmployeeName = FromEmployeeDetails.FirstName + " " + FromEmployeeDetails.LastName;
            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#EmployeeName#", ToEmployeeName);
            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#Fromfeedback#", FromEmployeeName);
            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#Date#", DateTime.Now.ToString("dd-MMM-yyyy"));
            //string myDateString = HumanisedDate(DateTime.Now);

            // MailMessage message = new MailMessage( fromaddress,ToEmployeeDetails.EmailAddress);


            //message.Subject = emailTemplateMasterEntity.Subject;
            //message.Body = emailTemplateMasterEntity.Body;
            //message.IsBodyHtml = true;
            MailAddress mailAddrFrom = new MailAddress(fromaddress, "Performance Enhancement Process");

            MailAddressCollection mailAddrToColl = new MailAddressCollection();
            mailAddrToColl.Add(ToEmployeeDetails.EmailAddress);
            mailAddrToColl.Add(FromEmployeeDetails.EmailAddress);


            MailMessage msg = new MailMessage();

            //msg.To.Add("kaushal.saini@infogain.com;leena.jacob@infogain.com");
            //msg.To.Add("kaushal.saini@infogain.com;leena.jacob@infogain.com");
            msg.To.Add(mailAddrToColl[0].ToString());
            msg.CC.Add(mailAddrToColl[1].ToString());


            msg.From = mailAddrFrom;

            msg.Subject = emailTemplateMasterEntity.Subject;
            msg.Body = emailTemplateMasterEntity.Body;
            msg.IsBodyHtml = true;


            Utility.SendMail(msg);
            if (actionTypeId == 1)
            {
                using (var appraisalcycle = new AppraisalCycleRepository())
                {
                    AppraisalCycleMaster appraisalMaster = appraisalcycle.GetCurrentCycle();

                    bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, FromEmployeeId, appraisalMaster.AppraisalCycleId);
                    if (IsCurrentManager)
                    {
                        string str = msg.Body.Replace("<br/>", "\n");
                        string str1 = str.Replace("<br />", "\n");
                        string msgalert = Regex.Replace(str1, "<.*?>", String.Empty);
                        string message = msgalert.Remove(msgalert.IndexOf('*'));

                        // Sendsms(message, number);
                    }
                }
            }
            return 1;
        }

        public int sendMailToAcknowBC(int ToEmployeeId, int FromEmployeeId, int EmployeeManagerId, int actionTypeId, int MailType)
        {
            //var array = EmailIds.Split(',');
            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
            GetEmpDetailsByEmpId_ResultEntity ToEmployeeDetails = employeeMasterBL.GetEmployeeDetails(ToEmployeeId);
            GetEmpDetailsByEmpId_ResultEntity FromEmployeeDetails = employeeMasterBL.GetEmployeeDetails(FromEmployeeId);
            GetEmpDetailsByEmpId_ResultEntity ManagerEmployeeDetails = employeeMasterBL.GetEmployeeDetails(EmployeeManagerId);
            EmailTemplateMasterEntity emailTemplateMasterEntity = new EmailTemplateMasterEntity();
            string number = employeeMasterBL.GetEmployeeNumber(ToEmployeeDetails.OldEmployeeCode);
            if (actionTypeId == 3)
            {
                emailTemplateMasterEntity = Get(7);
            }
            else
            {
                emailTemplateMasterEntity = Get(5);
            }
            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();

            string ToEmployeeName = ToEmployeeDetails.FirstName + " " + ToEmployeeDetails.LastName;
            string FromEmployeeName = FromEmployeeDetails.FirstName + " " + FromEmployeeDetails.LastName;
            string ManagerEmployeeName = ManagerEmployeeDetails.FirstName + " " + ManagerEmployeeDetails.LastName;

            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#EmployeeName#", ToEmployeeName);
            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#Fromfeedback#", FromEmployeeName);
            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#Date#", DateTime.Now.ToString("dd-MMM-yyyy"));
            //string myDateString = HumanisedDate(DateTime.Now);

            // MailMessage message = new MailMessage( fromaddress,ToEmployeeDetails.EmailAddress);


            //message.Subject = emailTemplateMasterEntity.Subject;
            //message.Body = emailTemplateMasterEntity.Body;
            //message.IsBodyHtml = true;
            MailAddress mailAddrFrom = new MailAddress(fromaddress, "Performance Enhancement Process");

            MailAddressCollection mailAddrToColl = new MailAddressCollection();

            mailAddrToColl.Add(ToEmployeeDetails.EmailAddress);
            mailAddrToColl.Add(FromEmployeeDetails.EmailAddress);
            mailAddrToColl.Add(ManagerEmployeeDetails.EmailAddress);

            MailMessage msg = new MailMessage();
            if (MailType == 1)
            {
                msg.To.Add(mailAddrToColl[0].ToString());
                msg.CC.Add(mailAddrToColl[1].ToString());

            }
            else
            {
                if (EmployeeManagerId == 1331)
                {
                    msg.To.Add(mailAddrToColl[0].ToString());
                    msg.CC.Add(mailAddrToColl[1].ToString());
                }
                else
                {
                    msg.To.Add(mailAddrToColl[0].ToString());
                    msg.CC.Add(mailAddrToColl[1].ToString());
                    msg.CC.Add(mailAddrToColl[2].ToString());
                }
            }


            msg.From = mailAddrFrom;

            msg.Subject = emailTemplateMasterEntity.Subject;
            msg.Body = emailTemplateMasterEntity.Body;
            msg.IsBodyHtml = true;


            Utility.SendMail(msg);
            if (actionTypeId == 1)
            {
                using (var appraisalcycle = new AppraisalCycleRepository())
                {
                    AppraisalCycleMaster appraisalMaster = appraisalcycle.GetCurrentCycle();

                    bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, FromEmployeeId, appraisalMaster.AppraisalCycleId);
                    if (IsCurrentManager)
                    {
                        string str = msg.Body.Replace("<br/>", "\n");
                        string str1 = str.Replace("<br />", "\n");
                        string msgalert = Regex.Replace(str1, "<.*?>", String.Empty);
                        string message = msgalert.Remove(msgalert.IndexOf('*'));

                        // Sendsms(message, number);
                    }
                }
            }
            return 1;
        }
        public int sendMailToAcknowBC(int ToEmployeeId, int FromEmployeeId, int EmployeeManagerId, int? actionTypeId, string feedback, int? MailType)
        {
            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
            GetEmpDetailsByEmpId_ResultEntity ToEmployeeDetails = employeeMasterBL.GetEmployeeDetails(ToEmployeeId);
            GetEmpDetailsByEmpId_ResultEntity FromEmployeeDetails = employeeMasterBL.GetEmployeeDetails(FromEmployeeId);
            // Third parameter is reporting-manager id for CC (not a FeedBack row id). Skip lookup when 0/invalid.
            GetEmpDetailsByEmpId_ResultEntity ManagerEmployeeDetails = (EmployeeManagerId > 0)
                ? employeeMasterBL.GetEmployeeDetails(EmployeeManagerId)
                : null;

            if (ToEmployeeDetails == null || FromEmployeeDetails == null)
                return 0;

            // postEmailfeedback passes StatusID as MailType. Only 1 = legacy To + single CC; null/0/2/5/etc. use flexible MailType-5 path (fixes clients that send StatusID 2).
            int? effectiveMailType = MailType;
            if (actionTypeId == 5 && effectiveMailType != 1)
                effectiveMailType = 5;

            EmailTemplateMasterEntity emailTemplateMasterEntity = new EmailTemplateMasterEntity();
            string number = employeeMasterBL.GetEmployeeNumber(ToEmployeeDetails.OldEmployeeCode);
            if (actionTypeId == 5)
            {
                emailTemplateMasterEntity = LoadFeedbackReplyEmailTemplate();
            }
            else if (actionTypeId == 3)
            {
                emailTemplateMasterEntity = Get(7);
            }
            else
            {
                emailTemplateMasterEntity = Get(5);
            }

            if (emailTemplateMasterEntity == null || string.IsNullOrWhiteSpace(emailTemplateMasterEntity.Body))
                emailTemplateMasterEntity = Get(1);
            if ((emailTemplateMasterEntity == null || string.IsNullOrWhiteSpace(emailTemplateMasterEntity.Body)) && actionTypeId == 5)
                emailTemplateMasterEntity = LoadFeedbackReplyEmailTemplate();
            if (emailTemplateMasterEntity == null || string.IsNullOrWhiteSpace(emailTemplateMasterEntity.Body))
                return 0;

            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"];
            if (string.IsNullOrWhiteSpace(fromaddress))
                fromaddress = "noreply@localhost";

            string ToEmployeeName = FormatDisplayName(ToEmployeeDetails.FirstName, ToEmployeeDetails.LastName);
            string FromEmployeeName = FormatDisplayName(FromEmployeeDetails.FirstName, FromEmployeeDetails.LastName);

            emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body
                .Replace("#EmployeeName#", ToEmployeeName)
                .Replace("#Fromfeedback#", FromEmployeeName)
                .Replace("#Date#", DateTime.Now.ToString("dd-MMM-yyyy"))
                .Replace("#Givenfeedback#", feedback ?? string.Empty);

            MailAddress mailAddrFrom = new MailAddress(fromaddress, "Performance Enhancement Process");

            MailAddressCollection mailAddrToColl = new MailAddressCollection();
            if (effectiveMailType == 5)
            {
                TryAddMailAddress(mailAddrToColl, ToEmployeeDetails.EmailAddress);
                TryAddMailAddress(mailAddrToColl, FromEmployeeDetails.EmailAddress);

                // Prefer explicit RM id (e.g. skip-level / original RM) when client sends it; else resolve from reply recipient (e.g. delegator).
                if (ManagerEmployeeDetails != null && ManagerEmployeeDetails.EmployeeId > 0 && !string.IsNullOrWhiteSpace(ManagerEmployeeDetails.EmailAddress))
                {
                    TryAddMailAddress(mailAddrToColl, ManagerEmployeeDetails.EmailAddress);
                }
                else
                {
                    GetEmpDetailsByEmpId_ResultEntity empManagerDetails = employeeMasterBL.GetEmployeeManagerDetail(ToEmployeeDetails.EmployeeId);
                    if (empManagerDetails != null && empManagerDetails.EmployeeId > 0)
                    {
                        GetEmpDetailsByEmpId_ResultEntity managerEmailDetails = employeeMasterBL.GetEmployeeDetails(empManagerDetails.EmployeeId);
                        if (managerEmailDetails != null)
                            TryAddMailAddress(mailAddrToColl, managerEmailDetails.EmailAddress);
                    }
                }
            }
            else
            {
                TryAddMailAddress(mailAddrToColl, ToEmployeeDetails.EmailAddress);
                TryAddMailAddress(mailAddrToColl, FromEmployeeDetails.EmailAddress);
                if (ManagerEmployeeDetails != null)
                    TryAddMailAddress(mailAddrToColl, ManagerEmployeeDetails.EmailAddress);
            }

            // Non-production: if no valid To/CC from employees (missing EmailAddress in DB), fall back to OverrideMailToTest then PEPMailAddress so postEmailfeedback does not return "No data found".
            if (mailAddrToColl.Count == 0 && !Utility.IsProductionEnvironment())
            {
                var useRealOnly = ConfigurationManager.AppSettings["UseRealMailRecipients"];
                var forceReal = string.Equals(useRealOnly?.Trim(), "true", StringComparison.OrdinalIgnoreCase) || useRealOnly?.Trim() == "1";
                if (!forceReal)
                {
                    var overrideList = ConfigurationManager.AppSettings["OverrideMailToTest"];
                    if (!string.IsNullOrWhiteSpace(overrideList))
                    {
                        foreach (var part in overrideList.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries))
                            TryAddMailAddress(mailAddrToColl, part.Trim());
                    }
                    if (mailAddrToColl.Count == 0 && !string.IsNullOrWhiteSpace(fromaddress))
                        TryAddMailAddress(mailAddrToColl, fromaddress.Trim());
                }
            }

            if (mailAddrToColl.Count == 0)
                return 0;

            MailMessage msg = new MailMessage();
            if (effectiveMailType == 1)
            {
                if (mailAddrToColl.Count < 2)
                    return 0;
                msg.To.Add(mailAddrToColl[0].Address);
                msg.CC.Add(mailAddrToColl[1].Address);
            }
            else if (effectiveMailType == 5)
            {
                // Need at least one recipient; two preferred (To + CC). Same email may dedupe to one entry — still send.
                if (mailAddrToColl.Count == 0)
                    return 0;
                if (mailAddrToColl.Count >= 2)
                {
                    msg.To.Add(mailAddrToColl[0].Address);
                    msg.CC.Add(mailAddrToColl[1].Address);
                    if (mailAddrToColl.Count > 2)
                        msg.CC.Add(mailAddrToColl[2].Address);
                }
                else
                {
                    msg.To.Add(mailAddrToColl[0].Address);
                }
            }
            else
            {
                if (mailAddrToColl.Count < 2)
                    return 0;
                if (EmployeeManagerId == 1331)
                {
                    msg.To.Add(mailAddrToColl[0].Address);
                    msg.CC.Add(mailAddrToColl[1].Address);
                }
                else
                {
                    msg.To.Add(mailAddrToColl[0].Address);
                    msg.CC.Add(mailAddrToColl[1].Address);
                    if (mailAddrToColl.Count > 2)
                        msg.CC.Add(mailAddrToColl[2].Address);
                }
            }

            msg.From = mailAddrFrom;
            msg.Subject = emailTemplateMasterEntity.Subject ?? string.Empty;
            msg.Body = emailTemplateMasterEntity.Body;
            msg.IsBodyHtml = true;

            // When Environment is not Production and OverrideMailToTest is set, Utility.SendMail redirects recipients (see Utility.ShouldSendMailOnlyToOverrideRecipients).
            Utility.SendMail(msg);

            if (actionTypeId == 5)
            {
                using (var appraisalcycle = new AppraisalCycleRepository())
                {
                    AppraisalCycleMaster appraisalMaster = appraisalcycle.GetCurrentCycle();
                    if (appraisalMaster != null)
                    {
                        bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, FromEmployeeId, appraisalMaster.AppraisalCycleId);
                        if (IsCurrentManager && !string.IsNullOrEmpty(number))
                        {
                            string str = msg.Body.Replace("<br/>", "\n");
                            string str1 = str.Replace("<br />", "\n");
                            string msgalert = Regex.Replace(str1, "<.*?>", String.Empty);
                            int idx = msgalert.IndexOf('*');
                            if (idx > 0)
                            {
                                string message = msgalert.Remove(idx);
                                // Sendsms(message, number);
                            }
                        }
                    }
                }
            }
            return 1;
        }
        /// <summary>
        /// Replaces organization-specific placeholders in email body with dynamic values from GlobalAppConfig
        /// </summary>
        /// <param name="emailBody">The email body with placeholders</param>
        /// <returns>Email body with replaced values</returns>
        public string ReplaceOrgPlaceholders(string emailBody)
        {
            try
            {
                GlobalAppConfigBL configBL = new GlobalAppConfigBL();

                // Get the organization account name from GlobalAppConfig
                string orgAccountName = configBL.GetConfigValue("ORG_SHORT_NAME");

                // Get the organization URL/domain from GlobalAppConfig
                string orgUrl = configBL.GetConfigValue("Pep_URL");

                if (!string.IsNullOrEmpty(orgAccountName))
                {
                    // Replace "Infogain" (case-insensitive) with the dynamic org account name
                    emailBody = Regex.Replace(emailBody, @"\bInfogain\b", orgAccountName, RegexOptions.IgnoreCase);
                }

                if (!string.IsNullOrEmpty(orgUrl))
                {
                    // Replace URLs like "pep.infogain.com" or "https://pep.infogain.com"
                    // This will match both with and without protocol (http/https)
                    emailBody = Regex.Replace(emailBody, @"(https?://)?pep\.infogain\.com", orgUrl, RegexOptions.IgnoreCase);

                    // Also replace email domains like "infogain.com" in email addresses eg=support@infogain.com
                    emailBody = Regex.Replace(emailBody, @"@infogain\.com\b", "@" + orgUrl.Replace("pep.", "").Replace("https://", "").Replace("http://", ""), RegexOptions.IgnoreCase);
                }

                return emailBody;
            }
            catch (Exception ex)
            {
                // Log the error if needed, but return original body to avoid breaking email functionality
                 //ExceptionLogging.SendExcepToDB(ex, "EmailTemplateMasterBL", "ReplaceOrgPlaceholders");
                return emailBody;
            }
        }
        #endregion

        private static string FormatDisplayName(string firstName, string lastName)
        {
            return ((firstName ?? string.Empty).Trim() + " " + (lastName ?? string.Empty).Trim()).Trim();
        }

        private static void TryAddMailAddress(MailAddressCollection coll, string email)
        {
            if (coll == null || string.IsNullOrWhiteSpace(email))
                return;
            try
            {
                coll.Add(email.Trim());
            }
            catch
            {
                // ignore invalid address
            }
        }

        /// <summary>
        /// Feedback reply mail: prefer template 9, then 5, then 1; built-in HTML if DB templates are empty.
        /// </summary>
        private EmailTemplateMasterEntity LoadFeedbackReplyEmailTemplate()
        {
            foreach (var templateId in new[] { 9, 5, 1 })
            {
                var t = Get(templateId);
                if (t != null && !string.IsNullOrWhiteSpace(t.Body))
                    return t;
            }

            return new EmailTemplateMasterEntity
            {
                EmailTemplateId = 0,
                Subject = "PEP – Feedback reply",
                Body = "<p>Hello #EmployeeName#,</p><p>#Fromfeedback# replied on #Date#.</p><p><strong>Message:</strong></p><p>#Givenfeedback#</p>"
            };
        }
    }
}
