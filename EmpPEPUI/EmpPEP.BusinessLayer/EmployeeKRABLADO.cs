using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Configuration;
using System.Net.Mail;

namespace EmpPEP.BusinessLayer
{
    /// <summary>
    /// EmployeeKRA Business Layer using pure ADO.NET (no Entity Framework)
    /// All operations use stored procedures and DataSets
    /// </summary>
    public class EmployeeKRABLADO
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeKRABLADO));
        private string sectionName = "EmployeeKRABLADO";

        /// <summary>Developmental goals use single-letter "D" in DB/UI; tolerate full word.</summary>
        public static bool IsDevelopmentalGoalType(string goalType)
        {
            if (string.IsNullOrWhiteSpace(goalType)) return false;
            var g = goalType.Trim();
            return string.Equals(g, "D", StringComparison.OrdinalIgnoreCase)
                || string.Equals(g, "DEVELOPMENTAL", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Training fields apply only to Developmental goals. For other types, force empty strings so
        /// <c>usp_UpdateEmployeeKRA</c> overwrites existing values (NULL parameters are treated as no-change in the SP).
        /// </summary>
        public static void NormalizeTrainingFieldsForGoalType(EmployeeKRAEntity entity)
        {
            if (entity == null || IsDevelopmentalGoalType(entity.GoalType)) return;
            entity.TrainingItemId = string.Empty;
            entity.TrainingRequirementName = string.Empty;
            entity.TrainingCategory = string.Empty;
        }

        /// <summary>
        /// Get EmployeeKRA by ID
        /// </summary>
        public EmployeeKRAEntity GetKRA(int kraId)
        {
            try
            {
                using (var repository = new EmployeeKRARepositoryADO())
                {
                    DataSet ds = repository.GetKRAById(kraId);
                    
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return repository.DataRowToEntity(ds.Tables[0].Rows[0]);
                    }
                    
                    return null;
                }
            }
            catch (Exception ex)
            {
                logService.Error(sectionName, "GetKRA", $"Error getting KRA {kraId}: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Insert new EmployeeKRA
        /// </summary>
        public int InsertKRA(EmployeeKRAEntity entity)
        {
            try
            {
                // Validate required fields
                var validations = ValidateKRA(entity);
                if (validations.Count > 0)
                {
                    List<string> errorMessages = new List<string>();
                    foreach (var validation in validations)
                    {
                        errorMessages.Add(validation.ErrorMessage);
                    }
                    throw new Exception(string.Join("; ", errorMessages));
                }

                // Set defaults
                if (!entity.CreatedOn.HasValue)
                {
                    entity.CreatedOn = DateTime.Now;
                }

                if (!entity.KRAStatusId.HasValue)
                {
                    entity.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Initialised);
                }

                if (!entity.KRASetId.HasValue)
                {
                    entity.KRASetId = 1;
                }

                NormalizeTrainingFieldsForGoalType(entity);

                logService.Info(sectionName, "InsertKRA", 
                    $"Inserting KRA - EmployeeId: {entity.EmployeeId}, TrainingItemId: {entity.TrainingItemId ?? "NULL"}, TrainingCategory: {entity.TrainingCategory ?? "NULL"}");

                using (var repository = new EmployeeKRARepositoryADO())
                {
                    int newKRAId = repository.InsertKRA(entity);
                    
                    logService.Info(sectionName, "InsertKRA", $"KRA inserted successfully with KRAId: {newKRAId}");
                    
                    return newKRAId;
                }
            }
            catch (Exception ex)
            {
                logService.Error(sectionName, "InsertKRA", $"Error inserting KRA: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Update existing EmployeeKRA
        /// </summary>
        public bool UpdateKRA(EmployeeKRAEntity entity)
        {
            try
            {
                // Validate KRA exists
                if (entity.KRAId <= 0)
                {
                    throw new Exception("KRAId is required for update");
                }

                // Get existing KRA to preserve some fields if needed
                EmployeeKRAEntity existingKRA = GetKRA(entity.KRAId);
                if (existingKRA == null)
                {
                    throw new Exception($"KRA with ID {entity.KRAId} not found");
                }

                // Validate required fields
                var validations = ValidateKRA(entity);
                if (validations.Count > 0)
                {
                    List<string> errorMessages = new List<string>();
                    foreach (var validation in validations)
                    {
                        errorMessages.Add(validation.ErrorMessage);
                    }
                    throw new Exception(string.Join("; ", errorMessages));
                }

                // Set ModifiedOn if not provided
                if (!entity.ModifiedOn.HasValue)
                {
                    entity.ModifiedOn = DateTime.Now;
                }

                NormalizeTrainingFieldsForGoalType(entity);

                logService.Info(sectionName, "UpdateKRA", 
                    $"Updating KRA {entity.KRAId} - TrainingItemId: {entity.TrainingItemId ?? "NULL"}, TrainingCategory: {entity.TrainingCategory ?? "NULL"}");

                using (var repository = new EmployeeKRARepositoryADO())
                {
                    bool success = repository.UpdateKRA(entity);
                    
                    if (success)
                    {
                        logService.Info(sectionName, "UpdateKRA", $"KRA {entity.KRAId} updated successfully using ADO.NET");
                        // Issue 21: Do NOT send email on RM update. Mail triggers only on KRA Approve action.
                        // SendManagerEditEmail removed from here - approval email (with correct template) is sent only from ApproveEmployeeKRA.
                    }
                    else
                    {
                        string errorMsg = $"KRA {entity.KRAId} update returned false (no rows affected). TrainingItemId: {entity.TrainingItemId ?? "NULL"}, TrainingCategory: {entity.TrainingCategory ?? "NULL"}";
                        logService.Warn(sectionName, "UpdateKRA", errorMsg);
                        throw new Exception(errorMsg);
                    }
                    
                    return success;
                }
            }
            catch (Exception ex)
            {
                logService.Error(sectionName, "UpdateKRA", $"Error updating KRA {entity.KRAId}: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Validate EmployeeKRA entity
        /// </summary>
        private List<ValidationsEntity> ValidateKRA(EmployeeKRAEntity entity)
        {
            List<ValidationsEntity> validations = new List<ValidationsEntity>();

            if (entity.EmployeeId <= 0)
            {
                validations.Add(new ValidationsEntity { FieldName = "EmployeeId", ErrorMessage = "EmployeeId is required" });
            }

            if (entity.KRAFromDate == DateTime.MinValue)
            {
                validations.Add(new ValidationsEntity { FieldName = "KRAFromDate", ErrorMessage = "Start Date is required" });
            }

            if (entity.KRAToDate == DateTime.MinValue)
            {
                validations.Add(new ValidationsEntity { FieldName = "KRAToDate", ErrorMessage = "End Date is required" });
            }

            if (string.IsNullOrWhiteSpace(entity.GoalType))
            {
                validations.Add(new ValidationsEntity { FieldName = "GoalType", ErrorMessage = "Goal Type is required" });
            }

            if (string.IsNullOrWhiteSpace(entity.GoalDescription))
            {
                validations.Add(new ValidationsEntity { FieldName = "GoalDescription", ErrorMessage = "Key Responsibility Area (KRA) is required" });
            }

            if (!entity.Weightage.HasValue || entity.Weightage.Value <= 0)
            {
                validations.Add(new ValidationsEntity { FieldName = "Weightage", ErrorMessage = "Weightage is required and must be greater than 0" });
            }

            if (string.IsNullOrWhiteSpace(entity.Measure))
            {
                validations.Add(new ValidationsEntity { FieldName = "Measure", ErrorMessage = "Key Performance Indicators (KPIs) is required" });
            }

            if (entity.KRAFromDate > entity.KRAToDate)
            {
                validations.Add(new ValidationsEntity { FieldName = "KRAFromDate", ErrorMessage = "Start Date cannot be greater than End Date" });
            }

            return validations;
        }

        /// <summary>
        /// Send email notification when manager edits employee's goal
        /// Uses template ID 26
        /// </summary>
        private void SendManagerEditEmail(EmployeeKRAEntity entity)
        {
            try
            {
                EmailTemplateMasterBL emailTemplateBL = new EmailTemplateMasterBL();
                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();

                // Get employee details (the employee whose goal was edited)
                GetEmpDetailsByEmpId_ResultEntity employeeDetails = employeeMasterBL.GetEmployeeDetailsForEmail(entity.EmployeeId);
                
                // Get manager details (the person who edited - ModifiedBy or ManagerId)
                int managerId = entity.ModifiedBy ?? entity.ManagerId ?? 0;
                if (managerId == 0)
                {
                    logService.Warn(sectionName, "SendManagerEditEmail", $"ManagerId not found for KRA {entity.KRAId}, cannot send email");
                    return;
                }
                
                GetEmpDetailsByEmpId_ResultEntity managerDetails = employeeMasterBL.GetEmployeeDetailsForEmail(managerId);

                // Get email template ID 26
                EmailTemplateMasterEntity emailTemplate = emailTemplateBL.Get(26);
                if (emailTemplate == null)
                {
                    logService.Warn(sectionName, "SendManagerEditEmail", $"Email template ID 26 not found, cannot send email");
                    return;
                }

                var fromAddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();
                
                // Prepare employee and manager names
                string empName = employeeDetails.FirstName + ' ' + employeeDetails.LastName;
                string rmName = managerDetails.FirstName + ' ' + managerDetails.LastName;
                string rmId = managerDetails.NewEmployeeCode.Trim();
                string rmNameWithId = rmName + " (" + rmId + ")";

                // Replace placeholders in subject and body
                // Template uses: EMP Name, RM Name (RM ID) or {{EmployeeName}}, {{RMName}}, {{RMID}}
                emailTemplate.Subject = emailTemplate.Subject.Replace("{{EmployeeName}}", empName);
                emailTemplate.Subject = emailTemplate.Subject.Replace("EMP Name", empName);
                emailTemplate.Subject = emailTemplate.Subject.Replace("{{RMName}}", rmName);
                emailTemplate.Subject = emailTemplate.Subject.Replace("{{RMID}}", rmId);
                emailTemplate.Subject = emailTemplate.Subject.Replace("RM Name (RM ID)", rmNameWithId);
                emailTemplate.Subject = emailTemplate.Subject.Replace("<RM Name (RM ID)>", rmNameWithId);

                emailTemplate.Body = emailTemplate.Body.Replace("{{EmployeeName}}", empName);
                emailTemplate.Body = emailTemplate.Body.Replace("EMP Name", empName);
                emailTemplate.Body = emailTemplate.Body.Replace("{{RMName}}", rmName);
                emailTemplate.Body = emailTemplate.Body.Replace("{{RMID}}", rmId);
                emailTemplate.Body = emailTemplate.Body.Replace("RM Name (RM ID)", rmNameWithId);
                emailTemplate.Body = emailTemplate.Body.Replace("<RM Name (RM ID)>", rmNameWithId);

                // Create and send email
                MailMessage message = new MailMessage(fromAddress, employeeDetails.EmailAddress);
                message.Subject = emailTemplate.Subject;
                message.Body = emailTemplate.Body;
                message.IsBodyHtml = true;

                Utility.SendMail(message);
                logService.Info(sectionName, "SendManagerEditEmail", $"Email sent to {employeeDetails.EmailAddress} for KRA {entity.KRAId}");
            }
            catch (Exception ex)
            {
                logService.Fatal(sectionName, "SendManagerEditEmail", $"Error sending manager edit email: {ex.Message}, StackTrace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
