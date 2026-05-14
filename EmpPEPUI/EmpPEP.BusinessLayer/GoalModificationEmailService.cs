using EmpPEP.BusinessEntity;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Net;
using System.Net.Mail;
using System.Configuration;

namespace EmpPEP.BusinessLayer
{
    /// <summary>
    /// Centralized email service for Goal Modification notifications
    /// </summary>
    public class GoalModificationEmailService
    {
        private readonly string smtpHost;
        private readonly int smtpPort;
        private readonly string smtpUsername;
        private readonly string smtpPassword;
        private readonly bool enableSsl;
        private readonly string fromEmail;
        private readonly string fromDisplayName;

        public GoalModificationEmailService()
        {
            // Read SMTP configuration from web.config/app.config
            smtpHost = ConfigurationManager.AppSettings["SMTPHost"] ?? "smtp.office365.com";
            smtpPort = int.Parse(ConfigurationManager.AppSettings["SMTPPort"] ?? "587");
            smtpUsername = ConfigurationManager.AppSettings["SMTPUsername"] ?? "";
            smtpPassword = ConfigurationManager.AppSettings["SMTPPassword"] ?? "";
            enableSsl = bool.Parse(ConfigurationManager.AppSettings["EnableSSL"] ?? "true");
            fromEmail = ConfigurationManager.AppSettings["FromEmail"] ?? "IPAG.ID@infogain.com";
            fromDisplayName = ConfigurationManager.AppSettings["FromDisplayName"] ?? "IPAG";
            //fromEmail = ConfigurationManager.AppSettings["FromEmail"] ?? "PEPSystem@infogain.com";
            //fromDisplayName = ConfigurationManager.AppSettings["FromDisplayName"] ?? "PEP";
        }

        /// <summary>
        /// Send email notification for goal modification events
        /// </summary>
        /// <param name="requestId">Goal modification request ID</param>
        /// <param name="eventId">Event ID (60=Raised, 61=Approved, 62=Rejected)</param>
        /// <returns>True if email sent successfully</returns>
        public bool SendNotification(int requestId, int eventId)
        {
            try
            {
                // Get email details from stored procedure
                GoalModificationEmailDetailsResult emailDetails;
                using (var repository = new GoalModificationRequestRepository())
                {
                    emailDetails = repository.GetEmailDetails(requestId, eventId);
                }

                if (emailDetails == null || emailDetails.Success == 0)
                {
                    Console.WriteLine("Failed to get email details from database");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(emailDetails.ToEmail))
                {
                    Console.WriteLine("ToEmail is null or empty");
                    return false;
                }

                // Validate email body is not empty
                if (string.IsNullOrWhiteSpace(emailDetails.Body))
                {
                    Console.WriteLine($"Email body is empty for RequestId: {requestId}, EventId: {eventId}");
                    Console.WriteLine($"Subject: {emailDetails.Subject ?? "NULL"}");
                    Console.WriteLine($"ToEmail: {emailDetails.ToEmail ?? "NULL"}");
                    Console.WriteLine($"EmployeeName: {emailDetails.EmployeeName ?? "NULL"}");
                    Console.WriteLine($"ManagerName: {emailDetails.ManagerName ?? "NULL"}");
                    
                    // Log error but don't fail - this helps identify the root cause
                    // The stored procedure should be fixed to return the Body from EmailTemplateMaster
                    return false;
                }

                // Send the email
                return SendEmail(
                    emailDetails.ToEmail,
                    emailDetails.CcEmail,
                    emailDetails.Subject,
                    emailDetails.Body
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending goal modification email: {ex.Message}");
                // Log exception here
                return false;
            }
        }

        /// <summary>
        /// Send email using SMTP
        /// </summary>
        private bool SendEmail(string toEmail, string ccEmail, string subject, string body)
        {
            try
            {
                using (var message = new MailMessage())
                {
                    message.From = new MailAddress(fromEmail, fromDisplayName);
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;

                    // Add TO recipients
                    if (!string.IsNullOrWhiteSpace(toEmail))
                    {
                        foreach (var email in toEmail.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries))
                        {
                            var trimmedEmail = email.Trim();
                            if (!string.IsNullOrWhiteSpace(trimmedEmail))
                            {
                                message.To.Add(trimmedEmail);
                            }
                        }
                    }

                    // Add CC recipients
                    if (!string.IsNullOrWhiteSpace(ccEmail))
                    {
                        foreach (var email in ccEmail.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries))
                        {
                            var trimmedEmail = email.Trim();
                            if (!string.IsNullOrWhiteSpace(trimmedEmail))
                            {
                                message.CC.Add(trimmedEmail);
                            }
                        }
                    }

                    // Validate that we have at least one recipient
                    if (message.To.Count == 0)
                    {
                        Console.WriteLine("No valid recipients found");
                        return false;
                    }

                    // Use Utility.SendMail for Goal Modification emails
                    try
                    {
                        Utility.SendMail(message);
                        Console.WriteLine($"Email sent successfully to: {toEmail}");
                        return true;
                    }
                    catch (Exception mailEx)
                    {
                        Console.WriteLine($"Error in Utility.SendMail: {mailEx.Message}");
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        /// <summary>
        /// Send notification when employee raises a goal modification request
        /// </summary>
        public bool SendRequestRaisedNotification(int requestId)
        {
            return SendNotification(requestId, GoalModificationEmailEvents.RequestRaised);
        }

        /// <summary>
        /// Send notification when manager approves the request
        /// </summary>
        public bool SendRequestApprovedNotification(int requestId)
        {
            return SendNotification(requestId, GoalModificationEmailEvents.RequestApproved);
        }

        /// <summary>
        /// Send notification when manager rejects the request
        /// </summary>
        public bool SendRequestRejectedNotification(int requestId)
        {
            return SendNotification(requestId, GoalModificationEmailEvents.RequestRejected);
        }
    }
}
