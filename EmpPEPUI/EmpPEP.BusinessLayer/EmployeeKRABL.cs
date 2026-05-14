using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Mail;
using System.Linq;
using System.Data;
using System.IO;
using Newtonsoft.Json;

namespace EmpPEP.BusinessLayer
{

    public class EmployeeKRABL
    {
        public string sectionName = "EmployeeKRABL";
        private readonly ILogService logService = new FileLogService(typeof(EmployeeKRABL));
        #region "Public Methods"

        public DataSet Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int KRAStatusId, int selectedyear, string SelfAssCycleId)
        {
            EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
            employeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
            employeeKRAEntity.EmployeeId = ToEmployeeId;
            employeeKRAEntity.KRAStatusId = KRAStatusId;



            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();

            if ((FromEmployeeId != ToEmployeeId))
            {
                if (employeeMasterBL.IsManager(FromEmployeeId))
                    return GetKRAForManagersFeedback(employeeKRAEntity, selectedyear);
                else
                    return null;
            }
            else
            {
                return GetEmployeeKRA(employeeKRAEntity, SelfAssCycleId);
            }
        }

        public DataSet Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, string SelfAssCycleId)
        {
            EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
            employeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
            employeeKRAEntity.EmployeeId = ToEmployeeId;

            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();

            if ((FromEmployeeId != ToEmployeeId))
            {
                if (employeeMasterBL.IsManager(FromEmployeeId))
                {
                    // For managers viewing team member KRAs, use GetEmployeeKRA to get all statuses
                    // This allows managers to see Initialised, Submitted, and Approved goals
                    return GetEmployeeKRA(employeeKRAEntity, SelfAssCycleId);
                }
                else
                    return null;
            }
            else
            {
                return GetEmployeeKRA(employeeKRAEntity, SelfAssCycleId);
            }
        }

        public EmployeeKRAEntity Get(int KRAId) //picks one KRA of a specific employee
        {
            // Use ADO.NET-based method instead of Entity Framework
            return GetWithSP(KRAId);
        }

        /// <summary>
        /// Get EmployeeKRA by ID using stored procedure for faster performance (ADO.NET-based)
        /// </summary>
        public EmployeeKRAEntity GetWithSP(int KRAId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                var employeeKRA = employeeKRARepository.GetKRAWithSP(KRAId);

                if (employeeKRA != null && employeeKRA.KRAId > 0)
                {
                    EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
                    employeeKRAEntity = (EmployeeKRAEntity)Utility.ConvertToObject(employeeKRA, employeeKRAEntity);

                    // Explicitly set TrainingItemId, TrainingRequirementName, and TrainingCategory to ensure they are copied
                    // This is critical because Utility.ConvertToObject might not copy nullable properties correctly
                    employeeKRAEntity.TrainingItemId = employeeKRA.TrainingItemId;
                    employeeKRAEntity.TrainingRequirementName = employeeKRA.TrainingRequirementName;
                    employeeKRAEntity.TrainingCategory = employeeKRA.TrainingCategory; // Comma-separated categories for custom trainings

                    // Log the values for debugging
                    logService.Info(sectionName, "GetWithSP", $"KRAId: {KRAId}, TrainingItemId: {employeeKRAEntity.TrainingItemId?.ToString() ?? "NULL"}, TrainingRequirementName: {employeeKRAEntity.TrainingRequirementName ?? "NULL"}, TrainingCategory: {employeeKRAEntity.TrainingCategory ?? "NULL"}");

                    // Manually retrieve AttachmentPath since it's not a property on EmployeeKRA entity
                    // AttachmentPath now contains only the filename
                    employeeKRAEntity.AttachmentPath = employeeKRARepository.GetAttachmentPath(KRAId);

                    return employeeKRAEntity;
                }
                return null;
            }
        }

        public bool Put(EmployeeKRAEntity employeeKRAEntity)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                // Log the incoming entity values for debugging
                logService.Info(sectionName, "Put", $"Received KRAId: {employeeKRAEntity.KRAId}, TrainingItemId: {employeeKRAEntity.TrainingItemId?.ToString() ?? "NULL"}, TrainingRequirementName: {employeeKRAEntity.TrainingRequirementName ?? "NULL"}");

                // Use ADO.NET-based method instead of Entity Framework
                EmployeeKRA employeeKRA = employeeKRARepository.GetKRAWithSP(employeeKRAEntity.KRAId);
                if ((employeeKRA != null) && (employeeKRA.KRAId > 0))
                {
                    // Log existing values
                    logService.Info(sectionName, "Put", $"Existing KRA - TrainingItemId: {employeeKRA.TrainingItemId ?? "NULL"}, TrainingRequirementName: {employeeKRA.TrainingRequirementName ?? "NULL"}");

                    // Check if TrainingItemId is being set for the first time
                    // TrainingItemId is now a string (comma-separated IDs), so check if it's null or empty
                    bool trainingItemIdJustAdded = string.IsNullOrEmpty(employeeKRA.TrainingItemId)
                        && !string.IsNullOrEmpty(employeeKRAEntity.TrainingItemId);

                    // Always update TrainingItemId, TrainingRequirementName, and TrainingCategory regardless of status
                    // This allows setting them to null to clear the values, or updating them with new values
                    // Explicitly set the values to ensure they are updated even if they are null
                    employeeKRA.TrainingItemId = employeeKRAEntity.TrainingItemId; // Can be null, empty, or comma-separated string of IDs
                    employeeKRA.TrainingRequirementName = employeeKRAEntity.TrainingRequirementName;
                    employeeKRA.TrainingCategory = employeeKRAEntity.TrainingCategory; // Comma-separated categories for custom trainings

                    // Log the values to verify they are being set correctly
                    logService.Info(sectionName, "Put", $"Before Update - Entity TrainingItemId: {employeeKRAEntity.TrainingItemId?.ToString() ?? "NULL"}, Entity TrainingRequirementName: {employeeKRAEntity.TrainingRequirementName ?? "NULL"}, Entity TrainingCategory: {employeeKRAEntity.TrainingCategory ?? "NULL"}");
                    logService.Info(sectionName, "Put", $"Before Update - employeeKRA TrainingItemId: {employeeKRA.TrainingItemId?.ToString() ?? "NULL"}, employeeKRA TrainingRequirementName: {employeeKRA.TrainingRequirementName ?? "NULL"}, employeeKRA TrainingCategory: {employeeKRA.TrainingCategory ?? "NULL"}");

                    if (employeeKRA.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Completed))
                    {
                        employeeKRA.KRAToDate = employeeKRAEntity.KRAToDate;
                        employeeKRA.KRAStatusId = employeeKRAEntity.KRAStatusId;
                        employeeKRA.ModifiedBy = employeeKRAEntity.ModifiedBy;
                        employeeKRA.ModifiedOn = DateTime.Now;
                    }
                    else
                    {
                        employeeKRA.Sequence = employeeKRAEntity.Sequence;
                        employeeKRA.GoalType = employeeKRAEntity.GoalType;
                        employeeKRA.GoalDescription = employeeKRAEntity.GoalDescription;
                        employeeKRA.Weightage = employeeKRAEntity.Weightage;
                        employeeKRA.ActionStep = employeeKRAEntity.ActionStep;
                        employeeKRA.ActionPlan = employeeKRAEntity.ActionPlan;
                        employeeKRA.Measure = employeeKRAEntity.Measure;
                        employeeKRA.Selfassesment = employeeKRAEntity.Selfassesment;
                        employeeKRA.TargetDate = employeeKRAEntity.TargetDate;
                        employeeKRA.KRAFromDate = employeeKRAEntity.KRAFromDate;
                        employeeKRA.KRAToDate = employeeKRAEntity.KRAToDate;
                        employeeKRA.KRAStatusId = employeeKRAEntity.KRAStatusId;
                        employeeKRA.ModifiedBy = employeeKRAEntity.ModifiedBy;
                        employeeKRA.ModifiedOn = DateTime.Now;
                    }

                    if (employeeKRA.KRAStatusId != Convert.ToInt32(EnumCollection.KRA.Completed)
                        && !EmployeeKRABLADO.IsDevelopmentalGoalType(employeeKRA.GoalType))
                    {
                        employeeKRA.TrainingItemId = null;
                        employeeKRA.TrainingRequirementName = null;
                        employeeKRA.TrainingCategory = null;
                    }

                    // Log the values being set
                    logService.Info(sectionName, "Put", $"Setting TrainingItemId: {employeeKRA.TrainingItemId?.ToString() ?? "NULL"}, TrainingRequirementName: {employeeKRA.TrainingRequirementName ?? "NULL"}, TrainingCategory: {employeeKRA.TrainingCategory ?? "NULL"}");

                    bool result = employeeKRARepository.Update(employeeKRA);

                    // Note: Training request will be processed when the goal is approved by manager
                    // Just store/update the TrainingItemId in the EmployeeKRA table for now

                    return result;
                }
                return false;
            }
        }

        //public bool Put(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int KRAAction, int ManagerId)
        //{
        //    try
        //    {
        //        EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
        //        employeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
        //        employeeKRAEntity.EmployeeId = ToEmployeeId;
        //        EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
        //        using (var employeeKRARepository = new EmployeeKRARepository())
        //        {

        //            string SelfAssCycleId = "";
        //            List<EmployeeKRA> employeeKRA = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity,new EmployeeKRA()), SelfAssCycleId);
        //            int innManagerId = 0;
        //            int EmployeeId = 0;
        //            int? innStatusId = 0;
        //            //Approve
        //            foreach (var obj in employeeKRA)
        //            {
        //                if ((FromEmployeeId != ToEmployeeId) &&
        //                    (employeeMasterBL.IsManager(FromEmployeeId)))
        //                {
        //                    if (obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Initialised) ||
        //                        obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Submitted) || obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Approved))
        //                    {
        //                        if (KRAAction == Convert.ToInt32(EnumCollection.KRAACTIONTYPE.Approve))
        //                        {
        //                            obj.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
        //                            obj.ModifiedBy = FromEmployeeId;
        //                            obj.ModifiedOn = DateTime.Now;
        //                            innStatusId = obj.KRAStatusId;
        //                        }
        //                        else
        //                        {
        //                            obj.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Rejected);
        //                            obj.ModifiedBy = FromEmployeeId;
        //                            obj.ModifiedOn = DateTime.Now;
        //                            innStatusId = obj.KRAStatusId;
        //                        }

        //                        employeeKRARepository.Update(obj);
        //                        EmployeeId = ToEmployeeId;
        //                        innManagerId = FromEmployeeId;

        //                    }
        //                }
        //                else
        //                {
        //                    if ((obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Initialised))
        //                        || (obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Rejected)))
        //                    {
        //                        obj.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Submitted);
        //                        obj.ModifiedBy = FromEmployeeId;
        //                        obj.ModifiedOn = DateTime.Now;
        //                        obj.ManagerId = ManagerId;
        //                        employeeKRARepository.Update(obj);

        //                        innManagerId = ManagerId;
        //                        EmployeeId = ToEmployeeId;

        //                        innStatusId = obj.KRAStatusId;
        //                    }
        //                }
        //            }
        //            SendMail(innManagerId, ToEmployeeId, innStatusId);
        //            return true;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }
        //}
        public bool Put(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int KRAAction, int ManagerId)
        {
            try
            {
                EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
                employeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
                employeeKRAEntity.EmployeeId = ToEmployeeId;
                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();

                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    string SelfAssCycleId = "";
                    // Get KRA data as DataSet
                    DataSet employeeKRAResultEntity = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, new EmployeeKRA()), SelfAssCycleId);

                    if (employeeKRAResultEntity.Tables.Count > 0 && employeeKRAResultEntity.Tables[0].Rows.Count > 0)
                    {
                        int innManagerId = 0;  // Define innManagerId to track the manager's ID
                        int? innStatusId = 0;  // Define innStatusId to track the KRA status

                        foreach (DataRow obj in employeeKRAResultEntity.Tables[0].Rows)
                        {
                            // Assuming logic for approving or submitting the KRA
                            if ((FromEmployeeId != ToEmployeeId) && (employeeMasterBL.IsManager(FromEmployeeId)))
                            {
                                if (obj["KRAStatusId"] != DBNull.Value &&
                                    (Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Initialised) ||
                                     Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Submitted) ||
                                     Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Approved)))
                                {
                                    if (KRAAction == Convert.ToInt32(EnumCollection.KRAACTIONTYPE.Approve))
                                    {
                                        obj["KRAStatusId"] = Convert.ToInt32(EnumCollection.KRA.Approved);
                                        obj["ModifiedBy"] = FromEmployeeId;
                                        obj["ModifiedOn"] = DateTime.Now;
                                    }
                                    else
                                    {
                                        obj["KRAStatusId"] = Convert.ToInt32(EnumCollection.KRA.Rejected);
                                        obj["ModifiedBy"] = FromEmployeeId;
                                        obj["ModifiedOn"] = DateTime.Now;
                                    }

                                    // Set the innManagerId and innStatusId to be used in SendMail
                                    innManagerId = FromEmployeeId; // Set the manager's ID
                                    innStatusId = (int?)obj["KRAStatusId"]; // Set the status ID (Approved or Rejected)

                                    // Update the DataSet with the modified DataRow
                                    bool result = employeeKRARepository.UpdateDataSet(obj);
                                }
                            }
                            else
                            {
                                if (obj["KRAStatusId"] != DBNull.Value &&
                                    (Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Initialised) ||
                                     Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Rejected)))
                                {
                                    obj["KRAStatusId"] = Convert.ToInt32(EnumCollection.KRA.Submitted);
                                    obj["ModifiedBy"] = FromEmployeeId;
                                    obj["ModifiedOn"] = DateTime.Now;
                                    obj["ManagerId"] = ManagerId;

                                    // Set the innManagerId and innStatusId to be used in SendMail
                                    innManagerId = ManagerId; // Set the manager's ID for this case
                                    innStatusId = (int?)obj["KRAStatusId"]; // Set the status ID (Submitted)

                                    // Update the DataSet with the modified DataRow
                                    //   employeeKRARepository.Update(obj);
                                    employeeKRARepository.UpdateDataSet(obj);
                                }
                            }
                        }

                        // Send mail after all updates
                        SendMail(innManagerId, ToEmployeeId, innStatusId);
                        //   SendMail(5521, 5521, innStatusId);
                        return true;
                    }
                    else
                    {
                        // Handle the case where no rows are found in the DataSet
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle exception (logging or error reporting)
                return false;
            }
        }




        public bool Put(EmployeeKRAEntity employeeKRAentity, string YearSubCycleCheck)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    employeeKRA.EmployeeId = employeeKRAentity.EmployeeId;
                    employeeKRA.AppraisalCycleId = employeeKRAentity.AppraisalCycleId;
                    employeeKRA.KRAId = employeeKRAentity.KRAId;
                    employeeKRA.ModifiedBy = null;
                    employeeKRA.Selfassesment = employeeKRAentity.Selfassesment;

                    employeeKRARepository.InsertSelfassessment(employeeKRA, YearSubCycleCheck);
                }

                return true;

            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// Insert Self Assessment and return the inserted SelfAssessmentId
        /// </summary>
        public int PutReturnSelfAssessmentId(EmployeeKRAEntity employeeKRAentity, string YearSubCycleCheck)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    employeeKRA.EmployeeId = employeeKRAentity.EmployeeId;
                    employeeKRA.AppraisalCycleId = employeeKRAentity.AppraisalCycleId;
                    employeeKRA.KRAId = employeeKRAentity.KRAId;
                    employeeKRA.ModifiedBy = null;
                    employeeKRA.Selfassesment = employeeKRAentity.Selfassesment;

                    return employeeKRARepository.InsertSelfassessmentReturnId(employeeKRA, YearSubCycleCheck);
                }
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        /// <summary>
        /// Self assessment attachment rules — use on server after upload bytes are known (defense in depth).
        /// </summary>
        public static bool TryValidateSelfAssessmentAttachment(string originalFileName, long fileSizeBytes, out string errorMessage)
        {
            errorMessage = null;
            if (string.IsNullOrWhiteSpace(originalFileName))
            {
                errorMessage = "No file name provided.";
                return false;
            }
            string ext = Path.GetExtension(originalFileName);
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".gif", ".msg", ".eml", ".txt" };
            if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext.ToLowerInvariant()))
            {
                errorMessage = "Invalid file type. Allowed: PDF; Word (.doc, .docx); Excel (.xls, .xlsx); PowerPoint (.ppt, .pptx); images (.jpg, .jpeg, .png, .gif); email (.msg, .eml); text (.txt). Maximum file size: 10 MB.";
                return false;
            }
            const long maxFileSizeBytes = 10L * 1024 * 1024;
            if (fileSizeBytes <= 0)
            {
                errorMessage = "Empty (0 KB) files cannot be uploaded. Please select a file with content.";
                return false;
            }
            if (fileSizeBytes > maxFileSizeBytes)
            {
                errorMessage = "File size exceeds the 10 MB limit.";
                return false;
            }
            return true;
        }

        /// <summary>
        /// Insert Self Assessment Attachment
        /// </summary>
        public bool InsertSelfAssessmentAttachment(int SelfAssessmentId, int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId, string AttachmentPath, string OriginalFileName, long? FileSize, string ContentType, int CreatedBy)
        {
            try
            {
                long size = FileSize ?? 0;
                if (!TryValidateSelfAssessmentAttachment(OriginalFileName, size, out string validationError))
                {
                    logService.Warn("EmpPEP.BusinessLayer", "InsertSelfAssessmentAttachment", validationError ?? "Validation failed");
                    return false;
                }

                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    return employeeKRARepository.InsertSelfAssessmentAttachment(SelfAssessmentId, EmployeeId, AppraisalCycleId, SelfAssessmentCycleId, AttachmentPath, OriginalFileName, FileSize, ContentType, CreatedBy);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "InsertSelfAssessmentAttachment", ex.Message);
                return false;
            }
        }

        /// <summary>
        /// Get Self Assessment Attachments by SelfAssessmentId
        /// </summary>
        public DataTable GetSelfAssessmentAttachments(int SelfAssessmentId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    return employeeKRARepository.GetSelfAssessmentAttachments(SelfAssessmentId);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "GetSelfAssessmentAttachments", ex.Message);
                return new DataTable();
            }
        }

        /// <summary>
        /// Get Self Assessment Attachments by Employee, AppraisalCycle, and SelfAssessmentCycle
        /// </summary>
        public DataTable GetSelfAssessmentAttachmentsByEmployeeCycle(int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    return employeeKRARepository.GetSelfAssessmentAttachmentsByEmployeeCycle(EmployeeId, AppraisalCycleId, SelfAssessmentCycleId);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "GetSelfAssessmentAttachmentsByEmployeeCycle", ex.Message);
                return new DataTable();
            }
        }

        /// <summary>
        /// Get Self Assessment Attachment by AttachmentId
        /// </summary>
        public DataTable GetSelfAssessmentAttachmentById(int AttachmentId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    return employeeKRARepository.GetSelfAssessmentAttachmentById(AttachmentId);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "GetSelfAssessmentAttachmentById", ex.Message);
                return new DataTable();
            }
        }

        /// <summary>
        /// Soft-delete attachment and remove encrypted file from disk when possible.
        /// </summary>
        public bool DeactivateSelfAssessmentAttachment(int AttachmentId, int EmployeeId, int ModifiedBy)
        {
            try
            {
                string fileNameOnly = null;
                int appraisalCycleId = 0;
                int rowEmployeeId = 0;

                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    var dt = employeeKRARepository.GetSelfAssessmentAttachmentById(AttachmentId);
                    if (dt == null || dt.Rows.Count == 0)
                        return false;

                    var row = dt.Rows[0];
                    rowEmployeeId = Convert.ToInt32(row["EmployeeId"]);
                    if (rowEmployeeId != EmployeeId)
                        return false;

                    fileNameOnly = row["AttachmentPath"] != DBNull.Value ? row["AttachmentPath"].ToString() : null;
                    appraisalCycleId = Convert.ToInt32(row["AppraisalCycleId"]);
                }

                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    if (!employeeKRARepository.DeactivateSelfAssessmentAttachment(AttachmentId, EmployeeId, ModifiedBy))
                        return false;
                }

                if (!string.IsNullOrEmpty(fileNameOnly))
                {
                    try
                    {
                        string filePath = ConfigurationManager.AppSettings["FilePath"];
                        if (!string.IsNullOrEmpty(filePath))
                        {
                            string fullFilePath = Path.Combine(filePath, EmployeeId.ToString(), appraisalCycleId.ToString(), fileNameOnly);
                            if (File.Exists(fullFilePath))
                                File.Delete(fullFilePath);
                        }
                    }
                    catch (Exception fileEx)
                    {
                        logService.Warn("EmpPEP.BusinessLayer", "DeactivateSelfAssessmentAttachment", "DB deactivated but file delete failed: " + fileEx.Message);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "DeactivateSelfAssessmentAttachment", ex.Message);
                return false;
            }
        }

        public bool Put(int EmployeeId, int AppraisalCycleId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    employeeKRA.EmployeeId = EmployeeId;
                    employeeKRA.AppraisalCycleId = AppraisalCycleId;
                    employeeKRA.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);

                    List<EmployeeKRA> NewemployeeKRA = employeeKRARepository.GetKRAForManagersFeedback(employeeKRA);
                    foreach (var item in NewemployeeKRA)
                    {
                        item.IsSeen = 1;
                        item.ModifiedBy = EmployeeId;
                        item.ModifiedOn = DateTime.Today;
                        employeeKRARepository.Update(item);
                    }

                    return true;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public int Post(EmployeeKRAEntity employeeKRAEntity)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                employeeKRA = (EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA);
                employeeKRA.CreatedBy = employeeKRA.EmployeeId;
                employeeKRA.CreatedOn = DateTime.Now;
                employeeKRA.IsSeen = 0;
                return employeeKRARepository.Insert(employeeKRA);
            }
        }

        /// <summary>
        /// Validate batch insert of KRAs from Reference Goal Repository
        /// Returns validation errors with detailed status information
        /// </summary>
        public List<ValidationsEntity> PostBatchValidations(int AppraisalCycleId, int EmployeeId)
        {
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();
            ValidationHelper helper = new ValidationHelper();

            if (AppraisalCycleId <= 0)
            {
                validationsEntity.Add(helper.CreateValidation("Appraisal Cycle", "", "Please select a valid Appraisal Cycle."));
                return validationsEntity;
            }

            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                employeeKRA.EmployeeId = EmployeeId;
                employeeKRA.AppraisalCycleId = AppraisalCycleId;

                // Check if goals already exist for current cycle
                List<EmployeeKRA> existingKRAs = employeeKRARepository.ValidateKRAToCopy(employeeKRA);
                if (existingKRAs.Count > 0)
                {
                    // Check if all existing goals are NOT approved (Initialised=1, Submitted=2, or Rejected=18)
                    // If at least one goal is Approved (3) or Completed (4), don't allow override
                    bool hasApprovedOrCompleted = existingKRAs.Any(k => 
                        k.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Approved) || k.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Completed)
                        || k.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Submitted) || k.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Rejected));

                    if (hasApprovedOrCompleted)
                    {
                        // Goals are approved/completed - show old error message (no override allowed)
                        var validation = helper.CreateValidation("Goals", "", "Goals already exist for the current Appraisal Cycle. Cannot copy from Reference Goal Repository.");
                        validation.CanOverride = false; // Cannot override approved/completed goals
                        validationsEntity.Add(validation);
                    }
                    else
                    {
                        // Goals are not approved (Initialised, Submitted, or Rejected) - allow override with confirmation
                        var validation = helper.CreateValidation("Goals", "", "You already have goals added for the current cycle. Selecting this template will override your existing goals.");
                        validation.CanOverride = true; // Can override non-approved goals
                        validation.TotalExistingGoals = existingKRAs.Count; // Additional info for UI
                        validationsEntity.Add(validation);
                    }
                }
            }

            return validationsEntity;
        }

        /// <summary>
        /// Batch insert multiple KRAs in one transaction using stored procedure
        /// </summary>
        public int PostBatch(List<EmployeeKRAEntity> employeeKRAEntities)
        {
            if (employeeKRAEntities == null || employeeKRAEntities.Count == 0)
            {
                return 0;
            }

            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                int successCount = 0;
                foreach (var employeeKRAEntity in employeeKRAEntities)
                {
                    try
                    {
                        EmployeeKRA employeeKRA = new EmployeeKRA();
                        employeeKRA = (EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA);
                        employeeKRA.CreatedBy = employeeKRA.EmployeeId;
                        employeeKRA.CreatedOn = DateTime.Now;
                        employeeKRA.IsSeen = 0;
                        
                        // Use stored procedure instead of Entity Framework Insert for better performance
                        int result = employeeKRARepository.InsertKRAWithSP(employeeKRA);
                        if (result > 0)
                        {
                            successCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        logService.Error(sectionName, "PostBatch", $"Error inserting KRA: {ex.Message}");
                        // Continue with next KRA
                    }
                }
                return successCount;
            }
        }

        /// <summary>
        /// Insert EmployeeKRA using stored procedure for faster performance
        /// </summary>
        public int PostWithSP(EmployeeKRAEntity employeeKRAEntity)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                // Log the incoming entity values for debugging
                logService.Info(sectionName, "PostWithSP", $"Received TrainingItemId: {employeeKRAEntity.TrainingItemId?.ToString() ?? "NULL"}, TrainingRequirementName: {employeeKRAEntity.TrainingRequirementName ?? "NULL"}, TrainingCategory: {employeeKRAEntity.TrainingCategory ?? "NULL"}");

                EmployeeKRABLADO.NormalizeTrainingFieldsForGoalType(employeeKRAEntity);

                EmployeeKRA employeeKRA = new EmployeeKRA();
                employeeKRA = (EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA);

                // CRITICAL: EmployeeId MUST be preserved from entity (reportee's ID for team mode, employee's ID for regular mode)
                // For team mode (flag == 1 and ManagerId is set), EmployeeId should be the reportee's ID, NOT the manager's ID
                // Do NOT override EmployeeId - it's already correctly set in the entity
                employeeKRA.EmployeeId = employeeKRAEntity.EmployeeId;

                // Explicitly set TrainingItemId, TrainingRequirementName, and TrainingCategory to ensure they are copied
                // This is critical because Utility.ConvertToObject might not copy nullable properties correctly
                employeeKRA.TrainingItemId = employeeKRAEntity.TrainingItemId;
                employeeKRA.TrainingRequirementName = employeeKRAEntity.TrainingRequirementName;
                employeeKRA.TrainingCategory = employeeKRAEntity.TrainingCategory; // Comma-separated categories for custom trainings

                // Log the values after conversion
                logService.Info(sectionName, "PostWithSP", $"After conversion TrainingItemId: {employeeKRA.TrainingItemId?.ToString() ?? "NULL"}, TrainingRequirementName: {employeeKRA.TrainingRequirementName ?? "NULL"}, TrainingCategory: {employeeKRA.TrainingCategory ?? "NULL"}");

                // Additional validation: If this is a manager adding goal for team member (flag == 1 and ManagerId set),
                // ensure EmployeeId is NOT equal to CreatedBy (which would be the manager's ID)
                if (employeeKRAEntity.flag == 1 && employeeKRAEntity.ManagerId > 0 && employeeKRAEntity.CreatedBy > 0)
                {
                    // This is a manager adding goal for a team member
                    // EmployeeId should be the reportee's ID, CreatedBy should be the manager's ID
                    if (employeeKRA.EmployeeId == employeeKRAEntity.CreatedBy)
                    {
                        // ERROR: EmployeeId is set to manager's ID instead of reportee's ID
                        throw new Exception($"Invalid EmployeeId: EmployeeId ({employeeKRA.EmployeeId}) cannot be the same as CreatedBy ({employeeKRAEntity.CreatedBy}) when manager is adding goal for team member.");
                    }
                }

                // If CreatedBy is already set (e.g., manager adding goal for team member), use it
                // Otherwise, set CreatedBy to EmployeeId (employee adding their own goal)
                if (employeeKRAEntity.CreatedBy > 0)
                {
                    employeeKRA.CreatedBy = employeeKRAEntity.CreatedBy;
                }
                else
                {
                    employeeKRA.CreatedBy = employeeKRA.EmployeeId;
                }

                // If ModifiedBy is set (e.g., manager adding goal for team member), use it
                // Otherwise, ModifiedBy will be null for new inserts
                if (employeeKRAEntity.ModifiedBy > 0)
                {
                    employeeKRA.ModifiedBy = employeeKRAEntity.ModifiedBy;
                    employeeKRA.ModifiedOn = DateTime.Now;
                }

                employeeKRA.CreatedOn = DateTime.Now;
                employeeKRA.IsSeen = 0;
                int insertedKRAId = employeeKRARepository.InsertKRAWithSP(employeeKRA);

                // Note: Training request will be processed when the goal is approved by manager
                // Just store the TrainingItemId in the EmployeeKRA table for now

                return insertedKRAId;
            }
        }

        public bool Delete(int KRAId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                employeeKRA.KRAId = KRAId;
                // employeeKRA.ModifiedBy = FromEmployeeId;
                employeeKRA.ModifiedOn = DateTime.Now;
                return employeeKRARepository.Delete(employeeKRA);
            }
        }

        /// <summary>
        /// Delete all non-approved goals for an employee in a specific appraisal cycle
        /// Used when overriding existing goals with Reference Goal Repository
        /// Only deletes goals with status: Initialised, Submitted, or Rejected
        /// </summary>
        public bool DeleteGoalsByEmployeeAndCycle(int employeeId, int appraisalCycleId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.DeleteGoalsByEmployeeAndCycle(employeeId, appraisalCycleId);
            }
        }

        public bool UploadKRA(List<UploadKRAEmployeeSetEntity> uploadKRAEmployeeSetEntity)
        {
            // Get the KRAset

            UploadKRAMasterRepository uploadKRAMasterR = new UploadKRAMasterRepository();
            List<UploadKRAMaster> uploadKRAMaster = new List<UploadKRAMaster>();
            uploadKRAMaster = uploadKRAMasterR.Get(uploadKRAEmployeeSetEntity[0].KRASetId, "Y");
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                //foreach  employee insert the KRA set detials in to KRA Table
                foreach (var item in uploadKRAEmployeeSetEntity)
                {
                    foreach (var itemInner in uploadKRAMaster)
                    {
                        EmployeeKRA employeeKRA = new EmployeeKRA();
                        employeeKRA.AppraisalCycleId = item.AppraisalCycleId;
                        employeeKRA.CreatedBy = item.ApprovedBy;
                        employeeKRA.CreatedOn = DateTime.Now;
                        employeeKRA.EmployeeId = item.EmployeeId;
                        employeeKRA.ActionStep = itemInner.ActionStep;
                        employeeKRA.GoalDescription = itemInner.GoalDescription;
                        employeeKRA.GoalType = itemInner.GoalType;
                        employeeKRA.KRAFromDate = itemInner.KRAFromDate;
                        employeeKRA.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
                        employeeKRA.KRAToDate = itemInner.KRAToDate;
                        employeeKRA.Measure = itemInner.Measure;
                        employeeKRA.TargetDate = itemInner.TargetDate;
                        employeeKRA.Weightage = itemInner.Weightage;

                        employeeKRARepository.Insert(employeeKRA);
                    }
                }
            }

            return true;








        }
        public bool CopyKRA(int PreviousAppraisalCycleId, int CurrentAppraisalCycleId, int EmployeeId)
        {

            try
            { //Get the Previous Year KRAs
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    employeeKRA.EmployeeId = EmployeeId;
                    employeeKRA.AppraisalCycleId = PreviousAppraisalCycleId;
                    employeeKRA.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);

                    List<EmployeeKRA> NewemployeeKRA = employeeKRARepository.GetKRAToCopy(employeeKRA);
                    int Result = 0;
                    // get current Year Appraisal Cycle from and to date
                    AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                    var appraisalCycle = appraisalCycleBL.Get(CurrentAppraisalCycleId);

                    // Modify with Current AppraisalCyleId and Status as initiated
                    foreach (var item in NewemployeeKRA)
                    {
                        EmployeeKRA obj = new EmployeeKRA();
                        obj.ActionStep = item.ActionStep;
                        obj.AppraisalCycleId = CurrentAppraisalCycleId;
                        obj.EmployeeId = item.EmployeeId;
                        obj.GoalDescription = item.GoalDescription;
                        obj.GoalType = item.GoalType;
                        obj.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Initialised);
                        obj.IsSeen = 1;
                        obj.Measure = item.Measure;
                        obj.CreatedBy = EmployeeId;
                        obj.CreatedOn = DateTime.Now;
                        obj.ModifiedBy = EmployeeId;
                        obj.ModifiedOn = DateTime.Now;
                        obj.KRAFromDate = appraisalCycle.StartDate;
                        obj.KRAToDate = appraisalCycle.EndDate;
                        obj.TargetDate = appraisalCycle.EndDate;
                        obj.Weightage = item.Weightage;
                        Result = employeeKRARepository.Insert(obj);
                    }

                    if (Result > 0)
                        return true;
                    else
                        return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }



            // Call insert function

            // return true;
        }

        /// <summary>
        /// Get Employee Project Name by EmployeeId
        /// </summary>
        public string GetEmployeeProjectName(int employeeId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                try
                {
                    DataTable dtProjectName = employeeKRARepository.GetEmployeeProjectName(employeeId);
                    if (dtProjectName != null && dtProjectName.Rows.Count > 0)
                    {
                        return dtProjectName.Rows[0]["ProjectName"]?.ToString() ?? string.Empty;
                    }
                    return string.Empty;
                }
                catch (Exception ex)
                {
                    return string.Empty;
                }
            }
        }

        /// <summary>
        /// Get all active grades for dropdown
        /// </summary>
        public DataTable GetGradeList()
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                try
                {
                    return employeeKRARepository.GetGradeList();
                }
                catch (Exception ex)
                {
                    return null;
                }
            }
        }

        public List<ValidationsEntity> Validations(EmployeeKRAEntity employeeKRAEntity)
        {
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();

            //Date Validations
            ValidationHelper helper = new ValidationHelper();
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleMaster appraisalCycle = null;
                if (employeeKRAEntity.AppraisalCycleId != null && employeeKRAEntity.AppraisalCycleId > 0)
                {
                    appraisalCycle = appraisalCycleRepository.Get(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId));
                }

                // If AppraisalCycle not found, add validation error
                if (appraisalCycle == null)
                {
                    validationsEntity.Add(helper.CreateValidation("AppraisalCycleId", employeeKRAEntity.AppraisalCycleId?.ToString() ?? "null", "Invalid Appraisal Cycle ID."));
                    return validationsEntity; // Return early if AppraisalCycle is invalid
                }

                if (employeeKRAEntity.KRAFromDate == DateTime.MinValue)
                {
                    validationsEntity.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "Please select start date."));
                }
                if (employeeKRAEntity.KRAToDate == DateTime.MinValue)
                {
                    validationsEntity.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAToDate.ToString(), "Please select end date."));
                }
                // G&O from/to dates are set from the selected Appraisal cycle master; skip cycle-boundary checks (avoid false positives from date resolution/format).
                //if (employeeKRAEntity.KRAFromDate < appraisalCycle.StartDate)
                //{
                //    validationsEntity.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be greater than Appraisal cycle start date."));
                //}
                //if (employeeKRAEntity.KRAToDate > appraisalCycle.EndDate)
                //{
                //    validationsEntity.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAToDate.ToString(), "End date should be less than Appraisal cycle end date."));
                //}

                //if (employeeKRAEntity.KRAFromDate > appraisalCycle.EndDate)
                //{
                //    validationsEntity.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than Appraisal cycle end date."));
                //}
                if (employeeKRAEntity.KRAFromDate > employeeKRAEntity.KRAToDate)
                {
                    validationsEntity.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than to date."));
                }
                if (employeeKRAEntity.KRAStatusId == 4)
                {
                    if (employeeKRAEntity.KRAToDate > DateTime.Now)
                    {
                        validationsEntity.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAFromDate.ToString(), "Todate should be less than equals to todays date."));
                    }
                }

            }
            if ((employeeKRAEntity.Weightage <= 0) || (employeeKRAEntity.Weightage > 100))//Weighatage validation between 1 to 100
            {
                validationsEntity.Add(helper.CreateValidation("Weightage", employeeKRAEntity.Weightage.ToString(), "Weightage should be between 1 to 100."));
            }
            #region GoalValidations
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                string AppCycleId = "";

                EmployeeKRAEntity employeeKRAEntity_saved = new EmployeeKRAEntity();
                employeeKRAEntity_saved.AppraisalCycleId = employeeKRAEntity.AppraisalCycleId;
                employeeKRAEntity_saved.EmployeeId = employeeKRAEntity.EmployeeId;
                DataSet employeeKRA = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity_saved,
                                                                                new EmployeeKRA()), AppCycleId);
                string goaltype = employeeKRAEntity.GoalType;
                decimal weightage = Convert.ToDecimal(employeeKRAEntity.Weightage);
                int rowcountop = 0, rowcountdp = 0;
                decimal weightageop = 0.0M, weightagedp = 0.0M, weightagestrategic = 0.0M;
                //Approve
                // Assuming employeeKRA is the DataSet containing the data
                foreach (DataRow obj in employeeKRA.Tables[0].Rows)  // Accessing the first DataTable in the DataSet
                {
                    if (employeeKRAEntity.KRAId != Convert.ToInt32(obj["KRAId"]))  // Accessing the KRAId column in the DataRow
                    {
                        if (Convert.ToInt32(obj["KRAStatusId"]) != Convert.ToInt32(EnumCollection.KRA.Completed))  // Checking KRAStatusId
                        {
                            if (obj["GoalType"].ToString() == "O")  // Accessing GoalType column
                            {
                                rowcountop += 1;
                                weightageop += Convert.ToDecimal(obj["Weightage"]);  // Accessing Weightage column
                            }
                            if (obj["GoalType"].ToString() == "D")
                            {
                                weightagedp += Convert.ToDecimal(obj["Weightage"]);
                                rowcountdp += 1;
                            }
                            if (obj["GoalType"].ToString() == "S")
                            {
                                weightagestrategic += Convert.ToDecimal(obj["Weightage"]);
                            }
                        }
                    }

                    if (employeeKRAEntity.flag == -1)
                    {
                        if (Convert.ToInt32(obj["KRAStatusId"]) == Convert.ToInt32(EnumCollection.KRA.Initialised))  // Checking KRAStatusId for Initialized
                        {
                            validationsEntity.Add(helper.CreateValidation("Status", "Intialized KRA", "Employee KRAs are already in Initialized mode."));
                        }
                    }
                }

                if (goaltype == "O")
                {
                    rowcountop++;
                    weightageop += weightage;
                }
                else if (goaltype == "D")
                {
                    rowcountdp++;
                    weightagedp += weightage;
                }
                else if (goaltype == "S")
                {
                    weightagestrategic += weightage;
                }
                else
                {
                    rowcountdp++;
                    weightagedp += weightage;
                }
                //if (rowcountop > 6)
                //{
                //    validationsEntity.Add(helper.CreateValidation("GoalType", "Operational", "Maximum of 6 Operational Goals only!"));
                //}
                if ((weightageop + weightagedp + weightagestrategic) > 100)
                {
                    validationsEntity.Add(helper.CreateValidation("Weightage", Convert.ToString(weightagedp + weightageop + weightagestrategic), "Total weightage should be 100 to finalize the Goals."));
                }

            }
            #endregion GoalValidations
            return validationsEntity;
        }

        public List<ValidationsEntity> ValidationsSubmit(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId)
        {
            List<ValidationsEntity> validationsEntitylst = new List<ValidationsEntity>();
            EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
            employeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
            employeeKRAEntity.EmployeeId = ToEmployeeId;
            ValidationHelper helper = new ValidationHelper();
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                string SelfAssCycleId = "";
                DataSet employeeKRA = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity,
                                                                                new EmployeeKRA()), SelfAssCycleId);
                int rowcountop = 0, rowcountdp = 0, rowcountstrategic = 0;
                decimal weightageop = 0.0M, weightagedp = 0.0M, weightagestrategic = 0.0M;
                var statuscheck = 0;
                int totalGoalsCount = 0;

                // When approving, we need to validate ALL goals together (including already approved ones)
                // because approval applies to the entire goal set for the employee
                // Count ALL goals except Completed status
                foreach (DataRow obj in employeeKRA.Tables[0].Rows)  // Accessing the first DataTable in the DataSet
                {
                    int kraStatusId = obj["KRAStatusId"] != DBNull.Value ? Convert.ToInt32(obj["KRAStatusId"]) : 0;

                    // Exclude only Completed (4) goals from validation
                    // Include Initialised (1), Submitted (2), and Approved (3) goals in validation
                    if (kraStatusId != Convert.ToInt32(EnumCollection.KRA.Completed))
                    {
                        totalGoalsCount++;

                        decimal currentWeightage = Convert.ToDecimal(obj["Weightage"]);
                        string goalDescription = obj["GoalDescription"] != DBNull.Value ? obj["GoalDescription"].ToString() : string.Empty;
                        string goalType = obj["GoalType"] != DBNull.Value ? obj["GoalType"].ToString() : string.Empty;

                        // Validate Action Plan is filled for each goal
                        string actionPlan = obj["ActionPlan"] != DBNull.Value ? obj["ActionPlan"].ToString() : string.Empty;
                        if (string.IsNullOrWhiteSpace(actionPlan) && AppraisalCycleId > 11)
                        {
                            string goalTypeText = goalType == "O" ? "Operational" : (goalType == "D" ? "Developmental" : "Strategic");
                            string truncatedGoal = goalDescription.Length > 50 ? goalDescription.Substring(0, 50) + "..." : goalDescription;
                            validationsEntitylst.Add(helper.CreateValidation("ActionPlan", "", "Please update Action plan for all goals"));
                        }
                        // Validate minimum 10% weightage for each goal
                        if (currentWeightage < 10)
                        {
                            validationsEntitylst.Add(helper.CreateValidation("Weightage", currentWeightage.ToString(), "Each goal should have at least 10% Weightage."));
                        }

                        // If GoalType is "O" (Operational)
                        if (obj["GoalType"].ToString() == "O")
                        {
                            rowcountop += 1;
                            weightageop += currentWeightage;
                        }
                        // If GoalType is "D" (Developmental)
                        else if (obj["GoalType"].ToString() == "D")
                        {
                            weightagedp += currentWeightage;
                            rowcountdp += 1;
                        }
                        // If GoalType is "S" (Strategic)
                        else if (obj["GoalType"].ToString() == "S")
                        {
                            weightagestrategic += currentWeightage;
                            rowcountstrategic += 1;
                        }
                    }

                    // If KRAStatusId is "Approved"
                    if (kraStatusId == Convert.ToInt32(EnumCollection.KRA.Approved))
                    {
                        statuscheck++;
                    }
                }

                // Check if all goals are already approved
                if (statuscheck == totalGoalsCount && totalGoalsCount > 0)
                {
                    validationsEntitylst.Add(helper.CreateValidation("Status", "Approved KRA", "G&O's already approved."));
                    return validationsEntitylst; // Return early if all are approved
                }

                // Validate that we have at least one goal
                if (totalGoalsCount == 0)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalType", "No Goals", "No goals found for approval."));
                    return validationsEntitylst;
                }

                // Validate minimum total goal count (must have at least 4 goals: 2 Operational + 1 Developmental + 1 Strategic)
                if (totalGoalsCount < 4)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalCount", totalGoalsCount.ToString(), $"Please ensure that you have a minimum of 4 Goals before submitting. Currently you have {totalGoalsCount} goal(s)."));
                }

                // Validate Developmental Goal requirements
                if (rowcountdp < 1)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Developmental", "Please enter atleast one Developmental Goal"));
                }

                // Validate Operational Goal requirements (changed from 4 to 3)
                if (rowcountop < 2)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Operational", "Please ensure that you set a minimum of 2 Operational Goals."));
                }

                // Validate Strategic Goal requirements
                if (rowcountstrategic < 1 && AppraisalCycleId>11)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Strategic Goal (AI-Themed)", "Please enter atleast one Strategic Goal (AI-Themed)."));
                }

                // Validate Developmental Goal weightage (changed from 5% to 10%)
                if (weightagedp < 10)
                {
                    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Developmental", "Your Developmental Goal should have at least 10% Weightage."));
                }

                // Validate total weightage is exactly 100 (including Strategic goals)
                decimal totalWeightage = weightageop + weightagedp + weightagestrategic;
                if (totalWeightage != 100)
                {
                    validationsEntitylst.Add(helper.CreateValidation("Weightage", Convert.ToString(totalWeightage), "Total weightage should be 100 to finalize the Goals."));
                }

                //   }
            }
            return validationsEntitylst;
        }

        public List<ValidationsEntity> ValidationsTeamKRAUpdate(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, EmployeeKRAEntity employeeKRAEntity)
        {
            List<ValidationsEntity> validationsEntitylst = new List<ValidationsEntity>();

            ValidationHelper helper = new ValidationHelper();
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleMaster appraisalCycle = appraisalCycleRepository.Get(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId));

                if (employeeKRAEntity.KRAFromDate == DateTime.MinValue)
                {
                    validationsEntitylst.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "Please select start date."));
                }
                if (employeeKRAEntity.KRAToDate == DateTime.MinValue)
                {
                    validationsEntitylst.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAToDate.ToString(), "Please select end date."));
                }


                // G&O from/to dates are set from the selected Appraisal cycle master; skip cycle-boundary checks.
                //if (employeeKRAEntity.KRAFromDate < appraisalCycle.StartDate)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be greater than Appraisal cycle start date."));
                //}
                //if (employeeKRAEntity.KRAToDate > appraisalCycle.EndDate)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAToDate.ToString(), "End date should be less than Appraisal cycle end date."));
                //}

                //if (employeeKRAEntity.KRAFromDate > appraisalCycle.EndDate)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than Appraisal cycle end date."));
                //}
                if (employeeKRAEntity.KRAFromDate > employeeKRAEntity.KRAToDate)
                {
                    validationsEntitylst.Add(helper.CreateValidation("G&O's start Date", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than to date."));
                }
                if (employeeKRAEntity.KRAStatusId == 4)
                {
                    if (employeeKRAEntity.KRAToDate > DateTime.Now)
                    {
                        validationsEntitylst.Add(helper.CreateValidation("G&O's end Date", employeeKRAEntity.KRAFromDate.ToString(), "Todate should be less than equals to todays date."));
                    }
                }
            }
            if ((employeeKRAEntity.Weightage <= 0) || (employeeKRAEntity.Weightage > 100))//Weighatage validation between 1 to 100
            {
                validationsEntitylst.Add(helper.CreateValidation("Weightage", employeeKRAEntity.Weightage.ToString(), "Weightage should be between 1 to 100."));
            }
            #region GoalValidations
            using (var employeeKRARepository = new EmployeeKRARepository())
            {

                string SelfAssCycleId = "";
                EmployeeKRAEntity objemployeeKRAEntity = new EmployeeKRAEntity();
                objemployeeKRAEntity.AppraisalCycleId = AppraisalCycleId;
                objemployeeKRAEntity.EmployeeId = ToEmployeeId;


                // Get KRA data as DataSet
                DataSet employeeKRA = employeeKRARepository.GetKRA(
                    (EmployeeKRA)Utility.ConvertToObject(objemployeeKRAEntity, new EmployeeKRA()),
                    SelfAssCycleId
                );

                // Convert DataSet to List<EmployeeKRA> for easier manipulation (if necessary)
                List<EmployeeKRA> employeeKRAList = new List<EmployeeKRA>();
                foreach (DataRow row in employeeKRA.Tables[0].Rows)
                {
                    EmployeeKRA kra = (EmployeeKRA)Utility.ConvertToObject(row, new EmployeeKRA());
                    employeeKRAList.Add(kra);
                }

                // Remove the current KRAId from the list
                employeeKRAList = employeeKRAList.Where(note => note.KRAId != employeeKRAEntity.KRAId).ToList();

                // Add the updated KRAEntity to the list
                employeeKRAList.Add((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, new EmployeeKRA()));

                int rowcountop = 0, rowcountdp = 0;
                decimal weightageop = 0.0M, weightagedp = 0.0M, weightagestrategic = 0.0M;
                var statuscheck = 0;

                // employeeKRAList already includes the insert/update row once — sum O, D, S only (no double-count after loop)
                foreach (var obj in employeeKRAList)
                {
                    // Exclude Completed and Rejected from weight totals (Issue 28: rejected pack must not block team goal edits / totals)
                    if (obj.KRAStatusId != Convert.ToInt32(EnumCollection.KRA.Completed)
                        && obj.KRAStatusId != Convert.ToInt32(EnumCollection.KRA.Rejected))
                    {
                        if (obj.GoalType == "O")
                        {
                            rowcountop += 1;
                            weightageop += Convert.ToDecimal(obj.Weightage);
                        }
                        if (obj.GoalType == "D")
                        {
                            weightagedp += Convert.ToDecimal(obj.Weightage);
                            rowcountdp += 1;
                        }
                        if (obj.GoalType == "S")
                        {
                            weightagestrategic += Convert.ToDecimal(obj.Weightage);
                        }
                    }

                    if (obj.KRAStatusId == Convert.ToInt32(EnumCollection.KRA.Approved))
                    {
                        statuscheck++;
                    }
                }


                //if (statuscheck == employeeKRA.Count)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("Status", "Approved KRA", "KRAs already approved."));
                //}
                //if (rowcountdp < 1)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Developmental", "Please enter atleast one Developmental Goal"));
                //}
                // REMOVED: Minimum 4 operational goals validation from regular updates
                // This validation should ONLY apply during Submit/Approve actions, not during regular save/update
                // The validation is handled in ValidationsSubmit method which is called during Submit/Approve
                // if (rowcountop < 4 && employeeKRAEntity.KRAId > 0)
                // {
                //     validationsEntitylst.Add(helper.CreateValidation("GoalType", "Operational", "Please ensure that you set a minimum of 4 Operational Goal."));
                // }
                //if (weightagedp < 5)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Developmental", "Your Developmental Goal should have at least 5% Weightage."));
                //}

                if ((weightageop + weightagedp + weightagestrategic) != 100 && employeeKRA.Tables[0].Rows.Count == 6 && employeeKRAEntity.kraeditinsert == 1)
                {
                    validationsEntitylst.Add(helper.CreateValidation("Weightage", Convert.ToString(weightagedp + weightageop + weightagestrategic), "Total weightage should be 100 to finalize the Goals."));
                }
                if ((weightageop + weightagedp + weightagestrategic) > 100)
                {
                    validationsEntitylst.Add(helper.CreateValidation("Weightage", Convert.ToString(weightagedp + weightageop + weightagestrategic), "Total weightage should be 100 to finalize the Goals."));
                }
                //if (rowcountop > 6)
                //{
                //    validationsEntitylst.Add(helper.CreateValidation("GoalType", "Operational", "Maximum of 6 Operational Goals only!"));
                //}

            }


            #endregion
            return validationsEntitylst;
        }
        public List<ValidationsEntity> CopyKRAValidations(int PreviousAppraisalCycleId, int CurrentAppraisalCycleId, int EmployeeId)
        {
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();

            //Date Validations
            ValidationHelper helper = new ValidationHelper();
            if (CurrentAppraisalCycleId == PreviousAppraisalCycleId)
            {
                validationsEntity.Add(helper.CreateValidation("Appraisal Cycle", "", "This is Current Appraisal Cycle,Select other appraisalCyle to Copy G&O's."));
            }

            if (PreviousAppraisalCycleId <= 0)
            {
                validationsEntity.Add(helper.CreateValidation("Appraisal Cycle", "", "Please select Appraisal Cycle."));
            }

            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                employeeKRA.EmployeeId = EmployeeId;
                employeeKRA.AppraisalCycleId = CurrentAppraisalCycleId;
                // List<EmployeeKRA> CurrentemployeeKRA = employeeKRARepository.GetKRAToCopy(employeeKRA);
                List<EmployeeKRA> CurrentemployeeKRA = employeeKRARepository.ValidateKRAToCopy(employeeKRA);
                if (CurrentemployeeKRA.Count > 0)
                {
                    validationsEntity.Add(helper.CreateValidation("Appraisal Cycle", "", " Can't Copy G&O,G&O's already defined for current Appraisal Cycle."));
                }

                employeeKRA.AppraisalCycleId = PreviousAppraisalCycleId;
                employeeKRA.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
                List<EmployeeKRA> lemployeeKRA = employeeKRARepository.GetKRAToCopy(employeeKRA);
                if (lemployeeKRA.Count == 0)
                {
                    validationsEntity.Add(helper.CreateValidation("Appraisal Cycle", "", "No G&O found for selected Appraisal Cycle."));
                }
            }

            return validationsEntity;
        }

        #endregion

        #region "Private Methods"

        private DataSet GetKRAForManagersFeedback(EmployeeKRAEntity employeeKRAEntity, int selectedyear) //Picks KRAs for Manager to give rating to employee employee
        {
            DataSet ds = null;
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    ds = employeeKRARepository.GetSubmittedorApprovedKRAForManagersFeedback((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA), selectedyear);
                    //foreach (var item in getEmployeeKRA)
                    //{
                    //    item.GoalType = item.GoalType == "O" ? "Operational" : "Developmental";
                    //}
                    return ds;
                    //return Utility.ConvertToList<EmployeeKRA, EmployeeKRAEntity>(getEmployeeKRA);

                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        //private List<EmployeeKRAEntity> GetKRAForManagerApproval(EmployeeKRAEntity employeeKRAEntity)
        //{
        //    try
        //    {
        //        using (var employeeKRARepository = new EmployeeKRARepository())
        //        {
        //            EmployeeKRA employeeKRA = new EmployeeKRA();
        //            List<EmployeeKRA> getEmployeeKRA = employeeKRARepository.GetKRAForManagersApproval((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA));
        //            foreach (var item in getEmployeeKRA)
        //            {
        //                item.GoalType = item.GoalType == "O" ? "Operational" : "Developmental";
        //            }
        //            return Utility.ConvertToList<EmployeeKRA, EmployeeKRAEntity>(getEmployeeKRA);

        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return null;
        //    }
        //}
        private DataSet GetKRAForManagerApproval(EmployeeKRAEntity employeeKRAEntity)
        {
            DataSet ds = null;
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                ds = employeeKRARepository.GetKRAForManagersApproval((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA));
            }

            return ds;
        }

        //private DataSet GetEmployeeKRA(EmployeeKRAEntity employeeKRAEntity, string SelfAssCycleId) //picks all KRAs of a specific employee
        //{
        //    try
        //    {
        //        using (var employeeKRARepository = new EmployeeKRARepository())
        //        {
        //            EmployeeKRA employeeKRA = new EmployeeKRA();
        //            List<EmployeeKRA> getEmployeeKRA = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA), SelfAssCycleId);
        //            return Utility.ConvertToList<EmployeeKRA, EmployeeKRAEntity>(getEmployeeKRA);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return null;
        //    }
        //}
        private DataSet GetEmployeeKRA(EmployeeKRAEntity employeeKRAEntity, string SelfAssCycleId)//picks all KRAs of a specific employee
        {
            DataSet ds = null;
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                EmployeeKRA employeeKRA = new EmployeeKRA();
                ds = employeeKRARepository.GetKRA((EmployeeKRA)Utility.ConvertToObject(employeeKRAEntity, employeeKRA), SelfAssCycleId);
            }

            return ds;
        }

        /// <summary>
        /// Get all KRAs for an employee and appraisal cycle (simplified for Copy KRA functionality)
        /// Only requires AppraisalCycleId and EmployeeId - no status or other filters
        /// </summary>
        public DataSet GetKRAsForCopy(int appraisalCycleId, int employeeId)
        {
            DataSet ds = null;
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    ds = employeeKRARepository.GetKRAsForCopy(appraisalCycleId, employeeId);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal(sectionName, "GetKRAsForCopy", ex.Message);
                throw;
            }

            return ds;
        }


        /// <summary>
        /// Sends Goal Submit/Approve/Reject notification emails.
        /// Actual recipient: Manager (Submit) or Employee (Approve/Reject). Non-production Environment + OverrideMailToTest: Utility.SendMail replaces recipients.
        /// For approval, optional approvalTemplateIdOverride: 25 = Goals Approved (employee's goals), 26 = Goals Modified and Approved (RM modified then approved), 27 = Goals Added and Approved (RM added then approved).
        /// </summary>
        private void SendMail(int ManagerId, int EmployeeId, int? statusId, int? approvalTemplateIdOverride = null)
        {
            EmailTemplateMasterBL objBL = new EmailTemplateMasterBL();
            EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();

            GetEmpDetailsByEmpId_ResultEntity EmployeeDetails = employeeMasterBL.GetEmployeeDetailsForEmail(EmployeeId);
            GetEmpDetailsByEmpId_ResultEntity ManagersDetails = employeeMasterBL.GetEmployeeDetailsForEmail(ManagerId);

            int TemplateId = 0;
            if (statusId == Convert.ToInt32(EnumCollection.KRA.Submitted))
            {
                TemplateId = 2;
            }
            if (statusId == Convert.ToInt32(EnumCollection.KRA.Approved))
            {
                TemplateId = approvalTemplateIdOverride ?? 25; // 25 = Goals Approved, 26 = Modified and Approved, 27 = Added and Approved
            }
            if (statusId == Convert.ToInt32(EnumCollection.KRA.Rejected))
            {
                TemplateId = 4;
            }

            EmailTemplateMasterEntity emailTemplateMasterEntity = objBL.Get(TemplateId);
            // If approval template 26/27 not found in DB, fall back to 25 (Goals Approved)
            if (emailTemplateMasterEntity == null && statusId == Convert.ToInt32(EnumCollection.KRA.Approved) && TemplateId != 25)
            {
                emailTemplateMasterEntity = objBL.Get(25);
            }
            var fromaddress = ConfigurationManager.AppSettings["PEPMailAddress"].ToString();

            if (statusId == Convert.ToInt32(EnumCollection.KRA.Submitted))
            {
                // Recipient: Manager. Non-production Environment + OverrideMailToTest: Utility.SendMail replaces To.
                // MailMessage(fromaddress, ManagersDetails.EmailAddress);
                MailMessage message = new MailMessage(fromaddress, ManagersDetails.EmailAddress);
                emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("#EMPName#", EmployeeDetails.FirstName + ' ' + EmployeeDetails.LastName + '(' + EmployeeDetails.NewEmployeeCode.Trim() + ')');
                emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#ManagerName#", ManagersDetails.FirstName + ' ' + ManagersDetails.LastName);
                emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#EMPName#", EmployeeDetails.FirstName + ' ' + EmployeeDetails.LastName + '(' + EmployeeDetails.NewEmployeeCode.Trim() + ')');
                message.Subject = emailTemplateMasterEntity.Subject;
                message.Body = emailTemplateMasterEntity.Body;
                message.IsBodyHtml = true;
                Utility.SendMail(message);
            }
            if ((statusId == Convert.ToInt32(EnumCollection.KRA.Approved)) || (statusId == Convert.ToInt32(EnumCollection.KRA.Rejected)))
            {
                // Recipient: Employee. Non-production Environment + OverrideMailToTest: Utility.SendMail replaces To.
                // MailMessage(fromaddress, EmployeeDetails.EmailAddress);
                MailMessage message = new MailMessage(fromaddress, EmployeeDetails.EmailAddress);

                if (statusId == Convert.ToInt32(EnumCollection.KRA.Approved))
                {
                    // For approved status, use template ID 25 with placeholders: {{EmployeeName}}, {{RMName}}, {{RMID}}
                    string empName = EmployeeDetails.FirstName + ' ' + EmployeeDetails.LastName;
                    string rmName = ManagersDetails.FirstName + ' ' + ManagersDetails.LastName;
                    string rmId = ManagersDetails.NewEmployeeCode.Trim();

                    // Replace placeholders in subject and body
                    // Template uses: {{EmployeeName}}, {{RMName}}, {{RMID}}
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("{{EmployeeName}}", empName);
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("{{RMName}}", rmName);
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("{{RMID}}", rmId);

                    // Also support legacy placeholders for backward compatibility
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("#EMPName#", empName);
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("EMP Name", empName);
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("#RMName#", rmName + " (" + rmId + ")");

                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("{{EmployeeName}}", empName);
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("{{RMName}}", rmName);
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("{{RMID}}", rmId);

                    // Also support legacy placeholders for backward compatibility
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#EMPName#", empName);
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("EMP Name", empName);
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#RMName#", rmName + " (" + rmId + ")");
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("RM Name (RM ID)", rmName + " (" + rmId + ")");
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("<RM Name (RM ID)>", rmName + " (" + rmId + ")");
                }
                else
                {
                    // For rejected status, keep existing logic
                    emailTemplateMasterEntity.Subject = emailTemplateMasterEntity.Subject.Replace("#ManagerName#", ManagersDetails.FirstName + ' ' + ManagersDetails.LastName + '-' + ManagersDetails.NewEmployeeCode.Trim());
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#ManagerName#", ManagersDetails.FirstName + ' ' + ManagersDetails.LastName + '-' + ManagersDetails.NewEmployeeCode.Trim());
                    emailTemplateMasterEntity.Body = emailTemplateMasterEntity.Body.Replace("#EMPName#", EmployeeDetails.FirstName + ' ' + EmployeeDetails.LastName);
                }

                message.Subject = emailTemplateMasterEntity.Subject;
                message.Body = emailTemplateMasterEntity.Body;
                message.IsBodyHtml = true;
                Utility.SendMail(message);
            }



        }

        /// <summary>
        /// Validate if Add Goal button should be shown using stored procedure
        /// </summary>
        public CanAddGoalResultEntity ValidateCanAddGoal(int employeeId, int appraisalCycleId, string subcycle = null)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.ValidateCanAddGoal(employeeId, appraisalCycleId, subcycle);
            }
        }

        /// <summary>
        /// Validate if Add Goal button should be shown for managers.
        /// Cycle must be active and total weight (Init/Submitted/Approved/Rejected — all except Completed) must be &lt; 100.
        /// Rejected (18) rows still consume weight until removed or edited.
        /// </summary>
        public CanAddGoalResultEntity ValidateCanAddGoalForManager(int employeeId, int appraisalCycleId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                using (var appraisalCycleRepository = new AppraisalCycleRepository())
                {
                    // Check if appraisal cycle is active
                    var appraisalCycle = appraisalCycleRepository.Get(appraisalCycleId);
                    bool isCycleActive = false;
                    int completedStatusId = Convert.ToInt32(EnumCollection.KRA.Completed);
                    if (appraisalCycle != null)
                    {
                        // Check if cycle is active (between start and end date, and IsActive flag)
                        DateTime now = DateTime.Now;
                        isCycleActive = appraisalCycle.IsActive == 1
                            && appraisalCycle.StartDate <= now
                            && appraisalCycle.EndDate >= now;
                    }

                    // Get total weightage for the employee in this cycle
                    
                    // Total weightage: all goals except Completed (4) — includes Rejected (18)
                    decimal totalWeightage = 0;
                    var kraData = employeeKRARepository.GetKRA(
                        new EmployeeKRA { EmployeeId = employeeId, AppraisalCycleId = appraisalCycleId },
                        ""
                    );
                    if (kraData != null && kraData.Tables.Count > 0 && kraData.Tables[0].Rows.Count > 0)
                    {
                        foreach (DataRow row in kraData.Tables[0].Rows)
                        {
                            int statusId = row["KRAStatusId"] != DBNull.Value ? Convert.ToInt32(row["KRAStatusId"]) : 0;
                            if (statusId == completedStatusId)
                                continue;
                            if (row["Weightage"] != DBNull.Value)
                            {
                                totalWeightage += Convert.ToDecimal(row["Weightage"]);
                            }
                        }
                    }
                    
                    bool underWeightCap = totalWeightage < 100M;
                    bool canAddGoal = isCycleActive && underWeightCap;
                    
                    return new CanAddGoalResultEntity
                    {
                        CanAddGoal = canAddGoal,
                        IsCycleActive = isCycleActive,
                        HasInitializedKRA = kraData != null && kraData.Tables.Count > 0 && kraData.Tables[0].Rows.Count > 0,
                        TotalWeightage = totalWeightage,
                        Message = canAddGoal
                            ? "You can add goals"
                            : (!isCycleActive
                                ? "Appraisal cycle is not active"
                                : (!underWeightCap ? "Total weightage is already 100%. Remove or edit goals before adding new ones." : "Cannot add goals"))
                    };
                }
            }
            catch (Exception ex)
            {
                // Log exception (ExceptionLogging is internal to Repository, so we can't access it here)
                // ExceptionLogging.SendExcepToDB(ex, sectionName, "ValidateCanAddGoalForManager");
                return new CanAddGoalResultEntity
                {
                    CanAddGoal = false,
                    IsCycleActive = false,
                    HasInitializedKRA = false,
                    TotalWeightage = 0,
                    Message = "Error validating: " + ex.Message
                };
            }
        }

        /// <summary>
        /// Validate if Goal Modification Request button should be shown using stored procedure
        /// </summary>
        public CanRequestGoalModificationResultEntity ValidateCanRequestGoalModification(int employeeId, int appraisalCycleId, string cycle = null)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.ValidateCanRequestGoalModification(employeeId, appraisalCycleId, cycle);
            }
        }

        /// <summary>
        /// Update attachment path for a KRA
        /// </summary>
        public bool UpdateAttachmentPath(int kraId, string attachmentPath)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.UpdateAttachmentPath(kraId, attachmentPath);
            }
        }

        /// <summary>
        /// Get attachment path for a KRA
        /// </summary>
        public string GetAttachmentPath(int kraId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetAttachmentPath(kraId);
            }
        }

        /// <summary>
        /// Get all attachment paths for an employee in a specific appraisal cycle
        /// </summary>
        public List<KRAAttachmentEntity> GetAllAttachmentPaths(int employeeId, int appraisalCycleId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetAllAttachmentPaths(employeeId, appraisalCycleId);
            }
        }

        /// <summary>
        /// Reject all KRAs for an employee using stored procedure for better performance.
        /// Sends reject notification; non-production Environment + OverrideMailToTest redirects via Utility.SendMail.
        /// </summary>
        public bool RejectEmployeeKRA(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                bool isRejected = employeeKRARepository.RejectEmployeeKRA(employeeId, appraisalCycleId, modifiedBy);
                if (isRejected)
                {
                    try
                    {
                        int rejectedStatusId = Convert.ToInt32(EnumCollection.KRA.Rejected);
                        SendMail(modifiedBy, employeeId, rejectedStatusId);
                        logService.Info(sectionName, "RejectEmployeeKRA", $"Reject email sent for EmployeeId: {employeeId} after reject by ManagerId: {modifiedBy}");
                    }
                    catch (Exception ex)
                    {
                        logService.Fatal(sectionName, "RejectEmployeeKRA - SendMail", $"Error sending reject email: {ex.Message}");
                    }
                }
                return isRejected;
            }
        }

        public bool ApproveEmployeeKRA(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                // Snapshot CreatedBy/ModifiedBy BEFORE the approval SP stamps ModifiedBy = RM on every row
                int? approvalTemplateId = null;
                try
                {
                    var preApprovalKRAs = employeeKRARepository.GetApprovedKRAsCreatedByModifiedBy(employeeId, appraisalCycleId);
                    if (preApprovalKRAs != null && preApprovalKRAs.Count > 0)
                    {
                        bool anyAddedByRm = preApprovalKRAs.Any(k => k.CreatedBy.HasValue && k.CreatedBy.Value == modifiedBy);
                        bool anyModifiedByRm = preApprovalKRAs.Any(k => k.ModifiedBy.HasValue && k.ModifiedBy.Value == modifiedBy);
                        if (anyAddedByRm)
                            approvalTemplateId = 27; // Goals & Objectives Added and Approved
                        else if (anyModifiedByRm)
                            approvalTemplateId = 26; // Goals & Objectives Modified and Approved
                        else
                            approvalTemplateId = 25; // Goals & Objectives Approved
                    }
                }
                catch (Exception ex)
                {
                    logService.Fatal(sectionName, "ApproveEmployeeKRA - TemplateDetection", $"Error detecting template: {ex.Message}");
                    approvalTemplateId = 25;
                }

                bool isApproved = employeeKRARepository.ApproveEmployeeKRA(employeeId, appraisalCycleId, modifiedBy);

                logService.Info(sectionName, "ApproveEmployeeKRA", $"Approval result for EmployeeId: {employeeId}, AppraisalCycleId: {appraisalCycleId}, IsApproved: {isApproved}");
                
                if (isApproved)
                {
                    try
                    {
                        int approvedStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
                        SendMail(modifiedBy, employeeId, approvedStatusId, approvalTemplateId);
                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Email sent successfully to EmployeeId: {employeeId} after approval by ManagerId: {modifiedBy}, TemplateId: {approvalTemplateId ?? 25}");
                    }
                    catch (Exception ex)
                    {
                        logService.Fatal(sectionName, "ApproveEmployeeKRA - SendMail", $"Error sending approval email: {ex.Message}");
                    }
                }

                // If approval was successful, process training requests for approved KRAs that have TrainingItemId set
                if (isApproved)
                {
                    try
                    {
                        // Get all approved KRAs for this employee in this appraisal cycle that have TrainingItemId set
                        var approvedKRAs = employeeKRARepository.GetApprovedKRAsWithTraining(employeeId, appraisalCycleId);

                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Found {approvedKRAs?.Count ?? 0} approved KRAs with training requirements for EmployeeId: {employeeId}, AppraisalCycleId: {appraisalCycleId}");

                        // Process training requests in batches instead of individually
                        // Separate regular trainings (training_id != 0) and custom trainings (training_id == 0)
                        if (approvedKRAs != null && approvedKRAs.Count > 0)
                        {
                            // Get employee code once for all requests
                            string employeeCode = null;
                            using (var employeeKRARepositoryForCode = new EmployeeKRARepository())
                            {
                                employeeCode = employeeKRARepositoryForCode.GetEmployeeCode(employeeId);
                                if (string.IsNullOrEmpty(employeeCode))
                                {
                                    logService.Fatal(sectionName, "ApproveEmployeeKRA", $"OldEmployeeCode not found for EmployeeId: {employeeId}");
                                    return isApproved;
                                }
                            }

                            // Collections for batch processing
                            List<string> regularTrainingTypes = new List<string>();
                            List<string> regularTrainingIds = new List<string>();
                            List<int> regularKRAIds = new List<int>(); // Track KRA IDs for logging

                            List<string> customCourseNames = new List<string>();
                            List<string> customCourseCategories = new List<string>();
                            List<int> customKRAIds = new List<int>(); // Track KRA IDs for logging

                            using (var trainingRepository = new TrainingRepository())
                            {
                                foreach (var kra in approvedKRAs)
                                {
                                    logService.Info(sectionName, "ApproveEmployeeKRA", $"Processing KRAId: {kra.KRAId}, TrainingItemId: {kra.TrainingItemId ?? "NULL"}, TrainingRequirementName: {kra.TrainingRequirementName ?? "NULL"}");

                                    // TrainingItemId is now a comma-separated string of IDs
                                    if (!string.IsNullOrEmpty(kra.TrainingItemId) && !string.IsNullOrEmpty(kra.TrainingRequirementName))
                                    {
                                        try
                                        {
                                            // Parse comma-separated training IDs, names, and categories
                                            string[] trainingIds = kra.TrainingItemId.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                                            string[] trainingNames = kra.TrainingRequirementName.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                                            string[] trainingCategories = null;

                                            // Parse TrainingCategory if available (comma-separated categories)
                                            if (!string.IsNullOrEmpty(kra.TrainingCategory))
                                            {
                                                trainingCategories = kra.TrainingCategory.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                                            }

                                            // Ensure all arrays have the same length
                                            int minLength = Math.Min(trainingIds.Length, trainingNames.Length);

                                            for (int i = 0; i < minLength; i++)
                                            {
                                                string trainingIdStr = trainingIds[i].Trim();
                                                string trainingName = trainingNames[i].Trim();

                                                if (int.TryParse(trainingIdStr, out int trainingId))
                                                {
                                                    if (trainingId == 0)
                                                    {
                                                        // Custom training (training_id == 0)
                                                        // Use TrainingCategory if available, otherwise fall back to TrainingRequirementName
                                                        string categoryName = trainingName.Trim();
                                                        string courseName = trainingName.Trim();

                                                        // If TrainingCategory is available, use it for category
                                                        if (trainingCategories != null && i < trainingCategories.Length && !string.IsNullOrEmpty(trainingCategories[i].Trim()))
                                                        {
                                                            categoryName = trainingCategories[i].Trim();
                                                        }

                                                        // Check if the trainingName contains a colon separator (Category:CourseName format)
                                                        if (trainingName.Contains(":"))
                                                        {
                                                            string[] parts = trainingName.Split(new[] { ':' }, 2);
                                                            if (parts.Length == 2)
                                                            {
                                                                // If category not stored separately, use parsed category
                                                                if (trainingCategories == null || i >= trainingCategories.Length || string.IsNullOrEmpty(trainingCategories[i].Trim()))
                                                                {
                                                                    categoryName = parts[0].Trim();
                                                                }
                                                                courseName = parts[1].Trim();
                                                            }
                                                        }

                                                        // Use the stored category name or fall back to trainingName
                                                        customCourseNames.Add(courseName);
                                                        customCourseCategories.Add(categoryName);
                                                        customKRAIds.Add(kra.KRAId);
                                                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Added custom training for KRAId: {kra.KRAId}, CourseName: {courseName}, Category: {categoryName}");
                                                    }
                                                    else
                                                    {
                                                        // Regular training (training_id != 0)
                                                        string trainingType = trainingRepository.GetTrainingTypeByTrainingId(trainingId);
                                                        if (!string.IsNullOrEmpty(trainingType))
                                                        {
                                                            regularTrainingTypes.Add(trainingType.ToLower());
                                                            regularTrainingIds.Add(trainingId.ToString());
                                                            regularKRAIds.Add(kra.KRAId);
                                                            logService.Info(sectionName, "ApproveEmployeeKRA", $"Added regular training for KRAId: {kra.KRAId}, TrainingId: {trainingId}, TrainingType: {trainingType}");
                                                        }
                                                        else
                                                        {
                                                            logService.Fatal(sectionName, "ApproveEmployeeKRA", $"Training type not found for TrainingId: {trainingId} in KRAId: {kra.KRAId}");
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    logService.Info(sectionName, "ApproveEmployeeKRA", $"Skipping invalid TrainingId format: {trainingIdStr} for KRAId: {kra.KRAId}");
                                                }
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            // Log error but continue processing other KRAs
                                            logService.Fatal(sectionName, "ProcessTrainingRequest in ApproveEmployeeKRA", $"Error processing training request for KRAId {kra.KRAId}: {ex.Message}");
                                        }
                                    }
                                    else
                                    {
                                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Skipping KRAId {kra.KRAId} - TrainingItemId or TrainingRequirementName is NULL or empty");
                                    }
                                }
                            }

                            // Process batch requests
                            var trainingService = new TrainingRequestService();

                            // Batch process regular trainings (training_id != 0)
                            if (regularTrainingTypes.Count > 0 && regularTrainingIds.Count > 0)
                            {
                                try
                                {
                                    string batchTrainingTypes = string.Join(",", regularTrainingTypes);
                                    string batchTrainingIds = string.Join(",", regularTrainingIds);

                                    logService.Info(sectionName, "ApproveEmployeeKRA", $"Calling batch API for regular trainings: training_type={batchTrainingTypes}, training_id={batchTrainingIds}, emp_id={employeeCode}");

                                    var apiResponse = trainingService.CreateBatchTrainingRequest(batchTrainingTypes, batchTrainingIds, employeeCode);

                                    // Store tracking for each KRA in the batch (regardless of success to track the attempt)
                                    using (var employeeKRARepositoryForBatch = new EmployeeKRARepository())
                                    {
                                        // Store tracking for all KRAs in the batch
                                        foreach (int kraId in regularKRAIds.Distinct())
                                        {
                                            // For batch requests, we need to create a custom API response structure
                                            // The SaveTrainingRequestTracking method expects TrainingRequestAPIResponse
                                            // We'll modify the trainingType to include batch info and use trainingId = 0
                                            var batchApiResponse = new TrainingRequestAPIResponse
                                            {
                                                success = apiResponse.success,
                                                message = apiResponse.message,
                                                isDuplicate = apiResponse.isDuplicate,
                                                data = apiResponse.data
                                            };

                                            // Store batch info in trainingType field (format: "batch:types:ids")
                                            string batchTrainingType = $"batch:{batchTrainingTypes}:{batchTrainingIds}";

                                            employeeKRARepositoryForBatch.SaveTrainingRequestTracking(
                                                kraId, employeeId, employeeCode, 0, // trainingId = 0 for batch
                                                batchTrainingType, // trainingType = batch info
                                                batchApiResponse, modifiedBy);
                                        }
                                    }

                                    if (apiResponse.success && !apiResponse.isDuplicate)
                                    {
                                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Successfully processed batch regular training requests for {regularTrainingIds.Count} trainings");
                                    }
                                    else
                                    {
                                        logService.Fatal(sectionName, "ApproveEmployeeKRA", $"Batch regular training API call failed or duplicate: {apiResponse.message}");
                                    }
                                }
                                catch (Exception ex)
                                {
                                    logService.Fatal(sectionName, "ApproveEmployeeKRA - BatchRegularTrainings", $"Error: {ex.Message}");
                                }
                            }

                            // Batch process custom trainings (training_id == 0)
                            if (customCourseNames.Count > 0 && customCourseCategories.Count > 0)
                            {
                                try
                                {
                                    string batchCourseNames = string.Join(",", customCourseNames);
                                    string batchCourseCategories = string.Join(",", customCourseCategories);

                                    logService.Info(sectionName, "ApproveEmployeeKRA", $"Calling batch custom API: course_name={batchCourseNames}, course_category={batchCourseCategories}, emp_id={employeeCode}");

                                    var apiResponse = trainingService.CreateBatchCustomTrainingRequest(batchCourseNames, batchCourseCategories, employeeCode);

                                    // Store tracking for each KRA (regardless of success to track the attempt)
                                    using (var employeeKRARepositoryForCustom = new EmployeeKRARepository())
                                    {
                                        foreach (int kraId in customKRAIds.Distinct())
                                        {
                                            // For custom batch requests, store batch info in trainingType
                                            // Format: "custom:course_names:course_categories"
                                            string customTrainingType = $"custom:{batchCourseNames}:{batchCourseCategories}";

                                            employeeKRARepositoryForCustom.SaveTrainingRequestTracking(
                                                kraId, employeeId, employeeCode, 0, // trainingId = 0 for custom
                                                customTrainingType, // trainingType = custom with batch info
                                                apiResponse, modifiedBy);
                                        }
                                    }

                                    if (apiResponse.success && !apiResponse.isDuplicate)
                                    {
                                        logService.Info(sectionName, "ApproveEmployeeKRA", $"Successfully processed batch custom training requests for {customCourseNames.Count} trainings");
                                    }
                                    else
                                    {
                                        logService.Fatal(sectionName, "ApproveEmployeeKRA", $"Batch custom training API call failed or duplicate: {apiResponse.message}");
                                    }
                                }
                                catch (Exception ex)
                                {
                                    logService.Fatal(sectionName, "ApproveEmployeeKRA - BatchCustomTrainings", $"Error: {ex.Message}");
                                }
                            }
                        }
                        else
                        {
                            logService.Info(sectionName, "ApproveEmployeeKRA", $"No approved KRAs with training requirements found for EmployeeId: {employeeId}, AppraisalCycleId: {appraisalCycleId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log error but don't fail the approval
                        logService.Fatal(sectionName, "ApproveEmployeeKRA - ProcessTrainingRequests", ex.Message);
                    }
                }

                return isApproved;
            }
        }

        /// <summary>
        /// Process training request by calling external API and storing the response
        /// Handles both regular trainings and "Others" (TrainingItemId = 0)
        /// </summary>
        private void ProcessTrainingRequest(int kraId, int employeeId, int trainingId, int? createdBy)
        {
            try
            {
                string trainingType = null;

                // Handle "Others" (TrainingItemId = 0) - use default training type
                if (trainingId == 0)
                {
                    // For "Others", use "course" as default training type
                    trainingType = "course";
                    logService.Info(sectionName, "ProcessTrainingRequest", $"Processing 'Others' training request for KRAId: {kraId}, using default training type: {trainingType}");
                }
                else
                {
                    // Get training type from IPE_Training_List for regular trainings
                    using (var trainingRepository = new TrainingRepository())
                    {
                        trainingType = trainingRepository.GetTrainingTypeByTrainingId(trainingId);

                        if (string.IsNullOrEmpty(trainingType))
                        {
                            logService.Fatal(sectionName, "ProcessTrainingRequest", $"Training type not found for TrainingId: {trainingId}");
                            return;
                        }
                    }
                }

                // Get OldEmployeeCode from EmployeeMaster table using stored procedure
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    string employeeCode = employeeKRARepository.GetEmployeeCode(employeeId);

                    if (string.IsNullOrEmpty(employeeCode))
                    {
                        logService.Fatal(sectionName, "ProcessTrainingRequest", $"OldEmployeeCode not found for EmployeeId: {employeeId}");
                        return;
                    }

                    // Call external API
                    var trainingService = new TrainingRequestService();
                    var apiResponse = trainingService.CreateTrainingRequest(
                        trainingType.ToLower(),
                        trainingId.ToString(),
                        employeeCode);

                    // Store the response in tracking table (only if not duplicate)
                    if (!apiResponse.isDuplicate)
                    {
                        employeeKRARepository.SaveTrainingRequestTracking(kraId, employeeId, employeeCode, trainingId, trainingType, apiResponse, createdBy);
                    }
                    else
                    {
                        logService.Info(sectionName, "ProcessTrainingRequest", $"Duplicate training request detected for KRAId: {kraId}, TrainingId: {trainingId}. Skipping tracking table entry.");
                    }
                }
            }
            catch (Exception ex)
            {
                logService.Fatal(sectionName, "ProcessTrainingRequest", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Check if Reference Goal Master is accessible for employee
        /// </summary>
        public DataSet GetReferenceGoalMasterAccessable(string EmployeeId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetReferenceGoalMasterAccessable(EmployeeId);
            }
        }

        /// <summary>
        /// Get Reference Goal Master data by GradeId and EmpUnitId
        /// </summary>
        public DataSet GetReferenceGoalMaster(int GradeId, int? EmpUnitId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetReferenceGoalMaster(GradeId, EmpUnitId);
            }
        }

        #endregion
        public bool CheckCustomReferenceGoalExists(int employeeId, int appraisalCycleId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.CheckCustomReferenceGoalExists(employeeId, appraisalCycleId);
            }
        }
        /// <summary>
        /// Insert a new custom reference goal
        /// </summary>
        public int InsertCustomReferenceGoal(int employeeId, int appraisalCycleId, string roleDescription, string skillsUsed, string projectDetails, int createdBy)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.InsertCustomReferenceGoal(employeeId, appraisalCycleId,
                    roleDescription, skillsUsed, projectDetails, createdBy);
            }
        }

        /// <summary>
        /// Get custom reference goals by employee and appraisal cycle
        /// </summary>
        public DataTable GetCustomReferenceGoalsByEmployee(int employeeId, int appraisalCycleId)
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetCustomReferenceGoalsByEmployee(employeeId, appraisalCycleId);
            }
        }

        /// <summary>
        /// Get all active sub-skills
        /// </summary>
        public DataTable GetAllSubSkills()
        {
            using (var employeeKRARepository = new EmployeeKRARepository())
            {
                return employeeKRARepository.GetAllSubSkills();
            }
        }
    }

}

