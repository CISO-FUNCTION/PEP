using EmpPEP.Framework.Helper;
using EmpPEP.Repository.common;
using EmpPEP.BusinessEntities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Data.Entity.Core.EntityClient;

namespace EmpPEP.Repository.UnitOfWorks
{
    /// <summary>
    /// EmployeeKRA Repository using pure ADO.NET (no Entity Framework)
    /// All operations use stored procedures and DataSets
    /// </summary>
    public class EmployeeKRARepositoryADO : BaseDispose
    {
        private string sectionName = "EmployeeKRARepositoryADO";
        private DataUtility du;

        public EmployeeKRARepositoryADO()
        {
            du = new DataUtility();
        }

        #region Dispose Pattern
        protected override void Dispose(bool disposing)
        {
            // Cleanup if needed
            base.Dispose(disposing);
        }
        #endregion

        /// <summary>
        /// Get EmployeeKRA by ID using stored procedure and DataSet
        /// </summary>
        public DataSet GetKRAById(int kraId)
        {
            DataSet ds = new DataSet();
            
            try
            {
                // Ensure connection is opened
                OpeneConnection();
                
                // Verify connection is open before using it
                if (ConCampus == null)
                {
                    throw new Exception("Connection object is null");
                }
                
                if (ConCampus.State != System.Data.ConnectionState.Open)
                {
                    ConCampus.Open();
                }
                
                using (SqlCommand cmd = new SqlCommand("usp_GetEmployeeKRAById", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = kraId;
                    
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(ds);
                        if (ds.Tables.Count > 0)
                        {
                            ds.Tables[0].TableName = "EmployeeKRA";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAById");
                throw new Exception($"Error getting KRA {kraId}: {ex.Message}", ex);
            }
            finally
            {
                // Only close if we opened it in this method
                if (ConCampus != null && ConCampus.State == System.Data.ConnectionState.Open)
                {
                    CloseConnection();
                }
            }
            
            return ds;
        }

        /// <summary>
        /// Insert EmployeeKRA using stored procedure
        /// Returns the new KRAId
        /// </summary>
        public int InsertKRA(EmployeeKRAEntity entity)
        {
            int newKRAId = 0;
            
            try
            {
                // Ensure connection is opened
                OpeneConnection();
                
                // Verify connection is open before using it
                if (ConCampus == null)
                {
                    throw new Exception("Connection object is null");
                }
                
                if (ConCampus.State != System.Data.ConnectionState.Open)
                {
                    ConCampus.Open();
                }
                
                using (SqlCommand cmd = new SqlCommand("usp_InsertEmployeeKRA", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // Add all parameters
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = entity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = entity.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAFromDate", SqlDbType.DateTime)).Value = entity.KRAFromDate;
                    cmd.Parameters.Add(new SqlParameter("@KRAToDate", SqlDbType.DateTime)).Value = entity.KRAToDate;
                    cmd.Parameters.Add(new SqlParameter("@GoalType", SqlDbType.NVarChar, 1)).Value = entity.GoalType ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Sequence", SqlDbType.Int)).Value = entity.Sequence ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@GoalDescription", SqlDbType.NVarChar, 4000)).Value = entity.GoalDescription ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Weightage", SqlDbType.Decimal)).Value = entity.Weightage ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionStep", SqlDbType.NVarChar, 1000)).Value = entity.ActionStep ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionPlan", SqlDbType.NVarChar, 4000)).Value = entity.ActionPlan?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Measure", SqlDbType.NVarChar, 4000)).Value = entity.Measure ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@TargetDate", SqlDbType.DateTime)).Value = entity.TargetDate ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = entity.KRAStatusId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRASetId", SqlDbType.Int)).Value = entity.KRASetId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = entity.CreatedBy ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@CreatedOn", SqlDbType.DateTime)).Value = entity.CreatedOn ?? DateTime.Now;
                    
                    // Training fields
                    var trainingItemIdParam = new SqlParameter("@TrainingItemId", SqlDbType.NVarChar, 500);
                    trainingItemIdParam.Value = string.IsNullOrEmpty(entity.TrainingItemId) ? (object)DBNull.Value : entity.TrainingItemId;
                    cmd.Parameters.Add(trainingItemIdParam);
                    
