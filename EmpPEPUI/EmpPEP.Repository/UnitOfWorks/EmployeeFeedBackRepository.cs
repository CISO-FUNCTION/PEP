using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;
using System.Data.SqlClient;
using EmpPEP.Repository.common;
using System.Data;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeFeedBackRepository : BaseDispose
    {
        SqlCommand cmdObj;
        string sectionName = "AppraisalCycleRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public EmployeeFeedBackRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #endregion

        #region "Public Methods"
        /// <summary>
        /// Get all EmployeeFeedBack records using stored procedure (ADO.NET)
        /// Note: This method is rarely used, consider using specific Get methods instead
        /// </summary>
        public List<EmployeeFeedBack> Get()
        {
            List<EmployeeFeedBack> result = new List<EmployeeFeedBack>();
            try
            {
                OpeneConnection();
                
                // Use existing GetEmployeeFeedback stored procedure with null filters
                string _sql = "GetEmployeeFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int)).Value = DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int)).Value = DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@ActionTypeId", SqlDbType.Int)).Value = DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@ParentFeedBackId", SqlDbType.Int)).Value = DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@AreaId", SqlDbType.Int)).Value = DBNull.Value;
                
                using (SqlDataReader reader = cmdObj.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        EmployeeFeedBack feedback = MapReaderToEmployeeFeedBack(reader);
                        result.Add(feedback);
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "Get");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return result;
        }
        
        /// <summary>
        /// Helper method to map SqlDataReader to EmployeeFeedBack entity
        /// </summary>
        private EmployeeFeedBack MapReaderToEmployeeFeedBack(SqlDataReader reader)
        {
            return new EmployeeFeedBack
            {
                FeedBackId = reader.GetInt32(reader.GetOrdinal("FeedBackId")),
                AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId")),
                FromEmployeeId = reader.GetInt32(reader.GetOrdinal("FromEmployeeId")),
                ToEmployeeId = reader.GetInt32(reader.GetOrdinal("ToEmployeeId")),
                ActionTypeId = reader.IsDBNull(reader.GetOrdinal("ActionTypeId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ActionTypeId")),
                AreaID = reader.IsDBNull(reader.GetOrdinal("AreaID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AreaID")),
                GradeAreaQuestionMappingID = reader.IsDBNull(reader.GetOrdinal("GradeAreaQuestionMappingID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("GradeAreaQuestionMappingID")),
                QuestionaireId = reader.IsDBNull(reader.GetOrdinal("QuestionaireId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("QuestionaireId")),
                Feedback = reader.IsDBNull(reader.GetOrdinal("Feedback")) ? null : reader.GetString(reader.GetOrdinal("Feedback")),
                ParentFeedBackId = reader.IsDBNull(reader.GetOrdinal("ParentFeedBackId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ParentFeedBackId")),
                Rating = reader.IsDBNull(reader.GetOrdinal("Rating")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Rating")),
                Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn")),
                ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy")),
                ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn")),
                FeedbackDate = reader.IsDBNull(reader.GetOrdinal("FeedbackDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("FeedbackDate")),
                StatusID = reader.IsDBNull(reader.GetOrdinal("StatusID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("StatusID")),
                IsIgnore = reader.IsDBNull(reader.GetOrdinal("IsIgnore")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("IsIgnore")),
                IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen")),
                PerformCycleCheck = reader.IsDBNull(reader.GetOrdinal("PerformCycleCheck")) ? null : reader.GetString(reader.GetOrdinal("PerformCycleCheck")),
                GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType")),
                GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription")),
                Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage")),
                Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure")),
                AttachmentPath = reader.IsDBNull(reader.GetOrdinal("AttachmentPath")) ? null : reader.GetString(reader.GetOrdinal("AttachmentPath")),
                TrainingItemId = reader.IsDBNull(reader.GetOrdinal("TrainingItemId")) ? null : reader.GetString(reader.GetOrdinal("TrainingItemId")),
                TrainingRequirementName = reader.IsDBNull(reader.GetOrdinal("TrainingRequirementName")) ? null : reader.GetString(reader.GetOrdinal("TrainingRequirementName")),
                TrainingCategory = reader.IsDBNull(reader.GetOrdinal("TrainingCategory")) ? null : reader.GetString(reader.GetOrdinal("TrainingCategory"))
            };
        }

        //public EmployeeFeedBack Get(int id)
        //{
        //    EmployeeFeedBack query = context.Set<EmployeeFeedBack>().SingleOrDefault(x => x.FeedBackId == id);
        //    return query;
        //}
        //public DataSet Get(int id)
        //{
        //    DataSet ds = null;
        //    try
        //    {
        //        OpeneConnection();
        //        string _sql = "GetEmployeesFeedback";
        //        cmdObj = new SqlCommand(_sql, ConCampus);
        //        cmdObj.CommandType = CommandType.StoredProcedure;

        //        cmdObj.Parameters
        //         .Add(new SqlParameter("@id", SqlDbType.Int))
        //         .Value = id;
        //        ds = du.GetDataSetWithProc(cmdObj);
        //        ds.Tables[0].TableName = "data";
        //        CloseConnection();
        //    }
        //    catch (Exception ex)
        //    {
        //        ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeesFeedback");
        //    }

        //    return ds;
        //}
        public EmployeeFeedBack Get(int id)
        {
            EmployeeFeedBack employeeFeedBack = null; // Initialize as null in case no result is returned
            try
            {
                // Open the connection
                OpeneConnection();

                // SQL stored procedure name
                string _sql = "GetEmployeesFeedback";

                // Create SqlCommand object to execute the stored procedure
                cmdObj = new SqlCommand(_sql, ConCampus)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // Add the parameter for the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@id", SqlDbType.Int)).Value = id;

                // Execute the reader
                using (SqlDataReader reader = cmdObj.ExecuteReader())
                {
                    // Check if data is returned
                    if (reader.Read())
                    {
                        // Create and populate the EmployeeFeedBack object
                        employeeFeedBack = new EmployeeFeedBack
                        {
                            FeedBackId = reader.GetInt32(reader.GetOrdinal("FeedBackId")),
                            AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId")),
                            FromEmployeeId = reader.GetInt32(reader.GetOrdinal("FromEmployeeId")),
                            ToEmployeeId = reader.GetInt32(reader.GetOrdinal("ToEmployeeId")),
                            ActionTypeId = reader.IsDBNull(reader.GetOrdinal("ActionTypeId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ActionTypeId")),
                            AreaID = reader.IsDBNull(reader.GetOrdinal("AreaID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AreaID")),
                            GradeAreaQuestionMappingID = reader.IsDBNull(reader.GetOrdinal("GradeAreaQuestionMappingID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("GradeAreaQuestionMappingID")),
                            QuestionaireId = reader.IsDBNull(reader.GetOrdinal("QuestionaireId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("QuestionaireId")),
                            Feedback = reader.IsDBNull(reader.GetOrdinal("Feedback")) ? null : reader.GetString(reader.GetOrdinal("Feedback")),
                            ParentFeedBackId = reader.IsDBNull(reader.GetOrdinal("ParentFeedBackId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ParentFeedBackId")),
                            Rating = reader.IsDBNull(reader.GetOrdinal("Rating")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Rating")),
                            Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence")),
                            CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                            CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn")),
                            ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy")),
                            ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn")),
                            FeedbackDate = reader.IsDBNull(reader.GetOrdinal("FeedbackDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("FeedbackDate")),
                            StatusID = reader.IsDBNull(reader.GetOrdinal("StatusID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("StatusID")),
                            IsIgnore = reader.IsDBNull(reader.GetOrdinal("IsIgnore")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("IsIgnore")),
                            IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen")),
                            PerformCycleCheck = reader.IsDBNull(reader.GetOrdinal("PerformCycleCheck")) ? null : reader.GetString(reader.GetOrdinal("PerformCycleCheck"))
                        };
                    }
                }

                // Close the connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Log the exception if there is an error
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeesFeedback");
            }

            // Return the populated EmployeeFeedBack object, or null if no data was found
            return employeeFeedBack;
        }


        /// <summary>
        /// Get feedback by parent ID using stored procedure (ADO.NET)
        /// </summary>
        public List<EmployeeFeedBack> GetFeedbackByParentId(int ParentId)
        {
            List<EmployeeFeedBack> result = new List<EmployeeFeedBack>();
            try
            {
                OpeneConnection();
                
                string _sql = "GetFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.Add(new SqlParameter("@feedbackId", SqlDbType.Int)).Value = ParentId;
                
                DataSet ds = du.GetDataSetWithProc(cmdObj);
                
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        if (Convert.ToInt32(row["IsSeen"]) == 0)
                        {
                            EmployeeFeedBack feedback = new EmployeeFeedBack
                            {
                                FeedBackId = Convert.ToInt32(row["FeedBackId"]),
                                ParentFeedBackId = row["ParentFeedBackId"] != DBNull.Value ? (int?)Convert.ToInt32(row["ParentFeedBackId"]) : null,
                                IsSeen = row["IsSeen"] != DBNull.Value ? (int?)Convert.ToInt32(row["IsSeen"]) : null
                            };
                            result.Add(feedback);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedbackByParentId");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return result;
        }
        //public List<EmployeeFeedBack> GetFeedback(int feedbackId)
        //{
        //    IQueryable<EmployeeFeedBack> query = context.Set<EmployeeFeedBack>().Where(x => x.ParentFeedBackId == feedbackId).OrderBy(x => x.FeedBackId);
        //    return query.ToList();
        //}

        public DataSet GetFeedback(int feedbackId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@feedbackId", SqlDbType.Int))
                 .Value = feedbackId;
                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedback");
            }

            return ds;
        }

        /// <summary>
        /// Insert Manager Feedback using stored procedure with goal snapshot (ADO.NET)
        /// Stores snapshot on every save as goals may be modified during transaction
        /// </summary>
        public int Insert(EmployeeFeedBack obj)
        {
            int feedbackId = 0;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_ManagerFeedback_Insert", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = obj.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int)).Value = obj.FromEmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int)).Value = obj.ToEmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@QuestionaireId", SqlDbType.Int)).Value = obj.QuestionaireId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Feedback", SqlDbType.NVarChar, 2000)).Value = obj.Feedback ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10)).Value = obj.PerformCycleCheck ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int)).Value = obj.AreaID ?? 2;
                    cmd.Parameters.Add(new SqlParameter("@ActionTypeId", SqlDbType.Int)).Value = obj.ActionTypeId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ParentFeedBackId", SqlDbType.Int)).Value = obj.ParentFeedBackId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Rating", SqlDbType.Int)).Value = obj.Rating ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Sequence", SqlDbType.Int)).Value = obj.Sequence ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = obj.CreatedBy ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@StatusID", SqlDbType.Int)).Value = obj.StatusID ?? (object)DBNull.Value;
                    
                    SqlParameter feedbackIdParam = new SqlParameter("@FeedBackId", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(feedbackIdParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    feedbackId = feedbackIdParam.Value != DBNull.Value ? Convert.ToInt32(feedbackIdParam.Value) : 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "Insert");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return feedbackId;
        }
        
        /// <summary>
        /// Update Manager Feedback using stored procedure with updated goal snapshot (ADO.NET)
        /// Stores snapshot on every save as goals may be modified during transaction
        /// </summary>
        public bool Update(EmployeeFeedBack obj)
        {
            bool isUpdated = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_ManagerFeedback_Update", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@FeedBackId", SqlDbType.Int)).Value = obj.FeedBackId;
                    cmd.Parameters.Add(new SqlParameter("@QuestionaireId", SqlDbType.Int)).Value = obj.QuestionaireId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Feedback", SqlDbType.NVarChar, 2000)).Value = obj.Feedback ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = obj.ModifiedBy ?? (object)DBNull.Value;
                    
                    SqlParameter rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(rowsAffectedParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    int rowsAffected = rowsAffectedParam.Value != DBNull.Value ? Convert.ToInt32(rowsAffectedParam.Value) : 0;
                    isUpdated = rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "Update");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return isUpdated;
        }

        /// <summary>
        /// Mark all unseen feedback in a thread as seen without touching any other columns.
        /// </summary>
        public void MarkThreadAsSeen(int parentFeedBackId, int userId)
        {
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("sp_MarkFeedbackThreadAsSeen", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@ParentFeedBackId", SqlDbType.Int)).Value = parentFeedBackId;
                    cmd.Parameters.Add(new SqlParameter("@UserId", SqlDbType.Int)).Value = userId;
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "MarkThreadAsSeen");
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Delete EmployeeFeedBack using stored procedure (ADO.NET)
        /// Note: This method signature expects FeedBackId, not AppraisalCycleId
        /// </summary>
        public bool Delete(EmployeeFeedBack obj)
        {
            bool isDeleted = false;
            try
            {
                OpeneConnection();
                
                // Note: The original method had a bug - it was using AppraisalCycleId instead of FeedBackId
                // This fix uses FeedBackId which is the correct primary key
                using (SqlCommand cmd = new SqlCommand("usp_DeleteEmployeeFeedBack", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@FeedBackId", SqlDbType.Int)).Value = obj.FeedBackId;
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    isDeleted = rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "Delete");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return isDeleted;
        }

        /// <summary>
        /// Get Employee Feedback using stored procedure (ADO.NET)
        /// Note: This method signature is kept for compatibility but should use stored procedure
        /// </summary>
        public IEnumerable<GetEmployeeFeedback_Result> GetEmployeeFeedback(string query, params object[] parameters)
        {
            // For now, keep using SqlQuery for backward compatibility
            // TODO: Replace with dedicated stored procedure if needed
            return context.Database.SqlQuery<GetEmployeeFeedback_Result>(query, parameters).ToList<GetEmployeeFeedback_Result>();
        }
        public DataSet GetEmployeeFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int SelectedYear)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@SelectedYear", SqlDbType.Int))
                 .Value = SelectedYear;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetActiveCycle");
            }

            return ds;
        }
        public DataSet GetEmployeeFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ParentFeedBackId", SqlDbType.Int))
                 .Value = ParentFeedBackId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AreaId", SqlDbType.Int))
                 .Value = AreaID;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeFeedback");
            }

            return ds;
        }
        public DataSet GetEmployeeFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID, int SelectedYear)
        {
            DataSet ds = new DataSet(); // Initialize as empty DataSet instead of null
            try
            {
                OpeneConnection();
                // Area 10 = My Self-Assessment on Feedback page; data lives in SelfassessmentTableDetail, not EmployeeFeedBack.
                // GetEmployeeFeedbackbyYear handles 1, 2, 0, 5, 8, 9 (Area 9 = view self-assessment for manager); Area 10 uses a dedicated procedure.
                string _sql = AreaID == 10
                    ? "GetEmployeeFeedbackbyYearSelfAssessment"
                    : "GetEmployeeFeedbackbyYear";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ParentFeedBackId", SqlDbType.Int))
                 .Value = ParentFeedBackId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AreaId", SqlDbType.Int))
                 .Value = AreaID;
                cmdObj.Parameters
                 .Add(new SqlParameter("@SelectedYear", SqlDbType.Int))
                 .Value = SelectedYear;

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0)
                {
                ds.Tables[0].TableName = "data";
                }
                else
                {
                    // Ensure we return an empty DataSet with at least one table
                    ds = new DataSet();
                    ds.Tables.Add(new DataTable("data"));
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, AreaID == 10 ? "GetEmployeeFeedbackbyYearSelfAssessment" : "GetEmployeeFeedbackbyYear");
                // Return empty DataSet instead of null
                if (ds == null || ds.Tables.Count == 0)
                {
                    ds = new DataSet();
                    ds.Tables.Add(new DataTable("data"));
                }
            }

            return ds;
        }


         public DataSet GetEmployeeFeedbackGivenBYPeer(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int SelectedYear)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeFeedbackGivenBYPeerbyYear";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@SelectedYear", SqlDbType.Int))
                 .Value = SelectedYear;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetActiveCycle");
            }

            return ds;
        }
         public DataSet GetEmployeeFeedbackGivenBYPeer(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeFeedbackGivenBYPeer";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetActiveCycle");
            }

            return ds;
        }
        public DateTime? Get(int EmployeeId, int AppraisalCycleId)
        {
            EmployeeFeedBack query =
                context.Set<EmployeeFeedBack>()
                .Where(x => x.ToEmployeeId == EmployeeId && x.AppraisalCycleId == AppraisalCycleId)
                .OrderByDescending(x => x.FeedbackDate)
                .FirstOrDefault();
            if (query != null)
                return query.FeedbackDate;
            else
                return null;

        }

        public int GetFeedbackLimit()
        {
            //return Convert.ToInt32(context.Set<FeedbackLimitsMaster>().FirstOrDefault().FeedbackFlowLimit);
            DataSet ds = null;
            int res = 0;
            try
            {
                OpeneConnection();
                string _sql = "GetFeedbackLimit";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

               
                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedback");
            }

            return res;
        }

        public IEnumerable<GetNotifications_Result> GetNotifications(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetNotifications_Result>(query, parameters).ToList<GetNotifications_Result>();
        }

        #endregion

        //#region  IDiosposable

        //#region private variable
        //private bool disposed = false;
        //#endregion

        //protected virtual void Dispose(bool disposing)
        //{
        //    if (!this.disposed && disposing)
        //    {
        //        context.Dispose();
        //    }
        //    this.disposed = true;
        //}

        //public void Dispose()
        //{
        //    Dispose(true);
        //    GC.SuppressFinalize(this);
        //}
        //#endregion

        //By Sourabh
        #region Previous RM Feedback
        public IEnumerable<GetPreviousRM_Result> GetPreviousRM(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetPreviousRM_Result>(query, parameters).ToList<GetPreviousRM_Result>();
        }
        public IEnumerable<GetPreviousRMFeedback_Result> GetPreviousRMFeedback(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetPreviousRMFeedback_Result>(query, parameters).ToList<GetPreviousRMFeedback_Result>();
        }
        #endregion
        //Delegator feedback By Garima 26-10-2018
        #region Delegator Feedback
        public IEnumerable<GetDelegator_Result> GetDelegator(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDelegator_Result>(query, parameters).ToList<GetDelegator_Result>();
        }
        public IEnumerable<GetEmployeesByDelegator_Result> GetEmployees(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeesByDelegator_Result>(query, parameters).ToList<GetEmployeesByDelegator_Result>();
        }
        public IEnumerable<GetDelegatorFeedback_Result> GetDelegatorFeedback(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDelegatorFeedback_Result>(query, parameters).ToList<GetDelegatorFeedback_Result>();
        }
        #endregion
        //SaveFeedback As Draft --Created By kaushal saini (9 august 2019)
        #region  
        /// <summary>
        /// Insert Manager Feedback Draft using stored procedure with automatic goal snapshot (ADO.NET)
        /// Uses sp_SaveManagerFeedbackDraft which handles snapshot storage automatically
        /// </summary>
        public int InsertAsDraft(EmployeeFeedBackAsDraft obj)
        {
            // Use the existing SaveDraft method which uses stored procedure
            return SaveDraft(
                obj.ToEmployeeId,
                obj.FromEmployeeId,
                obj.AppraisalCycleId ?? 0,
                obj.QuestionaireId ?? 0,
                obj.Feedback,
                obj.PerformCycleCheck,
                obj.AreaID ?? 2
            );
        }
        
        /// <summary>
        /// Update Manager Feedback Draft using stored procedure with automatic goal snapshot (ADO.NET)
        /// Uses sp_SaveManagerFeedbackDraft which handles snapshot storage automatically
        /// </summary>
        public bool UpdateDraftFeedback(EmployeeFeedBackAsDraft obj)
        {
            // Use the existing SaveDraft method which uses stored procedure (handles both insert and update)
            int feedbackId = SaveDraft(
                obj.ToEmployeeId,
                obj.FromEmployeeId,
                obj.AppraisalCycleId ?? 0,
                obj.QuestionaireId ?? 0,
                obj.Feedback,
                obj.PerformCycleCheck,
                obj.AreaID ?? 2
            );
            
            return feedbackId > 0;
        }
        
        /// <summary>
        /// Delete Manager Feedback Drafts using stored procedure (ADO.NET)
        /// </summary>
        public bool DraftDelete(EmployeeFeedBackAsDraft obj)
        {
            bool isDeleted = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_DeleteEmployeeFeedBackDraft", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int)).Value = obj.ToEmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int)).Value = obj.AreaID ?? 2;
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10)).Value = obj.PerformCycleCheck ?? (object)DBNull.Value;
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    isDeleted = rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "DraftDelete");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return isDeleted;
        }
        
        /// <summary>
        /// Get Manager Feedback Draft by ID using stored procedure (ADO.NET)
        /// </summary>
        public EmployeeFeedBackAsDraft GetDraftFeedback(int id)
        {
            EmployeeFeedBackAsDraft result = null;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_GetEmployeeFeedBackDraftById", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@FeedBackId", SqlDbType.Int)).Value = id;
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            result = new EmployeeFeedBackAsDraft
                            {
                                FeedBackId = reader.GetInt32(reader.GetOrdinal("FeedBackId")),
                                AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId")),
                                FromEmployeeId = reader.GetInt32(reader.GetOrdinal("FromEmployeeId")),
                                ToEmployeeId = reader.GetInt32(reader.GetOrdinal("ToEmployeeId")),
                                ActionTypeId = reader.IsDBNull(reader.GetOrdinal("ActionTypeId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ActionTypeId")),
                                AreaID = reader.IsDBNull(reader.GetOrdinal("AreaID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AreaID")),
                                QuestionaireId = reader.IsDBNull(reader.GetOrdinal("QuestionaireId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("QuestionaireId")),
                                Feedback = reader.IsDBNull(reader.GetOrdinal("Feedback")) ? null : reader.GetString(reader.GetOrdinal("Feedback")),
                                ParentFeedBackId = reader.IsDBNull(reader.GetOrdinal("ParentFeedBackId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ParentFeedBackId")),
                                Rating = reader.IsDBNull(reader.GetOrdinal("Rating")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Rating")),
                                Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence")),
                                CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                                CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn")),
                                ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy")),
                                ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn")),
                                FeedbackDate = reader.IsDBNull(reader.GetOrdinal("FeedbackDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("FeedbackDate")),
                                StatusID = reader.IsDBNull(reader.GetOrdinal("StatusID")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("StatusID")),
                                IsIgnore = reader.IsDBNull(reader.GetOrdinal("IsIgnore")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("IsIgnore")),
                                IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen")),
                                PerformCycleCheck = reader.IsDBNull(reader.GetOrdinal("PerformCycleCheck")) ? null : reader.GetString(reader.GetOrdinal("PerformCycleCheck")),
                                GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType")),
                                GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription")),
                                Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage")),
                                Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure")),
                                AttachmentPath = reader.IsDBNull(reader.GetOrdinal("AttachmentPath")) ? null : reader.GetString(reader.GetOrdinal("AttachmentPath")),
                                TrainingItemId = reader.IsDBNull(reader.GetOrdinal("TrainingItemId")) ? null : reader.GetString(reader.GetOrdinal("TrainingItemId")),
                                TrainingRequirementName = reader.IsDBNull(reader.GetOrdinal("TrainingRequirementName")) ? null : reader.GetString(reader.GetOrdinal("TrainingRequirementName")),
                                TrainingCategory = reader.IsDBNull(reader.GetOrdinal("TrainingCategory")) ? null : reader.GetString(reader.GetOrdinal("TrainingCategory"))
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDraftFeedback");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return result;
        }

        /// <summary>
        /// Save or Update Manager Feedback Draft using stored procedure
        /// </summary>
        public int SaveDraft(int toEmployeeId, int fromEmployeeId, int appraisalCycleId, int questionaireId,
            string feedback, string performCycleCheck, int areaId, string trainingItemId = null, 
            string trainingRequirementName = null, string trainingCategory = null)
        {
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_SaveManagerFeedbackDraft", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int) { Value = toEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int) { Value = fromEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmd.Parameters.Add(new SqlParameter("@QuestionaireId", SqlDbType.Int) { Value = questionaireId });
                    cmd.Parameters.Add(new SqlParameter("@Feedback", SqlDbType.NVarChar, 2000) { Value = (object)feedback ?? DBNull.Value });
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10) { Value = performCycleCheck });
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int) { Value = areaId });
                    
                    // Training Requirement parameters
                    cmd.Parameters.Add(new SqlParameter("@TrainingItemId", SqlDbType.NVarChar, 500) { Value = (object)trainingItemId ?? DBNull.Value });
                    cmd.Parameters.Add(new SqlParameter("@TrainingRequirementName", SqlDbType.NVarChar, -1) { Value = (object)trainingRequirementName ?? DBNull.Value });
                    cmd.Parameters.Add(new SqlParameter("@TrainingCategory", SqlDbType.NVarChar, 500) { Value = (object)trainingCategory ?? DBNull.Value });
                    
                    SqlParameter feedBackIdParam = new SqlParameter("@FeedBackId", SqlDbType.Int);
                    feedBackIdParam.Direction = ParameterDirection.Output;
                    cmd.Parameters.Add(feedBackIdParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    int feedBackId = feedBackIdParam.Value != DBNull.Value ? Convert.ToInt32(feedBackIdParam.Value) : 0;
                    return feedBackId;
                }
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Get all draft feedbacks for an employee and cycle using stored procedure
        /// </summary>
        public DataSet GetDraftFeedbacksByEmployeeCycle(int toEmployeeId, string performCycleCheck, int areaId)
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();
                
                cmdObj = new SqlCommand("sp_GetManagerFeedbackDrafts", ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int) { Value = toEmployeeId });
                cmdObj.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10) { Value = performCycleCheck });
                cmdObj.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int) { Value = areaId });
                
                ds = du.GetDataSetWithProc(cmdObj);
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDraftFeedbacksByEmployeeCycle");
            }
            finally
            {
                CloseConnection();
            }
            
            return ds;
        }

        /// <summary>
        /// Training requirements stored on submitted manager feedback rows (EmployeeFeedBack), not merged from EmployeeKRA.
        /// Used after submit to raise external training requests for manager-added recommendations only.
        /// </summary>
        public List<EmployeeKRA> GetSubmittedManagerFeedbackTrainingsForCycle(int toEmployeeId, int fromEmployeeId, int appraisalCycleId, string performCycleCheck, int areaId)
        {
            var result = new List<EmployeeKRA>();
            try
            {
                OpeneConnection();
                using (var cmd = new SqlCommand("sp_GetSubmittedManagerFeedbackTrainingsForCycle", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int) { Value = toEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int) { Value = fromEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 50) { Value = (object)performCycleCheck ?? DBNull.Value });
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int) { Value = areaId });
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var kra = new EmployeeKRA
                            {
                                KRAId = reader.GetInt32(reader.GetOrdinal("KRAId")),
                                TrainingItemId = reader.IsDBNull(reader.GetOrdinal("TrainingItemId")) ? null : reader.GetString(reader.GetOrdinal("TrainingItemId")),
                                TrainingRequirementName = reader.IsDBNull(reader.GetOrdinal("TrainingRequirementName")) ? null : reader.GetString(reader.GetOrdinal("TrainingRequirementName")),
                                TrainingCategory = reader.IsDBNull(reader.GetOrdinal("TrainingCategory")) ? null : reader.GetString(reader.GetOrdinal("TrainingCategory"))
                            };
                            result.Add(kra);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSubmittedManagerFeedbackTrainingsForCycle");
            }
            finally
            {
                CloseConnection();
            }
            return result;
        }

        /// <summary>
        /// Submit Manager Feedback - Move drafts to final table using stored procedure
        /// </summary>
        public bool SubmitFeedback(int toEmployeeId, int fromEmployeeId, int appraisalCycleId, string performCycleCheck, int areaId, out string message)
        {
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_SubmitManagerFeedback", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int) { Value = toEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int) { Value = fromEmployeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10) { Value = performCycleCheck });
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int) { Value = areaId });
                    
                    SqlParameter successParam = new SqlParameter("@Success", SqlDbType.Bit);
                    successParam.Direction = ParameterDirection.Output;
                    cmd.Parameters.Add(successParam);
                    
                    SqlParameter messageParam = new SqlParameter("@Message", SqlDbType.NVarChar, 500);
                    messageParam.Direction = ParameterDirection.Output;
                    cmd.Parameters.Add(messageParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    bool success = successParam.Value != DBNull.Value ? Convert.ToBoolean(successParam.Value) : false;
                    message = messageParam.Value != DBNull.Value ? messageParam.Value.ToString() : "Unknown error";

                    // Draft rows carry FeedbackDate from first save; stamp submit time on final rows (not draft CreatedOn).
                    if (success)
                    {
                        using (SqlCommand cmdStamp = new SqlCommand(@"
UPDATE dbo.EmployeeFeedBack
SET FeedbackDate = GETDATE()
WHERE ToEmployeeId = @ToEmployeeId
  AND FromEmployeeId = @FromEmployeeId
  AND AppraisalCycleId = @AppraisalCycleId
  AND AreaID = @AreaID
  AND ISNULL(PerformCycleCheck, N'') = ISNULL(@PerformCycleCheck, N'')", ConCampus))
                        {
                            cmdStamp.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int) { Value = toEmployeeId });
                            cmdStamp.Parameters.Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int) { Value = fromEmployeeId });
                            cmdStamp.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                            cmdStamp.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int) { Value = areaId });
                            object performCycleParam = string.IsNullOrEmpty(performCycleCheck) ? (object)DBNull.Value : performCycleCheck;
                            cmdStamp.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10) { Value = performCycleParam });
                            cmdStamp.ExecuteNonQuery();
                        }
                    }

                    return success;
                }
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Check if Manager Feedback exists for the given cycle
        /// </summary>
        /// <summary>
        /// Check if Manager Feedback exists for the given cycle using stored procedure (ADO.NET)
        /// </summary>
        public bool HasManagerFeedback(int employeeId, int appraisalCycleId, string cycle)
        {
            bool hasFeedback = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_ManagerFeedback_HasFeedback", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@PerformCycleCheck", SqlDbType.NVarChar, 10)).Value = cycle;
                    cmd.Parameters.Add(new SqlParameter("@AreaID", SqlDbType.Int)).Value = 2; // AreaID 2 = Manager Feedback
                    
                    SqlParameter hasFeedbackParam = new SqlParameter("@HasFeedback", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(hasFeedbackParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    hasFeedback = hasFeedbackParam.Value != DBNull.Value && Convert.ToBoolean(hasFeedbackParam.Value);
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "HasManagerFeedback");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return hasFeedback;
        }
        #endregion
    }
}