                    var trainingRequirementNameParam = new SqlParameter("@TrainingRequirementName", SqlDbType.NVarChar, -1);
                    trainingRequirementNameParam.Value = string.IsNullOrEmpty(entity.TrainingRequirementName) ? (object)DBNull.Value : entity.TrainingRequirementName;
                    cmd.Parameters.Add(trainingRequirementNameParam);
                    
                    var trainingCategoryParam = new SqlParameter("@TrainingCategory", SqlDbType.NVarChar, 500);
                    trainingCategoryParam.Value = string.IsNullOrEmpty(entity.TrainingCategory) ? (object)DBNull.Value : entity.TrainingCategory;
                    cmd.Parameters.Add(trainingCategoryParam);
                    
                    // Output parameter for KRAId
                    SqlParameter kraIdParam = new SqlParameter("@KRAId", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(kraIdParam);
                    
                    // Execute stored procedure
                    cmd.ExecuteNonQuery();
                    
                    // Get the output value
                    if (kraIdParam.Value != DBNull.Value && kraIdParam.Value != null)
                    {
                        newKRAId = Convert.ToInt32(kraIdParam.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertKRA");
                throw new Exception($"Error inserting EmployeeKRA: {ex.Message}", ex);
            }
            finally
            {
                CloseConnection();
            }
            
            return newKRAId;
        }

        /// <summary>
        /// Update EmployeeKRA using stored procedure
        /// Returns true if update was successful
        /// </summary>
        public bool UpdateKRA(EmployeeKRAEntity entity)
        {
            bool success = false;
            
            try
            {
                // First, verify the KRA exists using a separate connection check
                // We'll verify existence as part of the update, so we don't need a separate call
                // that might interfere with connection state
                
                // Open connection for the update operation
                try
                {
                    OpeneConnection();
                }
                catch (Exception connEx)
                {
                    throw new Exception($"Failed to open database connection: {connEx.Message}", connEx);
                }
                
                // Verify connection is open before using it
                if (ConCampus == null)
                {
                    throw new Exception("Connection object is null after OpeneConnection() call");
                }
                
                // Double-check connection state and open if needed
                if (ConCampus.State != System.Data.ConnectionState.Open)
                {
                    try
                    {
                        ConCampus.Open();
                    }
                    catch (Exception openEx)
                    {
                        throw new Exception($"Failed to open connection explicitly. State: {ConCampus.State}, Error: {openEx.Message}", openEx);
                    }
                }
                
                // Final verification before command execution
                if (ConCampus.State != System.Data.ConnectionState.Open)
                {
                    throw new Exception($"Connection is not open. Current state: {ConCampus.State}");
                }
                
                using (SqlCommand cmd = new SqlCommand("usp_UpdateEmployeeKRA", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // Add all parameters - use explicit values (not ISNULL in C#) to ensure updates happen
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = entity.KRAId;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = entity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = entity.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAFromDate", SqlDbType.DateTime)).Value = entity.KRAFromDate;
                    cmd.Parameters.Add(new SqlParameter("@KRAToDate", SqlDbType.DateTime)).Value = entity.KRAToDate;
                    cmd.Parameters.Add(new SqlParameter("@GoalType", SqlDbType.NVarChar, 1)).Value = entity.GoalType ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Sequence", SqlDbType.Int)).Value = entity.Sequence ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@GoalDescription", SqlDbType.NVarChar, 4000)).Value = entity.GoalDescription ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Weightage", SqlDbType.Decimal)).Value = entity.Weightage ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionStep", SqlDbType.NVarChar, 1000)).Value = entity.ActionStep ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionPlan", SqlDbType.NVarChar, 4000)).Value = entity.ActionPlan ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Measure", SqlDbType.NVarChar, 4000)).Value = entity.Measure ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@TargetDate", SqlDbType.DateTime)).Value = entity.TargetDate ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = entity.KRAStatusId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRASetId", SqlDbType.Int)).Value = entity.KRASetId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = entity.ModifiedBy ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedOn", SqlDbType.DateTime)).Value = entity.ModifiedOn ?? DateTime.Now;
                    
                    // Training fields - pass empty string as empty string, not NULL, to allow clearing values
                    var trainingItemIdParam = new SqlParameter("@TrainingItemId", SqlDbType.NVarChar, 500);
                    if (entity.TrainingItemId == null)
                    {
                        trainingItemIdParam.Value = DBNull.Value;
                    }
                    else
                    {
                        trainingItemIdParam.Value = entity.TrainingItemId;
                    }
                    cmd.Parameters.Add(trainingItemIdParam);
                    
                    var trainingRequirementNameParam = new SqlParameter("@TrainingRequirementName", SqlDbType.NVarChar, -1);
                    if (entity.TrainingRequirementName == null)
                    {
                        trainingRequirementNameParam.Value = DBNull.Value;
                    }
                    else
                    {
                        trainingRequirementNameParam.Value = entity.TrainingRequirementName;
                    }
                    cmd.Parameters.Add(trainingRequirementNameParam);
                    
                    var trainingCategoryParam = new SqlParameter("@TrainingCategory", SqlDbType.NVarChar, 500);
                    if (entity.TrainingCategory == null)
                    {
                        trainingCategoryParam.Value = DBNull.Value;
                    }
                    else
                    {
                        trainingCategoryParam.Value = entity.TrainingCategory;
                    }
                    cmd.Parameters.Add(trainingCategoryParam);
                    
                    cmd.Parameters.Add(new SqlParameter("@Selfassesment", SqlDbType.NVarChar, -1)).Value = entity.Selfassesment ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@AttachmentPath", SqlDbType.NVarChar, 500)).Value = entity.AttachmentPath ?? (object)DBNull.Value;
                    
                    // Try to add ReturnValue parameter (if stored procedure supports it)
                    SqlParameter returnValueParam = null;
                    try
                    {
                        returnValueParam = new SqlParameter("@ReturnValue", SqlDbType.Int)
                        {
                            Direction = ParameterDirection.Output
                        };
                        cmd.Parameters.Add(returnValueParam);
                    }
                    catch
                    {
                        // Stored procedure doesn't have ReturnValue parameter yet - that's OK
                        returnValueParam = null;
                    }
                    
                    // Log parameter values for debugging
                    System.Diagnostics.Debug.WriteLine($"UpdateKRA - KRAId: {entity.KRAId}, TrainingItemId: {entity.TrainingItemId ?? "NULL"}, TrainingCategory: {entity.TrainingCategory ?? "NULL"}");
                    
                    // Final check before execution - ensure connection is still open
                    if (ConCampus == null || ConCampus.State != System.Data.ConnectionState.Open)
                    {
                        throw new Exception($"Connection is not open before ExecuteNonQuery. State: {(ConCampus?.State.ToString() ?? "NULL")}");
                    }
                    
                    // Execute stored procedure
                    cmd.ExecuteNonQuery();
                    
                    // Check return value if available
                    if (returnValueParam != null && returnValueParam.Value != DBNull.Value && returnValueParam.Value != null)
                    {
                        int returnValue = Convert.ToInt32(returnValueParam.Value);
                        success = returnValue == 1; // 1 = Success, 0 = No rows updated, -1 = Error
                        
                        if (returnValue == -1)
                        {
                            throw new Exception("Stored procedure returned error status");
                        }
                        else if (returnValue == 0)
                        {
                            throw new Exception($"Update failed - KRA {entity.KRAId} not found or no rows updated");
                        }
                    }
                    else
                    {
                        // Fallback: Verify update by reading back the record
                        // Since NOCOUNT ON prevents row count, we'll verify by reading
                        DataSet updatedKRA = GetKRAById(entity.KRAId);
                        if (updatedKRA != null && updatedKRA.Tables.Count > 0 && updatedKRA.Tables[0].Rows.Count > 0)
                        {
                            // Check if key fields were updated
                            DataRow row = updatedKRA.Tables[0].Rows[0];
                            if (row["KRAId"] != DBNull.Value && Convert.ToInt32(row["KRAId"]) == entity.KRAId)
                            {
                                // Verify ModifiedOn was updated (indicates update happened)
                                if (row["ModifiedOn"] != DBNull.Value)
                                {
                                    DateTime modifiedOn = Convert.ToDateTime(row["ModifiedOn"]);
                                    // If ModifiedOn is recent (within last minute), assume update succeeded
                                    if (modifiedOn >= DateTime.Now.AddMinutes(-1))
                                    {
                                        success = true;
                                    }
                                }
                            }
                        }
                        
                        if (!success)
                        {
                            throw new Exception($"Update verification failed - could not confirm KRA {entity.KRAId} was updated");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "UpdateKRA");
                string errorDetails = $"Error updating EmployeeKRA (KRAId: {entity.KRAId}): {ex.Message}";
                System.Diagnostics.Debug.WriteLine(errorDetails);
                throw new Exception(errorDetails, ex);
            }
            finally
            {
                CloseConnection();
            }
            
            return success;
        }

        /// <summary>
        /// Convert DataRow to EmployeeKRAEntity
        /// </summary>
        public EmployeeKRAEntity DataRowToEntity(DataRow row)
        {
            if (row == null)
                return null;

            EmployeeKRAEntity entity = new EmployeeKRAEntity();
            
            entity.KRAId = row["KRAId"] != DBNull.Value ? Convert.ToInt32(row["KRAId"]) : 0;
            entity.EmployeeId = row["EmployeeId"] != DBNull.Value ? Convert.ToInt32(row["EmployeeId"]) : 0;
            entity.AppraisalCycleId = row["AppraisalCycleId"] != DBNull.Value ? (int?)Convert.ToInt32(row["AppraisalCycleId"]) : null;
            entity.KRAFromDate = row["KRAFromDate"] != DBNull.Value ? Convert.ToDateTime(row["KRAFromDate"]) : DateTime.MinValue;
            entity.KRAToDate = row["KRAToDate"] != DBNull.Value ? Convert.ToDateTime(row["KRAToDate"]) : DateTime.MinValue;
            entity.GoalType = row["GoalType"] != DBNull.Value ? row["GoalType"].ToString() : null;
            entity.Sequence = row["Sequence"] != DBNull.Value ? (int?)Convert.ToInt32(row["Sequence"]) : null;
            entity.GoalDescription = row["GoalDescription"] != DBNull.Value ? row["GoalDescription"].ToString() : null;
            entity.Weightage = row["Weightage"] != DBNull.Value ? (decimal?)Convert.ToDecimal(row["Weightage"]) : null;
            entity.ActionStep = row["ActionStep"] != DBNull.Value ? row["ActionStep"].ToString() : null;
            entity.ActionPlan = row["ActionPlan"] != DBNull.Value ? row["ActionPlan"].ToString() : null;
            entity.Measure = row["Measure"] != DBNull.Value ? row["Measure"].ToString() : null;
            entity.TargetDate = row["TargetDate"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(row["TargetDate"]) : null;
            entity.KRAStatusId = row["KRAStatusId"] != DBNull.Value ? (int?)Convert.ToInt32(row["KRAStatusId"]) : null;
            entity.KRASetId = row["KRASetId"] != DBNull.Value ? (int?)Convert.ToInt32(row["KRASetId"]) : null;
            entity.CreatedBy = row["CreatedBy"] != DBNull.Value ? (int?)Convert.ToInt32(row["CreatedBy"]) : null;
            entity.CreatedOn = row["CreatedOn"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(row["CreatedOn"]) : null;
            entity.ModifiedBy = row["ModifiedBy"] != DBNull.Value ? (int?)Convert.ToInt32(row["ModifiedBy"]) : null;
            entity.ModifiedOn = row["ModifiedOn"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(row["ModifiedOn"]) : null;
            entity.ManagerId = row.Table.Columns.Contains("ManagerId") && row["ManagerId"] != DBNull.Value ? (int?)Convert.ToInt32(row["ManagerId"]) : null;
            entity.Selfassesment = row.Table.Columns.Contains("Selfassesment") && row["Selfassesment"] != DBNull.Value ? row["Selfassesment"].ToString() : null;
            entity.AttachmentPath = row.Table.Columns.Contains("AttachmentPath") && row["AttachmentPath"] != DBNull.Value ? row["AttachmentPath"].ToString() : null;
            
            // Training fields
            entity.TrainingItemId = row.Table.Columns.Contains("TrainingItemId") && row["TrainingItemId"] != DBNull.Value ? row["TrainingItemId"].ToString() : null;
            entity.TrainingRequirementName = row.Table.Columns.Contains("TrainingRequirementName") && row["TrainingRequirementName"] != DBNull.Value ? row["TrainingRequirementName"].ToString() : null;
            entity.TrainingCategory = row.Table.Columns.Contains("TrainingCategory") && row["TrainingCategory"] != DBNull.Value ? row["TrainingCategory"].ToString() : null;
            
            return entity;
        }
    }
}

