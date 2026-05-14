using EmpPEP.Framework.Helper;
using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessEntity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeKRARepository : BaseDispose, IBaseRepository<EmployeeKRA>
    {
        SqlCommand cmdObj;
        string sectionName = "EmployeeKRARepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region Dispose Pattern
        protected override void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;

            // Call base class implementation.
            base.Dispose(disposing);
        }
        #endregion

        public EmployeeKRARepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }

        #region Public Methods
        //public List<EmployeeKRA> GetKRA(EmployeeKRA employeeKRA)
        //{
        //    if (employeeKRA.KRAStatusId > 0)
        //    {
        //        var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
        //                                                            && x.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //                                                            && x.KRAStatusId==employeeKRA.KRAStatusId
        //                    )
        //                     orderby b.GoalType descending
        //                     select b
        //                    ).ToList();

        //        return query != null ? query.ToList() : new List<EmployeeKRA>();
        //    }
        //    else
        //    {
        //        var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
        //                                                            && x.AppraisalCycleId == employeeKRA.AppraisalCycleId

        //                    )
        //                     orderby b.GoalType descending
        //                     select b
        //                    ).ToList();

        //        return query != null ? query.ToList() : new List<EmployeeKRA>();
        //    }
        //}
        //public List<EmployeeKRA> GetKRA(EmployeeKRA employeeKRA, string SelfAssCycleId)
        //{
        //    //  var DateCheck = GetSubcycleCheck();
        //    string Subcycle = "";
        //    //  Subcycle = DateCheck[0].YearBreakCheck.ToString();
        //    Subcycle = SelfAssCycleId;
        //    if (employeeKRA.KRAStatusId > 0)
        //    {
        //        var query = (from t2 in context.EmployeeKRAs
        //                     join t1 in context.SelfassessmentTableDetails.Where(x => x.YearBreakCheck == Subcycle) on t2.KRAId equals t1.KRAId
        //                    // join t3 in context.EmployeeFeedBacks.Where(x => x.PerformCycleCheck == Subcycle) on t2.KRAId equals t3.QuestionaireId  
        //                    into ps
        //                     //from t3 in ps.DefaultIfEmpty()
        //                     from t1 in ps.DefaultIfEmpty()
        //                     where (t2.EmployeeId == employeeKRA.EmployeeId
        //                                                            && t2.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //                                                            && t2.KRAStatusId == employeeKRA.KRAStatusId
        //                                                           )
        //                     select new
        //                     {
        //                         EmployeeId = t2.EmployeeId,
        //                         KRAStatusId = t2.KRAStatusId,
        //                         Measure = t2.Measure,
        //                         Weightage = t2.Weightage,
        //                         KRAFromDate = t2.KRAFromDate,
        //                         KRAToDate = t2.KRAToDate,
        //                         KRAId = t2.KRAId,
        //                         GoalDescription = t2.GoalDescription,
        //                         GoalType = t2.GoalType,
        //                         AppraisalCycleId = t2.AppraisalCycleId,
        //                         Selfassesment = t1.Selfassesment
        //                     }).ToList()
        //                    .Select(x => new EmployeeKRA()
        //                    {

        //                        EmployeeId = x.EmployeeId,
        //                        KRAStatusId = x.KRAStatusId,
        //                        Measure = x.Measure,
        //                        Weightage = x.Weightage,
        //                        KRAFromDate = x.KRAFromDate,
        //                        KRAToDate = x.KRAToDate,
        //                        KRAId = x.KRAId,
        //                        GoalDescription = x.GoalDescription,
        //                        GoalType = x.GoalType,
        //                        AppraisalCycleId = x.AppraisalCycleId,
        //                        Selfassesment = x.Selfassesment
        //                    }).ToList();

        //        return query != null ? query.ToList() : new List<EmployeeKRA>();
        //    }
        //    else
        //    {
        //        var query = (from t2 in context.EmployeeKRAs
        //                     join t1 in context.SelfassessmentTableDetails.Where(x => x.YearBreakCheck == Subcycle) on t2.KRAId equals t1.KRAId
        //                     //join t3 in context.EmployeeFeedBacks.Where(x => x.PerformCycleCheck == Subcycle) on t2.KRAId equals t3.QuestionaireId
        //                     into ps
        //                     from t1 in ps.DefaultIfEmpty()
        //                     where (t2.EmployeeId == employeeKRA.EmployeeId
        //                                                            && t2.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //                                                        )
        //                     select new
        //                     {
        //                         EmployeeId = t2.EmployeeId,
        //                         KRAStatusId = t2.KRAStatusId,
        //                         Measure = t2.Measure,
        //                         Weightage = t2.Weightage,
        //                         KRAFromDate = t2.KRAFromDate,
        //                         KRAToDate = t2.KRAToDate,
        //                         KRAId = t2.KRAId,
        //                         GoalDescription = t2.GoalDescription,
        //                         GoalType = t2.GoalType,
        //                         AppraisalCycleId = t2.AppraisalCycleId,
        //                         Selfassesment = t1.Selfassesment

        //                     }).ToList()
        //       .Select(x => new EmployeeKRA()
        //       {

        //           EmployeeId = x.EmployeeId,
        //           KRAStatusId = x.KRAStatusId,
        //           Measure = x.Measure,
        //           Weightage = x.Weightage,
        //           KRAFromDate = x.KRAFromDate,
        //           KRAToDate = x.KRAToDate,
        //           KRAId = x.KRAId,
        //           GoalDescription = x.GoalDescription,
        //           GoalType = x.GoalType,
        //           AppraisalCycleId = x.AppraisalCycleId,
        //           Selfassesment = x.Selfassesment
        //       }).ToList();

        //        return query != null ? query.ToList() : new List<EmployeeKRA>();
        //    }
        //}

        /// <summary>
        /// Display order: 1 Strategic, 2 Operational, 3 Developmental (matches S/O/D and expanded GoalType labels).
        /// </summary>
        private static int GetGoalTypeSortGroup(object goalTypeObj)
        {
            var s = (goalTypeObj == null || goalTypeObj == DBNull.Value) ? string.Empty : goalTypeObj.ToString().Trim();
            if (s.Length == 0) return 99;
            var u = s.ToUpperInvariant();
            if (u == "S" || u.StartsWith("STRATEGIC", StringComparison.Ordinal)) return 1;
            if (u == "O" || u.StartsWith("OPERATIONAL", StringComparison.Ordinal)) return 2;
            if (u == "D" || u.StartsWith("DEVELOPMENTAL", StringComparison.Ordinal)) return 3;
            return 99;
        }

        /// <summary>
        /// Reorders the first table in <paramref name="ds"/> without changing SPs or row data (only row order).
        /// </summary>
        private static void SortFirstKraTableStrategicOperationalDevelopmental(DataSet ds)
        {
            if (ds == null || ds.Tables.Count == 0) return;
            var source = ds.Tables[0];
            if (source.Rows.Count < 2 || !source.Columns.Contains("GoalType")) return;

            var work = source.Copy();
            const string gCol = "_KraSortGoalGroup";
            const string sCol = "_KraSortSeq";
            work.Columns.Add(gCol, typeof(int));
            work.Columns.Add(sCol, typeof(int));
            bool hasKraId = work.Columns.Contains("KRAId");

            foreach (DataRow r in work.Rows)
            {
                r[gCol] = GetGoalTypeSortGroup(r["GoalType"]);
                var seqVal = int.MaxValue;
                if (work.Columns.Contains("Sequence") && r["Sequence"] != DBNull.Value && r["Sequence"] != null)
                {
                    int parsed;
                    if (int.TryParse(r["Sequence"].ToString(), out parsed)) seqVal = parsed;
                }
                r[sCol] = seqVal;
            }

            var sort = gCol + " ASC, " + sCol + " ASC";
            if (hasKraId) sort += ", KRAId ASC";
            work.DefaultView.Sort = sort;
            var sorted = work.DefaultView.ToTable();
            sorted.Columns.Remove(gCol);
            sorted.Columns.Remove(sCol);
            sorted.TableName = source.TableName;
            ds.Tables.RemoveAt(0);
            ds.Tables.Add(sorted);
        }

        public DataSet GetKRA(EmployeeKRA employeeKRA, string SelfAssCycleId)
        {
            DataSet ds = new DataSet();
            try
            {
                // Open the connection (use your method to open the DB connection)
                OpeneConnection();

                // Define the SQL command to call the stored procedure
                string storedProcedureName = "GetSubmittedApprovedKRAForManagersFeedback";
                cmdObj = new SqlCommand(storedProcedureName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                // Adding parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeKRA.EmployeeId;
                cmdObj.Parameters.Add(new SqlParameter("@Subcycle", SqlDbType.NVarChar)).Value = SelfAssCycleId;
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = employeeKRA.AppraisalCycleId;

                // Add the KRAStatusId parameter if needed (only when KRAStatusId > 0)
                if (employeeKRA.KRAStatusId > 0)
                {
                    cmdObj.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = employeeKRA.KRAStatusId;
                }
                else
                {
                    // If KRAStatusId is 0 or invalid, you can either omit the parameter or pass NULL
                    cmdObj.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = DBNull.Value;
                }

                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);  // Fill the DataSet with the result of the stored procedure

                // Optionally name the table inside the DataSet for clarity
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "KRAData";  // Name the table (optional)
                    
                    // Add AttachmentPath column if it doesn't exist and populate it from EmployeeKRA table
                    EnrichDataSetWithAttachmentPath(ds.Tables[0]);
                    SortFirstKraTableStrategicOperationalDevelopmental(ds);
                }

                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRA");
            }

            return ds;
        }

        /// <summary>
        /// Get all KRAs for an employee and appraisal cycle (simplified for Copy KRA functionality)
        /// Uses stored procedure sp_PEP_KRA_GetAll with only AppraisalCycleId and EmployeeId
        /// Returns all KRAs regardless of status
        /// </summary>
        public DataSet GetKRAsForCopy(int appraisalCycleId, int employeeId)
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();

                using (SqlCommand cmdObj = new SqlCommand("sp_PEP_KRA_GetAll", ConCampus))
                {
                    cmdObj.CommandType = CommandType.StoredProcedure;
                    cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId });
                    cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmdObj.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int) { Value = DBNull.Value }); // Get all statuses

                    // Execute the stored procedure and fill the DataSet
                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                    dataAdapter.Fill(ds);

                    // Name the table inside the DataSet
                    if (ds.Tables.Count > 0)
                    {
                        ds.Tables[0].TableName = "KRAData";
                        
                        // Add AttachmentPath column if it doesn't exist and populate it from EmployeeKRA table
                        EnrichDataSetWithAttachmentPath(ds.Tables[0]);
                    }

                    // Close connection
                    CloseConnection();
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAsForCopy");
                CloseConnection();
                throw;
            }

            return ds;
        }

        public List<AppraisalCycleYearbreakupDetail> GetSubcycleCheck() // added by kaushal on 04-April-2020
        {
            IQueryable<AppraisalCycleYearbreakupDetail> query;

            var date = DateTime.Now;
            //var date1 = date.AddMonths(5)
            query = context.AppraisalCycleYearbreakupDetails.Where(x => (x.StartDate <= date && x.EndDate >= date));

            return query != null ? query.ToList() : new List<AppraisalCycleYearbreakupDetail>();
        }

        /// <summary>
        /// Get Employee Project Name by EmployeeId
        /// Uses stored procedure sp_PEP_GetEmployeeProjectName to fetch project details
        /// </summary>
        public DataTable GetEmployeeProjectName(int employeeId)
        {
            DataTable dtResult = new DataTable();
            try
            {
                OpeneConnection();

                using (SqlCommand cmdObj = new SqlCommand("spGetProjectByEmployeeId", ConCampus))
                {
                    cmdObj.CommandType = CommandType.StoredProcedure;
                    cmdObj.Parameters.Add(new SqlParameter("@EmployeeID", SqlDbType.Int) { Value = employeeId });

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                    dataAdapter.Fill(dtResult);
                }

                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeProjectName");
                CloseConnection();
                throw;
            }
            return dtResult;
        }

        /// <summary>
        /// Get all active grades for dropdown
        /// Uses stored procedure GetGradeList to fetch grades
        /// </summary>
        public DataTable GetGradeList()
        {
            DataTable dtResult = new DataTable();
            try
            {
                OpeneConnection();

                using (SqlCommand cmdObj = new SqlCommand("SP_GetGradeList", ConCampus))
                {
                    cmdObj.CommandType = CommandType.StoredProcedure;

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                    dataAdapter.Fill(dtResult);
                }

                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetGradeList");
                CloseConnection();
                throw;
            }
            return dtResult;
        }

        public List<EmployeeKRA> GetKRAForManagersFeedback(EmployeeKRA employeeKRA)
        {
            int KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
            var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
                                                                && x.KRAStatusId == KRAStatusId
                                                                && x.AppraisalCycleId == employeeKRA.AppraisalCycleId
                                                             //&& x.KRAToDate>DateTime.Today
                                                             )
                         orderby b.GoalType descending
                         select b
                        ).ToList();

            return query != null ? query.ToList() : new List<EmployeeKRA>();
        }
        public List<EmployeeKRA> GetKRAForSelfAsssement(EmployeeKRA employeeKRA)
        {
            var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
                                                                && x.KRAId == employeeKRA.KRAId
                                                             //&& x.KRAToDate>DateTime.Today
                                                             )
                         orderby b.GoalType descending
                         select b
                        ).ToList();

            return query != null ? query.ToList() : new List<EmployeeKRA>();
        }
        //public List<EmployeeKRA> GetSubmittedorApprovedKRAForManagersFeedback(EmployeeKRA employeeKRA, int selectedyear)
        //{
        //    var Subcycle = "";
        //    Subcycle = Convert.ToString(selectedyear);

        //    int SubmittedKRAStatusId = Convert.ToInt32(EnumCollection.KRA.Submitted);
        //    int ApprovedKRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);
        //    var query = (from t2 in context.EmployeeKRAs
        //                 join t1 in context.SelfassessmentTableDetails.Where(x => x.YearBreakCheck == Subcycle) on t2.KRAId equals t1.KRAId
        //                 //join t3 in context.EmployeeFeedBacks.Where(x => x.PerformCycleCheck == Subcycle) on t2.KRAId equals t3.QuestionaireId
        //                 into ps
        //                 from t1 in ps.DefaultIfEmpty()
        //                 where (t2.EmployeeId == employeeKRA.EmployeeId && (t2.KRAStatusId == SubmittedKRAStatusId || t2.KRAStatusId == ApprovedKRAStatusId)
        //                                                        && t2.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //                                                    )
        //                 select new
        //                 {
        //                     EmployeeId = t2.EmployeeId,
        //                     KRAStatusId = t2.KRAStatusId,
        //                     Measure = t2.Measure,
        //                     Weightage = t2.Weightage,
        //                     KRAFromDate = t2.KRAFromDate,
        //                     KRAToDate = t2.KRAToDate,
        //                     KRAId = t2.KRAId,
        //                     GoalDescription = t2.GoalDescription,
        //                     GoalType = t2.GoalType,
        //                     AppraisalCycleId = t2.AppraisalCycleId,
        //                     Selfassesment = t1.Selfassesment

        //                 }).ToList()
        //       .Select(x => new EmployeeKRA()
        //       {

        //           EmployeeId = x.EmployeeId,
        //           KRAStatusId = x.KRAStatusId,
        //           Measure = x.Measure,
        //           Weightage = x.Weightage,
        //           KRAFromDate = x.KRAFromDate,
        //           KRAToDate = x.KRAToDate,
        //           KRAId = x.KRAId,
        //           GoalDescription = x.GoalDescription,
        //           GoalType = x.GoalType,
        //           AppraisalCycleId = x.AppraisalCycleId,
        //           Selfassesment = x.Selfassesment
        //       }).ToList();

        //    //var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
        //    //                                                    && (x.KRAStatusId == SubmittedKRAStatusId || x.KRAStatusId == ApprovedKRAStatusId)
        //    //                                                    && x.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //    //                                                 //&& x.KRAToDate>DateTime.Today
        //    //                                                 )
        //    //             orderby b.GoalType descending
        //    //             select b
        //    //            ).ToList();

        //    return query != null ? query.ToList() : new List<EmployeeKRA>();
        //}


        public DataSet GetSubmittedorApprovedKRAForManagersFeedback(EmployeeKRA employeeKRA, int selectedyear)
         {
            DataSet ds = null;
            try
            {
                // Open the database connection (this depends on how you're opening it)
                OpeneConnection();

                // SQL command to execute the stored procedure
                string _sql = "GetSubmittedOrApprovedKRAForManagersFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                // Adding parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeKRA.EmployeeId;
                cmdObj.Parameters.Add(new SqlParameter("@SelectedYear", SqlDbType.Int)).Value = selectedyear;
                cmdObj.Parameters.Add(new SqlParameter("@SubmittedKRAStatusId", SqlDbType.Int)).Value = Convert.ToInt32(EnumCollection.KRA.Submitted);
                cmdObj.Parameters.Add(new SqlParameter("@ApprovedKRAStatusId", SqlDbType.Int)).Value = Convert.ToInt32(EnumCollection.KRA.Approved);
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = employeeKRA.AppraisalCycleId;

                // Execute the stored procedure and fill the DataSet
                ds = du.GetDataSetWithProc(cmdObj);

                // Optionally, name the first table
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "data";

                    // Modify the GoalType for each row in the dataset
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        if (row["GoalType"] != DBNull.Value)
                        {
                            row["GoalType"] = row["GoalType"].ToString() == "O" ? "Operational" : row["GoalType"].ToString() == "D" ? "Developmental" : "Strategic Goal (AI-Themed)";
                        }
                    }

                    SortFirstKraTableStrategicOperationalDevelopmental(ds);
                }

                // Close the database connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, "YourSectionName", "GetSubmittedOrApprovedKRAForManagersFeedback");
            }

            // Return the DataSet containing the result
            return ds;
        }



        //public List<EmployeeKRA> GetKRAForManagersApproval(EmployeeKRA employeeKRA)
        //{
        //    int KRAStatusIdA = Convert.ToInt32(EnumCollection.KRA.Approved);
        //    int KRAStatusIdS = Convert.ToInt32(EnumCollection.KRA.Submitted);


        //    var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
        //                                                        && (x.KRAStatusId == KRAStatusIdA || x.KRAStatusId == KRAStatusIdS)
        //                                                        && x.AppraisalCycleId == employeeKRA.AppraisalCycleId
        //                                                     )
        //                 orderby b.GoalType descending
        //                 select b
        //                ).ToList();

        //    return query != null ? query.ToList() : new List<EmployeeKRA>();
        //}

        public DataSet GetKRAForManagersApproval(EmployeeKRA employeeKRA)
        {
            DataSet ds = new DataSet();
            try
            {
                // Open the connection (use your method to open the DB connection)
                OpeneConnection();

                // Define the stored procedure name
                string storedProcedureName = "GetKRAForManagersApproval";

                // Create the SqlCommand object to call the stored procedure
                cmdObj = new SqlCommand(storedProcedureName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                // Add parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeKRA.EmployeeId;
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = employeeKRA.AppraisalCycleId;
                cmdObj.Parameters.Add(new SqlParameter("@KRAStatusIdA", SqlDbType.Int)).Value = Convert.ToInt32(EnumCollection.KRA.Approved);
                cmdObj.Parameters.Add(new SqlParameter("@KRAStatusIdS", SqlDbType.Int)).Value = Convert.ToInt32(EnumCollection.KRA.Submitted);

                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);  // Fill the DataSet with the result of the stored procedure

                // Optionally name the table inside the DataSet for clarity
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "KRAData";  // Name the table (optional)

                    // Modify the GoalType for each row in the dataset
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        if (row["GoalType"] != DBNull.Value)
                        {
                            // Set GoalType as "Operational" if it's "O", otherwise "Developmental"
                            row["GoalType"] = row["GoalType"].ToString() == "O" ? "Operational" : row["GoalType"].ToString() == "D" ? "Developmental" : "Strategic Goal (AI-Themed)";

                        }
                    }
                    
                    // Add AttachmentPath column if it doesn't exist and populate it from EmployeeKRA table
                    EnrichDataSetWithAttachmentPath(ds.Tables[0]);
                }

                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAForManagersApproval");
            }

            return ds;
        }

        /// <summary>
        /// Maps a row from SqlDataReader to EmployeeKRA (same column set as usp_GetEmployeeKRAById / usp_GetKRAToCopy).
        /// </summary>
        private static EmployeeKRA MapEmployeeKRAFromDataReader(SqlDataReader reader)
        {
            var employeeKRA = new EmployeeKRA
            {
                KRAId = reader.GetInt32(reader.GetOrdinal("KRAId")),
                EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId")),
                AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId")),
                KRAFromDate = reader.GetDateTime(reader.GetOrdinal("KRAFromDate")),
                KRAToDate = reader.GetDateTime(reader.GetOrdinal("KRAToDate")),
                GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType")),
                Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence")),
                GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription")),
                Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage")),
                ActionStep = reader.IsDBNull(reader.GetOrdinal("ActionStep")) ? null : reader.GetString(reader.GetOrdinal("ActionStep")),
                Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure")),
                TargetDate = reader.IsDBNull(reader.GetOrdinal("TargetDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("TargetDate")),
                KRAStatusId = reader.IsDBNull(reader.GetOrdinal("KRAStatusId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRAStatusId")),
                KRASetId = reader.IsDBNull(reader.GetOrdinal("KRASetId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRASetId")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn")),
                ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy")),
                ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn")),
                ManagerId = reader.IsDBNull(reader.GetOrdinal("ManagerId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ManagerId")),
                IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen")),
                Selfassesment = reader.IsDBNull(reader.GetOrdinal("Selfassesment")) ? null : reader.GetString(reader.GetOrdinal("Selfassesment"))
            };

            try
            {
                int ord = reader.GetOrdinal("AttachmentPath");
                employeeKRA.AttachmentPath = reader.IsDBNull(ord) ? null : reader.GetString(ord);
            }
            catch
            {
                employeeKRA.AttachmentPath = null;
            }

            int trainingItemIdOrdinal = reader.GetOrdinal("TrainingItemId");
            employeeKRA.TrainingItemId = reader.IsDBNull(trainingItemIdOrdinal) ? null : reader.GetString(trainingItemIdOrdinal);

            int trainingRequirementNameOrdinal = reader.GetOrdinal("TrainingRequirementName");
            employeeKRA.TrainingRequirementName = reader.IsDBNull(trainingRequirementNameOrdinal) ? null : reader.GetString(trainingRequirementNameOrdinal);

            try
            {
                int trainingCategoryOrdinal = reader.GetOrdinal("TrainingCategory");
                employeeKRA.TrainingCategory = reader.IsDBNull(trainingCategoryOrdinal) ? null : reader.GetString(trainingCategoryOrdinal);
            }
            catch
            {
                employeeKRA.TrainingCategory = null;
            }

            return employeeKRA;
        }

        /// <summary>
        /// Maps a DataRow to EmployeeKRA (same column set as usp_GetEmployeeKRAById / usp_GetKRAToCopy).
        /// </summary>
        private static EmployeeKRA MapEmployeeKRAFromDataRow(DataRow row)
        {
            if (row == null)
                return new EmployeeKRA();

            var employeeKRA = new EmployeeKRA
            {
                KRAId = Convert.ToInt32(row["KRAId"]),
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                AppraisalCycleId = row["AppraisalCycleId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["AppraisalCycleId"]),
                KRAFromDate = Convert.ToDateTime(row["KRAFromDate"]),
                KRAToDate = Convert.ToDateTime(row["KRAToDate"]),
                GoalType = row["GoalType"] == DBNull.Value ? null : row["GoalType"].ToString(),
                Sequence = row["Sequence"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["Sequence"]),
                GoalDescription = row["GoalDescription"] == DBNull.Value ? null : row["GoalDescription"].ToString(),
                Weightage = row["Weightage"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(row["Weightage"]),
                ActionStep = row["ActionStep"] == DBNull.Value ? null : row["ActionStep"].ToString(),
                Measure = row["Measure"] == DBNull.Value ? null : row["Measure"].ToString(),
                TargetDate = row["TargetDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["TargetDate"]),
                KRAStatusId = row["KRAStatusId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["KRAStatusId"]),
                KRASetId = row["KRASetId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["KRASetId"]),
                CreatedBy = row["CreatedBy"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["CreatedBy"]),
                CreatedOn = row["CreatedOn"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["CreatedOn"]),
                ModifiedBy = row["ModifiedBy"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["ModifiedBy"]),
                ModifiedOn = row["ModifiedOn"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["ModifiedOn"]),
                ManagerId = row["ManagerId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["ManagerId"]),
                IsSeen = row["IsSeen"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["IsSeen"]),
                Selfassesment = row["Selfassesment"] == DBNull.Value ? null : row["Selfassesment"].ToString()
            };

            if (row.Table.Columns.Contains("AttachmentPath") && row["AttachmentPath"] != DBNull.Value)
                employeeKRA.AttachmentPath = row["AttachmentPath"].ToString();
            else
                employeeKRA.AttachmentPath = null;

            employeeKRA.TrainingItemId = row.Table.Columns.Contains("TrainingItemId") && row["TrainingItemId"] != DBNull.Value
                ? row["TrainingItemId"].ToString()
                : null;
            employeeKRA.TrainingRequirementName = row.Table.Columns.Contains("TrainingRequirementName") && row["TrainingRequirementName"] != DBNull.Value
                ? row["TrainingRequirementName"].ToString()
                : null;

            if (row.Table.Columns.Contains("TrainingCategory") && row["TrainingCategory"] != DBNull.Value)
                employeeKRA.TrainingCategory = row["TrainingCategory"].ToString();
            else
                employeeKRA.TrainingCategory = null;

            return employeeKRA;
        }

        /// <summary>
        /// Gets KRAs eligible for copy (same filter as former LINQ: EmployeeId, KRAStatusId, AppraisalCycleId; ordered by GoalType DESC).
        /// Uses DataSet / SqlDataAdapter via DataUtility (consistent with other repository methods).
        /// </summary>
        public List<EmployeeKRA> GetKRAToCopy(EmployeeKRA employeeKRA)
        {
            var list = new List<EmployeeKRA>();
            if (employeeKRA == null)
                return list;

            try
            {
                OpeneConnection();

                var cmdObj = new SqlCommand("usp_GetKRAToCopy", ConCampus)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeKRA.EmployeeId;
                cmdObj.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value =
                    employeeKRA.KRAStatusId.HasValue ? (object)employeeKRA.KRAStatusId.Value : DBNull.Value;
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value =
                    employeeKRA.AppraisalCycleId.HasValue ? (object)employeeKRA.AppraisalCycleId.Value : DBNull.Value;

                DataSet ds = du.GetDataSetWithProc(cmdObj);

                CloseConnection();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    EnrichDataSetWithAttachmentPath(ds.Tables[0]);
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        list.Add(MapEmployeeKRAFromDataRow(row));
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAToCopy");
            }
            finally
            {
                CloseConnection();
            }

            return list;
        }
        public List<EmployeeKRA> ValidateKRAToCopy(EmployeeKRA employeeKRA)
        {
            var query = (from b in context.EmployeeKRAs.Where(x => x.EmployeeId == employeeKRA.EmployeeId
                                                                // && (x.KRAStatusId == employeeKRA.KRAStatusId)
                                                                && x.AppraisalCycleId == employeeKRA.AppraisalCycleId
                                                             )
                         orderby b.GoalType descending
                         select b
                        ).ToList();

            return query != null ? query.ToList() : new List<EmployeeKRA>();
        }


        public EmployeeKRA Get(int id)
        {
            // Use ADO.NET-based method instead of Entity Framework
            return GetKRAWithSP(id);
        }

        /// <summary>
        /// Get EmployeeKRA by ID using stored procedure for faster performance
        /// </summary>
        public EmployeeKRA GetKRAWithSP(int id)
        {
            try
            {
                // Use DataReader approach to ensure all columns are mapped correctly
                // This is more reliable than SqlQuery for new columns
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_GetEmployeeKRAById", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = id;
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            EmployeeKRA employeeKRA = new EmployeeKRA();
                            
                            // Map all columns explicitly
                            employeeKRA.KRAId = reader.GetInt32(reader.GetOrdinal("KRAId"));
                            employeeKRA.EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId"));
                            employeeKRA.AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId"));
                            employeeKRA.KRAFromDate = reader.GetDateTime(reader.GetOrdinal("KRAFromDate"));
                            employeeKRA.KRAToDate = reader.GetDateTime(reader.GetOrdinal("KRAToDate"));
                            employeeKRA.GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType"));
                            employeeKRA.Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence"));
                            employeeKRA.GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription"));
                            employeeKRA.Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage"));
                            employeeKRA.ActionStep = reader.IsDBNull(reader.GetOrdinal("ActionStep")) ? null : reader.GetString(reader.GetOrdinal("ActionStep"));
                            employeeKRA.ActionPlan = reader.IsDBNull(reader.GetOrdinal("ActionPlan")) ? null : reader.GetString(reader.GetOrdinal("ActionPlan"));
                            employeeKRA.Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure"));
                            employeeKRA.TargetDate = reader.IsDBNull(reader.GetOrdinal("TargetDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("TargetDate"));
                            employeeKRA.KRAStatusId = reader.IsDBNull(reader.GetOrdinal("KRAStatusId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRAStatusId"));
                            employeeKRA.KRASetId = reader.IsDBNull(reader.GetOrdinal("KRASetId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRASetId"));
                            employeeKRA.CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy"));
                            employeeKRA.CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn"));
                            employeeKRA.ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy"));
                            employeeKRA.ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn"));
                            employeeKRA.ManagerId = reader.IsDBNull(reader.GetOrdinal("ManagerId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ManagerId"));
                            employeeKRA.IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen"));
                            employeeKRA.Selfassesment = reader.IsDBNull(reader.GetOrdinal("Selfassesment")) ? null : reader.GetString(reader.GetOrdinal("Selfassesment"));
                            
                            // Map TrainingItemId and TrainingRequirementName explicitly
                            // TrainingItemId is now NVARCHAR(500) for comma-separated IDs
                            int trainingItemIdOrdinal = reader.GetOrdinal("TrainingItemId");
                            employeeKRA.TrainingItemId = reader.IsDBNull(trainingItemIdOrdinal) ? null : reader.GetString(trainingItemIdOrdinal);
                            
                            int trainingRequirementNameOrdinal = reader.GetOrdinal("TrainingRequirementName");
                            employeeKRA.TrainingRequirementName = reader.IsDBNull(trainingRequirementNameOrdinal) ? null : reader.GetString(trainingRequirementNameOrdinal);
                            
                            // Map TrainingCategory if column exists
                            try
                            {
                                int trainingCategoryOrdinal = reader.GetOrdinal("TrainingCategory");
                                employeeKRA.TrainingCategory = reader.IsDBNull(trainingCategoryOrdinal) ? null : reader.GetString(trainingCategoryOrdinal);
                            }
                            catch
                            {
                                // Column doesn't exist yet, set to null
                                employeeKRA.TrainingCategory = null;
                            }
                            
                            return employeeKRA;
                        }
                    }
                }
                
                return new EmployeeKRA();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAWithSP");
                // Fallback to EF (avoid calling Get(id) which would recurse into GetKRAWithSP)
                try
                {
                    var entity = context.EmployeeKRAs.FirstOrDefault(x => x.KRAId == id);
                    return entity ?? new EmployeeKRA();
                }
                catch
                {
                    return new EmployeeKRA();
                }
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Validate if Add Goal button should be shown using stored procedure (ADO.NET)
        /// </summary>
        public CanAddGoalResultEntity ValidateCanAddGoal(int employeeId, int appraisalCycleId, string subcycle = null)
        {
            try
            {
                OpeneConnection();
                
                SqlCommand cmdObj = new SqlCommand("usp_ValidateCanAddGoal", ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                // Add parameters
                cmdObj.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                
                // Add subcycle parameter if provided
                if (!string.IsNullOrEmpty(subcycle))
                {
                    cmdObj.Parameters.Add(new SqlParameter("@Subcycle", SqlDbType.NVarChar, 50)).Value = subcycle;
                }
                else
                {
                    cmdObj.Parameters.Add(new SqlParameter("@Subcycle", SqlDbType.NVarChar, 50)).Value = DBNull.Value;
                }
                
                // Execute stored procedure and get result
                DataSet ds = du.GetDataSetWithProc(cmdObj);
                CloseConnection();
                
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    return new CanAddGoalResultEntity
                    {
                        CanAddGoal = Convert.ToBoolean(row["CanAddGoal"]),
                        IsCycleActive = Convert.ToBoolean(row["IsCycleActive"]),
                        IsSubcycleClosed = row["IsSubcycleClosed"] != DBNull.Value ? Convert.ToBoolean(row["IsSubcycleClosed"]) : false,
                        HasInitializedKRA = Convert.ToBoolean(row["HasInitializedKRA"]),
                        TotalWeightage = row["TotalWeightage"] != DBNull.Value ? Convert.ToDecimal(row["TotalWeightage"]) : 0,
                        Message = row["Message"] != DBNull.Value ? row["Message"].ToString() : "Validation failed"
                    };
                }
                
                return new CanAddGoalResultEntity 
                { 
                    CanAddGoal = false, 
                    IsCycleActive = false, 
                    IsSubcycleClosed = false,
                    HasInitializedKRA = false, 
                    TotalWeightage = 0,
                    Message = "Validation failed"
                };
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ValidateCanAddGoal");
                return new CanAddGoalResultEntity 
                { 
                    CanAddGoal = false, 
                    IsCycleActive = false, 
                    IsSubcycleClosed = false,
                    HasInitializedKRA = false, 
                    TotalWeightage = 0,
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// Validate if Goal Modification Request button should be shown using stored procedure (ADO.NET)
        /// </summary>
        public CanRequestGoalModificationResultEntity ValidateCanRequestGoalModification(int employeeId, int appraisalCycleId, string cycle = null)
        {
            CanRequestGoalModificationResultEntity result = new CanRequestGoalModificationResultEntity 
            { 
                CanRequestModification = false, 
                IsCycleActive = false, 
                TotalWeightage = 0,
                AllGoalsApproved = false,
                HasPendingRequest = false,
                Message = "Validation failed"
            };
            
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_ValidateCanRequestGoalModification", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@Cycle", SqlDbType.NVarChar, 20)).Value = cycle ?? (object)DBNull.Value;
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            // Helper method to safely get column value
                            // Helper method to safely check if column exists
                            Func<string, bool> hasColumn = (colName) =>
                            {
                                try
                                {
                                    int ordinal = reader.GetOrdinal(colName);
                                    return ordinal >= 0;
                                }
                                catch (IndexOutOfRangeException)
                                {
                                    return false;
                                }
                                catch (ArgumentException)
                                {
                                    return false;
                                }
                                catch
                                {
                                    return false;
                                }
                            };
                            
                            Func<string, bool> getBool = (colName) =>
                            {
                                if (hasColumn(colName) && !reader.IsDBNull(reader.GetOrdinal(colName)))
                                    return reader.GetBoolean(reader.GetOrdinal(colName));
                                return false;
                            };
                            
                            Func<string, decimal> getDecimal = (colName) =>
                            {
                                if (hasColumn(colName) && !reader.IsDBNull(reader.GetOrdinal(colName)))
                                    return reader.GetDecimal(reader.GetOrdinal(colName));
                                return 0;
                            };
                            
                            Func<string, string> getString = (colName) =>
                            {
                                if (hasColumn(colName) && !reader.IsDBNull(reader.GetOrdinal(colName)))
                                    return reader.GetString(reader.GetOrdinal(colName));
                                return null;
                            };
                            
                            Func<string, bool?> getNullableBool = (colName) =>
                            {
                                if (hasColumn(colName) && !reader.IsDBNull(reader.GetOrdinal(colName)))
                                    return reader.GetBoolean(reader.GetOrdinal(colName));
                                return null;
                            };
                            
                            Func<string, int?> getNullableInt = (colName) =>
                            {
                                if (hasColumn(colName) && !reader.IsDBNull(reader.GetOrdinal(colName)))
                                    return reader.GetInt32(reader.GetOrdinal(colName));
                                return null;
                            };
                            
                            result = new CanRequestGoalModificationResultEntity
                            {
                                CanRequestModification = getBool("CanRequestModification"),
                                IsCycleActive = getBool("IsCycleActive"),
                                TotalWeightage = getDecimal("TotalWeightage"),
                                AllGoalsApproved = getBool("AllGoalsApproved"),
                                HasPendingRequest = getBool("HasPendingRequest"),
                                Message = getString("Message"),
                                // These columns may not exist in the stored procedure result
                                IsCycleClosed = getNullableBool("IsCycleClosed"),
                                HasSelfAssessment = getNullableBool("HasSelfAssessment"),
                                HasManagerFeedback = getNullableBool("HasManagerFeedback"),
                                TotalGoalsCount = getNullableInt("TotalGoalsCount"),
                                ApprovedGoalsCount = getNullableInt("ApprovedGoalsCount")
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ValidateCanRequestGoalModification");
                result.Message = ex.Message;
            }
            finally
            {
                CloseConnection();
            }
            
            return result;
        }

        /// <summary>
        /// Update attachment path for a KRA.
        /// Uses direct ADO.NET to ensure the value is always written to the EmployeeKRA table,
        /// independent of Entity Framework mappings.
        /// </summary>
        public bool UpdateAttachmentPath(int kraId, string attachmentPath)
        {
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("usp_UpdateEmployeeKRAAttachmentPath", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int) { Value = kraId });
                    cmd.Parameters.Add(new SqlParameter("@AttachmentPath", SqlDbType.NVarChar, 500)
                    {
                        Value = (object)attachmentPath ?? DBNull.Value
                    });

                    // Use ExecuteNonQuery and check return value
                    int rowsAffected = cmd.ExecuteNonQuery();
                    if (rowsAffected == 0)
                    {
                        ExceptionLogging.SendExcepToDB(new Exception($"No rows affected when updating AttachmentPath for KRAId {kraId}"), sectionName, "UpdateAttachmentPath");
                        return false;
                    }

                    return true;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "UpdateAttachmentPath");
                return false;
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Get attachment path for a KRA.
        /// Uses direct ADO.NET to reliably read the AttachmentPath column from EmployeeKRA,
        /// independent of Entity Framework mappings.
        /// </summary>
        public string GetAttachmentPath(int kraId)
        {
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("usp_GetEmployeeKRAAttachmentPath", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int) { Value = kraId });

                    var result = cmd.ExecuteScalar();
                    return result != null && result != DBNull.Value ? result.ToString() : null;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAttachmentPath");
                return null;
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Get all attachment paths for an employee in a specific appraisal cycle
        /// Uses stored procedure with SqlDataReader for reliable column mapping
        /// </summary>
        public List<BusinessEntities.KRAAttachmentEntity> GetAllAttachmentPaths(int employeeId, int appraisalCycleId)
        {
            List<BusinessEntities.KRAAttachmentEntity> results = new List<BusinessEntities.KRAAttachmentEntity>();
            
            try
            {
                // Use SqlDataReader approach to ensure all columns are mapped correctly
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_GetAllEmployeeKRAAttachmentPaths", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            BusinessEntities.KRAAttachmentEntity attachment = new BusinessEntities.KRAAttachmentEntity();
                            
                            // Map columns explicitly
                            attachment.KRAId = reader.GetInt32(reader.GetOrdinal("KRAId"));
                            
                            int filePathOrdinal = reader.GetOrdinal("FilePath");
                            attachment.FilePath = reader.IsDBNull(filePathOrdinal) ? null : reader.GetString(filePathOrdinal);
                            
                            int fileNameOrdinal = reader.GetOrdinal("FileName");
                            attachment.FileName = reader.IsDBNull(fileNameOrdinal) ? null : reader.GetString(fileNameOrdinal);
                            
                            results.Add(attachment);
                        }
                    }
                }
                
                return results;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAllAttachmentPaths");
                return new List<BusinessEntities.KRAAttachmentEntity>();
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Enriches a DataTable with AttachmentPath column by fetching from EmployeeKRA table.
        /// This ensures AttachmentPath is always populated in DataSet results from stored procedures,
        /// overriding any empty values returned directly by the procedure.
        /// </summary>
        private void EnrichDataSetWithAttachmentPath(DataTable dataTable)
        {
            try
            {
                // Ensure AttachmentPath column exists
                if (!dataTable.Columns.Contains("AttachmentPath"))
                {
                    dataTable.Columns.Add("AttachmentPath", typeof(string));
                }

                // Check if KRAId column exists (required to fetch AttachmentPath)
                if (!dataTable.Columns.Contains("KRAId"))
                {
                    return; // Cannot enrich without KRAId
                }

                // Populate / overwrite AttachmentPath for each row from EmployeeKRA table
                foreach (DataRow row in dataTable.Rows)
                {
                    if (row["KRAId"] != DBNull.Value)
                    {
                        int kraId = Convert.ToInt32(row["KRAId"]);
                        string attachmentPath = GetAttachmentPath(kraId);
                        row["AttachmentPath"] = (object)attachmentPath ?? DBNull.Value;
                    }
                    else
                    {
                        row["AttachmentPath"] = DBNull.Value;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail - AttachmentPath will just be null/empty
                ExceptionLogging.SendExcepToDB(ex, sectionName, "EnrichDataSetWithAttachmentPath");
            }
        }

        public int Insert(EmployeeKRA obj)
        {
            EmployeeKRA employeeKRA = context.Set<EmployeeKRA>().Add(obj);
            int result = context.SaveChanges();
            if (result > 0) //modified by Janice 10Apr2017
                return employeeKRA.KRAId;
            else
                return 0;
        }

        /// <summary>
        /// Insert EmployeeKRA using stored procedure for faster performance
        /// </summary>
        public int InsertKRAWithSP(EmployeeKRA obj)
        {
            try
            {
                // CRITICAL VALIDATION: Ensure EmployeeId is set correctly before calling stored procedure
                // For manager-created goals (flag == 1), EmployeeId should be reportee's ID, not manager's ID
                if (obj.EmployeeId <= 0)
                {
                    throw new Exception("EmployeeId must be greater than 0");
                }
                
                var kraIdParam = new SqlParameter
                {
                    ParameterName = "@KRAId",
                    SqlDbType = SqlDbType.Int,
                    Direction = ParameterDirection.Output
                };

                // Build parameter list - CRITICAL: @EmployeeId parameter MUST be the reportee's ID for team mode, not the manager's ID
                // Note: ModifiedBy and ModifiedOn are not included in the stored procedure call for inserts
                // They will be set to NULL for new inserts and can be updated later if needed
                // TrainingItemId and TrainingRequirementName are now included in the stored procedure
                var parameters = new List<SqlParameter>
                {
                    new SqlParameter("@EmployeeId", obj.EmployeeId), // This MUST be reportee's ID for team mode
                    new SqlParameter("@AppraisalCycleId", obj.AppraisalCycleId ?? (object)DBNull.Value),
                    new SqlParameter("@KRAFromDate", obj.KRAFromDate),
                    new SqlParameter("@KRAToDate", obj.KRAToDate),
                    new SqlParameter("@GoalType", obj.GoalType ?? (object)DBNull.Value),
                    new SqlParameter("@Sequence", obj.Sequence ?? (object)DBNull.Value),
                    new SqlParameter("@GoalDescription", obj.GoalDescription ?? (object)DBNull.Value),
                    new SqlParameter("@Weightage", obj.Weightage ?? (object)DBNull.Value),
                    new SqlParameter("@ActionStep", obj.ActionStep ?? (object)DBNull.Value),
                    new SqlParameter("@ActionPlan", obj.ActionPlan ?? (object)DBNull.Value),
                    new SqlParameter("@Measure", obj.Measure ?? (object)DBNull.Value),
                    new SqlParameter("@TargetDate", obj.TargetDate ?? (object)DBNull.Value),
                    new SqlParameter("@KRAStatusId", obj.KRAStatusId ?? (object)DBNull.Value),
                    new SqlParameter("@KRASetId", obj.KRASetId ?? (object)DBNull.Value),
                    new SqlParameter("@CreatedBy", obj.CreatedBy ?? (object)DBNull.Value),
                    new SqlParameter("@CreatedOn", obj.CreatedOn ?? DateTime.Now),
                    // For TrainingItemId: pass comma-separated string of IDs, or null if not set
                    // TrainingItemId is NVARCHAR(500) in the database
                    new SqlParameter("@TrainingItemId", SqlDbType.NVarChar, 500) { Value = string.IsNullOrEmpty(obj.TrainingItemId) ? (object)DBNull.Value : obj.TrainingItemId },
                    // TrainingRequirementName is NVARCHAR(MAX) in the database
                    new SqlParameter("@TrainingRequirementName", SqlDbType.NVarChar, -1) { Value = obj.TrainingRequirementName ?? (object)DBNull.Value },
                    // TrainingCategory is NVARCHAR(500) in the database for comma-separated categories
                    new SqlParameter("@TrainingCategory", SqlDbType.NVarChar, 500) { Value = string.IsNullOrEmpty(obj.TrainingCategory) ? (object)DBNull.Value : obj.TrainingCategory },
                    kraIdParam
                };
                
                // Stored procedure signature: usp_InsertEmployeeKRA now includes TrainingItemId, TrainingRequirementName, and TrainingCategory
                // ModifiedBy and ModifiedOn are not included in the stored procedure call for inserts
                // They will be set to NULL for new inserts and can be updated later if needed
                string spCommand = "exec [dbo].[usp_InsertEmployeeKRA] @EmployeeId, @AppraisalCycleId, @KRAFromDate, @KRAToDate, @GoalType, @Sequence, @GoalDescription, @Weightage, @ActionStep, @ActionPlan, @Measure, @TargetDate, @KRAStatusId, @KRASetId, @CreatedBy, @CreatedOn, @TrainingItemId, @TrainingRequirementName, @TrainingCategory, @KRAId OUTPUT";
                
                // Log the values being passed to stored procedure for debugging
                var trainingItemIdValue = obj.TrainingItemId ?? "NULL";
                var trainingRequirementNameValue = obj.TrainingRequirementName ?? "NULL";
                
                // Note: Using System.Diagnostics.Debug for debugging instead of ExceptionLogging
                // ExceptionLogging is for actual exceptions, not debug logging
                System.Diagnostics.Debug.WriteLine($"InsertKRAWithSP - Before SP call - TrainingItemId: {trainingItemIdValue}, TrainingRequirementName: {trainingRequirementNameValue}");
                
                context.Database.ExecuteSqlCommand(spCommand, parameters.ToArray());

                int insertedKRAId = (int)kraIdParam.Value;
                
                // Log after SP call
                System.Diagnostics.Debug.WriteLine($"InsertKRAWithSP - After SP call - KRAId: {insertedKRAId}, TrainingItemId: {trainingItemIdValue}, TrainingRequirementName: {trainingRequirementNameValue}");
                
                // If ModifiedBy is set (e.g., manager adding goal for team member), update it after insert
                if (obj.ModifiedBy.HasValue && obj.ModifiedBy.Value > 0 && insertedKRAId > 0)
                {
                    context.Database.ExecuteSqlCommand(
                        "EXEC [dbo].[usp_UpdateEmployeeKRAModifiedBy] @KRAId, @ModifiedBy, @ModifiedOn",
                        new SqlParameter("@KRAId", insertedKRAId),
                        new SqlParameter("@ModifiedBy", obj.ModifiedBy.Value),
                        new SqlParameter("@ModifiedOn", obj.ModifiedOn ?? DateTime.Now));
                }

                return insertedKRAId;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertKRAWithSP");
                throw ex;
            }
        }
        /// <summary>
        /// Insert Self Assessment using stored procedure with goal snapshot (ADO.NET)
        /// Stores snapshot on every save as goals may be modified during transaction
        /// </summary>
        public bool InsertSelfassessment(EmployeeKRA EmployeeKRAentity, string YearSubCycleCheck)
        {
            bool isInserted = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_SelfAssessment_Insert", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = EmployeeKRAentity.KRAId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = EmployeeKRAentity.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = EmployeeKRAentity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@Selfassesment", SqlDbType.NVarChar, -1)).Value = EmployeeKRAentity.Selfassesment ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@YearBreakCheck", SqlDbType.NVarChar, 20)).Value = YearSubCycleCheck;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = EmployeeKRAentity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@RM", SqlDbType.Int)).Value = (object)DBNull.Value;
                    
                    SqlParameter idParam = new SqlParameter("@Id", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(idParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    int insertedId = idParam.Value != DBNull.Value ? Convert.ToInt32(idParam.Value) : 0;
                    isInserted = insertedId > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertSelfassessment");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return isInserted;
        }
        
        /// <summary>
        /// Insert Self Assessment and return the inserted SelfAssessmentId
        /// </summary>
        public int InsertSelfassessmentReturnId(EmployeeKRA EmployeeKRAentity, string YearSubCycleCheck)
        {
            int insertedId = 0;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_SelfAssessment_Insert", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = EmployeeKRAentity.KRAId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = EmployeeKRAentity.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = EmployeeKRAentity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@Selfassesment", SqlDbType.NVarChar, 4000)).Value = EmployeeKRAentity.Selfassesment ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@YearBreakCheck", SqlDbType.NVarChar, 20)).Value = YearSubCycleCheck;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = EmployeeKRAentity.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@RM", SqlDbType.Int)).Value = (object)DBNull.Value;
                    
                    SqlParameter idParam = new SqlParameter("@Id", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(idParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    insertedId = idParam.Value != DBNull.Value ? Convert.ToInt32(idParam.Value) : 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertSelfassessmentReturnId");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return insertedId;
        }
        
        /// <summary>
        /// Insert Self Assessment Attachment using stored procedure
        /// </summary>
        public bool InsertSelfAssessmentAttachment(int SelfAssessmentId, int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId, string AttachmentPath, string OriginalFileName, long? FileSize, string ContentType, int CreatedBy)
        {
            bool isInserted = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_InsertSelfAssessmentAttachment", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@SelfAssessmentId", SqlDbType.Int)).Value = SelfAssessmentId;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = AppraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@SelfAssessmentCycleId", SqlDbType.Int)).Value = SelfAssessmentCycleId.HasValue ? (object)SelfAssessmentCycleId.Value : DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@AttachmentPath", SqlDbType.NVarChar, 500)).Value = AttachmentPath;
                    cmd.Parameters.Add(new SqlParameter("@OriginalFileName", SqlDbType.NVarChar, 500)).Value = OriginalFileName ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@FileSize", SqlDbType.BigInt)).Value = FileSize.HasValue ? (object)FileSize.Value : DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ContentType", SqlDbType.NVarChar, 100)).Value = ContentType ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = CreatedBy;
                    
                    SqlParameter attachmentIdParam = new SqlParameter("@AttachmentId", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(attachmentIdParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    int insertedId = attachmentIdParam.Value != DBNull.Value ? Convert.ToInt32(attachmentIdParam.Value) : 0;
                    isInserted = insertedId > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertSelfAssessmentAttachment");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return isInserted;
        }
        
        /// <summary>
        /// Get Self Assessment Attachments by SelfAssessmentId using stored procedure
        /// </summary>
        public DataTable GetSelfAssessmentAttachments(int SelfAssessmentId)
        {
            DataTable dt = new DataTable();
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_GetSelfAssessmentAttachments", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@SelfAssessmentId", SqlDbType.Int)).Value = SelfAssessmentId;
                    
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSelfAssessmentAttachments");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return dt;
        }
        
        /// <summary>
        /// Get Self Assessment Attachments by Employee, AppraisalCycle, and SelfAssessmentCycle using stored procedure
        /// </summary>
        public DataTable GetSelfAssessmentAttachmentsByEmployeeCycle(int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId)
        {
            DataTable dt = new DataTable();
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_GetSelfAssessmentAttachmentsByEmployeeCycle", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = AppraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@SelfAssessmentCycleId", SqlDbType.Int)).Value = SelfAssessmentCycleId.HasValue ? (object)SelfAssessmentCycleId.Value : DBNull.Value;
                    
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSelfAssessmentAttachmentsByEmployeeCycle");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return dt;
        }
        
        /// <summary>
        /// Get Self Assessment Attachment by AttachmentId using stored procedure
        /// </summary>
        public DataTable GetSelfAssessmentAttachmentById(int AttachmentId)
        {
            DataTable dt = new DataTable();
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_GetSelfAssessmentAttachmentById", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@AttachmentId", SqlDbType.Int)).Value = AttachmentId;
                    
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        da.Fill(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSelfAssessmentAttachmentById");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return dt;
        }

        /// <summary>
        /// Soft-delete (IsActive = 0) a self-assessment attachment if it belongs to the employee.
        /// </summary>
        public bool DeactivateSelfAssessmentAttachment(int AttachmentId, int EmployeeId, int ModifiedBy)
        {
            bool updated = false;
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("usp_DeactivateSelfAssessmentAttachment", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@AttachmentId", SqlDbType.Int)).Value = AttachmentId;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = ModifiedBy;
                    int rows = cmd.ExecuteNonQuery();
                    updated = rows > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "DeactivateSelfAssessmentAttachment");
                throw;
            }
            finally
            {
                CloseConnection();
            }

            return updated;
        }
        
        /// <summary>
        /// Update EmployeeKRA using stored procedure for consistency with Insert
        /// </summary>
        public bool Update(EmployeeKRA obj)
        {
            // Use ADO.NET directly instead of Entity Framework
            return UpdateWithSP(obj);
        }

        /// <summary>
        /// Update EmployeeKRA using stored procedure with ADO.NET (DataSet approach)
        /// This method uses direct ADO.NET calls instead of Entity Framework
        /// </summary>
        public bool UpdateWithSP(EmployeeKRA obj)
        {
            bool isUpdated = false;
            
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("usp_UpdateEmployeeKRA", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // Add all parameters
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = obj.KRAId;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = obj.EmployeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = obj.AppraisalCycleId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAFromDate", SqlDbType.DateTime)).Value = obj.KRAFromDate;
                    cmd.Parameters.Add(new SqlParameter("@KRAToDate", SqlDbType.DateTime)).Value = obj.KRAToDate;
                    cmd.Parameters.Add(new SqlParameter("@GoalType", SqlDbType.NVarChar, 50)).Value = obj.GoalType ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Sequence", SqlDbType.Int)).Value = obj.Sequence ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@GoalDescription", SqlDbType.NVarChar, 4000)).Value = obj.GoalDescription ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Weightage", SqlDbType.Decimal)).Value = obj.Weightage ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionStep", SqlDbType.NVarChar, 4000)).Value = obj.ActionStep ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ActionPlan", SqlDbType.NVarChar, 4000)).Value = obj.ActionPlan ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@Measure", SqlDbType.NVarChar, 4000)).Value = obj.Measure ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@TargetDate", SqlDbType.DateTime)).Value = obj.TargetDate ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = obj.KRAStatusId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRASetId", SqlDbType.Int)).Value = obj.KRASetId ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = obj.ModifiedBy ?? (object)DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedOn", SqlDbType.DateTime)).Value = obj.ModifiedOn ?? DateTime.Now;
                    
                    // TrainingItemId is NVARCHAR(500) for comma-separated IDs
                    var trainingItemIdParam = new SqlParameter("@TrainingItemId", SqlDbType.NVarChar, 500);
                    trainingItemIdParam.Value = string.IsNullOrEmpty(obj.TrainingItemId) ? (object)DBNull.Value : obj.TrainingItemId;
                    cmd.Parameters.Add(trainingItemIdParam);
                    
                    // TrainingRequirementName is NVARCHAR(MAX)
                    var trainingRequirementNameParam = new SqlParameter("@TrainingRequirementName", SqlDbType.NVarChar, -1);
                    trainingRequirementNameParam.Value = obj.TrainingRequirementName ?? (object)DBNull.Value;
                    cmd.Parameters.Add(trainingRequirementNameParam);
                    
                    // TrainingCategory is NVARCHAR(500) for comma-separated categories
                    var trainingCategoryParam = new SqlParameter("@TrainingCategory", SqlDbType.NVarChar, 500);
                    trainingCategoryParam.Value = string.IsNullOrEmpty(obj.TrainingCategory) ? (object)DBNull.Value : obj.TrainingCategory;
                    cmd.Parameters.Add(trainingCategoryParam);
                    
                    cmd.Parameters.Add(new SqlParameter("@Selfassesment", SqlDbType.NVarChar, -1)).Value = obj.Selfassesment ?? (object)DBNull.Value;
                    
                    // Add return value parameter
                    SqlParameter returnValueParam = new SqlParameter("@ReturnValue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(returnValueParam);
                    
                    // Log the parameter values for debugging
                    var trainingItemIdValue = obj.TrainingItemId ?? "NULL";
                    System.Diagnostics.Debug.WriteLine($"UpdateWithSP - TrainingItemId: {trainingItemIdValue}, TrainingRequirementName: {obj.TrainingRequirementName ?? "NULL"}, TrainingCategory: {obj.TrainingCategory ?? "NULL"}");
                    
                    // Execute the stored procedure
                    cmd.ExecuteNonQuery();
                    
                    // Retrieve the return value
                    int returnValue = returnValueParam.Value != DBNull.Value ? Convert.ToInt32(returnValueParam.Value) : -1;
                    
                    // ReturnValue: 1 = Success, 0 = No rows updated, -1 = Error
                    isUpdated = returnValue == 1;
                }
            }
            catch (Exception ex)
            {
                // Log the full exception details for debugging
                string errorDetails = $"Error updating EmployeeKRA via stored procedure. KRAId: {obj?.KRAId ?? 0}, Exception: {ex.Message}, InnerException: {ex.InnerException?.Message ?? "None"}, StackTrace: {ex.StackTrace}";
                ExceptionLogging.SendExcepToDB(ex, sectionName, "UpdateWithSP");
                System.Diagnostics.Debug.WriteLine(errorDetails);
                throw new Exception(errorDetails, ex);
            }
            finally
            {
                CloseConnection();
            }
            
            return isUpdated;
        }

        /// <summary>
        /// Delete EmployeeKRA using stored procedure (ADO.NET)
        /// </summary>
        public bool Delete(EmployeeKRA obj)
        {
            bool isDeleted = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_KRA_Delete", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = obj.KRAId;
                    
                    SqlParameter rowsAffectedParam = new SqlParameter("@RowsAffected", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(rowsAffectedParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    int rowsAffected = rowsAffectedParam.Value != DBNull.Value ? Convert.ToInt32(rowsAffectedParam.Value) : 0;
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
        /// Delete all goals for an employee in a specific appraisal cycle (only non-approved goals)
        /// Used when overriding existing goals with Reference Goal Repository
        /// </summary>
        public bool DeleteGoalsByEmployeeAndCycle(int employeeId, int appraisalCycleId)
        {
            bool isDeleted = false;
            try
            {
                OpeneConnection();

                // Delete only non-approved goals (Initialised=1, Submitted=2, Rejected=18)
                // Do not delete Approved (3) or Completed (4) goals
                string sql = @"DELETE FROM EmployeeKRA 
                              WHERE EmployeeId = @EmployeeId 
                              AND AppraisalCycleId = @AppraisalCycleId 
                              AND KRAStatusId =1";

                using (SqlCommand cmd = new SqlCommand(sql, ConCampus))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;

                    int rowsAffected = cmd.ExecuteNonQuery();
                    isDeleted = rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "DeleteGoalsByEmployeeAndCycle");
                throw;
            }
            finally
            {
                CloseConnection();
            }

            return isDeleted;
        }

        /// <summary>
        /// Get all EmployeeKRAs using stored procedure (ADO.NET)
        /// </summary>
        public List<EmployeeKRA> Get()
        {
            List<EmployeeKRA> result = new List<EmployeeKRA>();
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_KRA_GetList", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = DBNull.Value;
                    cmd.Parameters.Add(new SqlParameter("@KRAStatusId", SqlDbType.Int)).Value = DBNull.Value;
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            EmployeeKRA kra = new EmployeeKRA
                            {
                                KRAId = reader.GetInt32(reader.GetOrdinal("KRAId")),
                                AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId")),
                                EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId")),
                                Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence")),
                                GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType")),
                                GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription")),
                                Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage")),
                                ActionStep = reader.IsDBNull(reader.GetOrdinal("ActionStep")) ? null : reader.GetString(reader.GetOrdinal("ActionStep")),
                                ActionPlan = reader.IsDBNull(reader.GetOrdinal("ActionPlan")) ? null : reader.GetString(reader.GetOrdinal("ActionPlan")),
                                Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure")),
                                TargetDate = reader.IsDBNull(reader.GetOrdinal("TargetDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("TargetDate")),
                                KRAFromDate = reader.GetDateTime(reader.GetOrdinal("KRAFromDate")),
                                KRAToDate = reader.GetDateTime(reader.GetOrdinal("KRAToDate")),
                                KRAStatusId = reader.IsDBNull(reader.GetOrdinal("KRAStatusId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRAStatusId")),
                                CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                                CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn")),
                                ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy")),
                                ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn")),
                                KRASetId = reader.IsDBNull(reader.GetOrdinal("KRASetId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRASetId")),
                                ManagerId = reader.IsDBNull(reader.GetOrdinal("ManagerId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ManagerId")),
                                IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen")),
                                Selfassesment = reader.IsDBNull(reader.GetOrdinal("Selfassesment")) ? null : reader.GetString(reader.GetOrdinal("Selfassesment")),
                                AttachmentPath = reader.IsDBNull(reader.GetOrdinal("AttachmentPath")) ? null : reader.GetString(reader.GetOrdinal("AttachmentPath")),
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
        /// Get KRA Notifications using stored procedure (ADO.NET)
        /// Note: This method signature is kept for compatibility but should use stored procedure
        /// </summary>
        public IEnumerable<GetKRANotifications_Result> GetNotifications(string query, params object[] parameters)
        {
            // For now, keep using SqlQuery for backward compatibility
            // TODO: Replace with dedicated stored procedure if needed
            return context.Database.SqlQuery<GetKRANotifications_Result>(query, parameters).ToList<GetKRANotifications_Result>();
        }

        public bool UpdateDataSet(DataRow dataRow)
        {
            bool isUpdated = false;

            try
            {
                OpeneConnection();

                string procName = "UpdateEmployeeKRAStatus";
                using (SqlCommand cmd = new SqlCommand(procName, ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Extracting values from DataRow
                    int AppraisalCycleId = Convert.ToInt32(dataRow["AppraisalCycleId"]);
                    int employeeId = Convert.ToInt32(dataRow["EmployeeId"]);
                    int statusId = Convert.ToInt32(dataRow["KRAStatusId"]);
                    int ModifiedBy = Convert.ToInt32(dataRow["ModifiedBy"]);
                    int KRAId = Convert.ToInt32(dataRow["KRAId"]);
                    // Adding input parameters
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@StatusId", SqlDbType.Int)).Value = statusId;
                    cmd.Parameters.Add(new SqlParameter("@LogInId", SqlDbType.Int)).Value = ModifiedBy;
                    cmd.Parameters.Add(new SqlParameter("@KRAId", SqlDbType.Int)).Value = KRAId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = AppraisalCycleId;

                    // Adding output parameter for return status
                    SqlParameter returnStatusParam = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(returnStatusParam);

                    // Execute the stored procedure
                    cmd.ExecuteNonQuery();

                    // Retrieve the output value
                    isUpdated = Convert.ToInt32(returnStatusParam.Value) == 1;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error updating EmployeeKRA status via stored procedure", ex);
            }
            finally
            {
                CloseConnection();
            }

            return isUpdated;
        }

        /// <summary>
        /// Reject all KRAs for an employee in a specific appraisal cycle using stored procedure
        /// This is optimized to update all KRAs in a single operation
        /// </summary>
        public bool RejectEmployeeKRA(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            bool isRejected = false;
            
            try
            {
                OpeneConnection();
                
                string procName = "usp_RejectEmployeeKRA";
                using (SqlCommand cmd = new SqlCommand(procName, ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // Add input parameters
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = modifiedBy;
                    // RejectedStatusId will use default value (18) from stored procedure
                    
                    // Add return value parameter
                    SqlParameter returnValueParam = new SqlParameter("@ReturnValue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.ReturnValue
                    };
                    cmd.Parameters.Add(returnValueParam);
                    
                    // Execute the stored procedure
                    cmd.ExecuteNonQuery();
                    
                    // Retrieve the return value
                    int returnStatus = returnValueParam.Value != DBNull.Value ? Convert.ToInt32(returnValueParam.Value) : 0;
                    
                    isRejected = returnStatus == 1;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "RejectEmployeeKRA");
                throw new Exception("Error rejecting EmployeeKRA via stored procedure", ex);
            }
            finally
            {
                CloseConnection();
            }
            
            return isRejected;
        }

        public bool ApproveEmployeeKRA(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            bool isApproved = false;
            
            try
            {
                OpeneConnection();
                
                string procName = "usp_ApproveEmployeeKRA";
                using (SqlCommand cmd = new SqlCommand(procName, ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // Add input parameters
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@ModifiedBy", SqlDbType.Int)).Value = modifiedBy;
                    // ApprovedStatusId will use default value (3) from stored procedure
                    
                    // Add return value parameter
                    SqlParameter returnValueParam = new SqlParameter("@ReturnValue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.ReturnValue
                    };
                    cmd.Parameters.Add(returnValueParam);
                    
                    // Execute the stored procedure
                    cmd.ExecuteNonQuery();
                    
                    // Retrieve the return value
                    int returnStatus = returnValueParam.Value != DBNull.Value ? Convert.ToInt32(returnValueParam.Value) : 0;
                    
                    isApproved = returnStatus == 1;
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ApproveEmployeeKRA");
                throw new Exception("Error approving EmployeeKRA via stored procedure", ex);
            }
            finally
            {
                CloseConnection();
            }
            
            return isApproved;
        }

        /// <summary>
        /// Get approved KRAs for an employee in an appraisal cycle that have TrainingItemId set
        /// Includes "Others" (TrainingItemId = 0) as well
        /// Uses stored procedure with SqlDataReader for reliable column mapping
        /// </summary>
        public List<EmployeeKRA> GetApprovedKRAsWithTraining(int employeeId, int appraisalCycleId)
        {
            List<EmployeeKRA> approvedKRAs = new List<EmployeeKRA>();
            
            try
            {
                // Use SqlDataReader approach to ensure all columns are mapped correctly
                // This is more reliable than Entity Framework SqlQuery for new columns
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_GetApprovedKRAsWithTraining", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmd.Parameters.Add(new SqlParameter("@ApprovedStatusId", SqlDbType.Int) { Value = Convert.ToInt32(EnumCollection.KRA.Approved) });
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            EmployeeKRA employeeKRA = new EmployeeKRA();
                            
                            // Map all columns explicitly
                            employeeKRA.KRAId = reader.GetInt32(reader.GetOrdinal("KRAId"));
                            employeeKRA.EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId"));
                            employeeKRA.AppraisalCycleId = reader.IsDBNull(reader.GetOrdinal("AppraisalCycleId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("AppraisalCycleId"));
                            employeeKRA.KRAFromDate = reader.GetDateTime(reader.GetOrdinal("KRAFromDate"));
                            employeeKRA.KRAToDate = reader.GetDateTime(reader.GetOrdinal("KRAToDate"));
                            employeeKRA.GoalType = reader.IsDBNull(reader.GetOrdinal("GoalType")) ? null : reader.GetString(reader.GetOrdinal("GoalType"));
                            employeeKRA.Sequence = reader.IsDBNull(reader.GetOrdinal("Sequence")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Sequence"));
                            employeeKRA.GoalDescription = reader.IsDBNull(reader.GetOrdinal("GoalDescription")) ? null : reader.GetString(reader.GetOrdinal("GoalDescription"));
                            employeeKRA.Weightage = reader.IsDBNull(reader.GetOrdinal("Weightage")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("Weightage"));
                            employeeKRA.ActionStep = reader.IsDBNull(reader.GetOrdinal("ActionStep")) ? null : reader.GetString(reader.GetOrdinal("ActionStep"));
                            employeeKRA.ActionPlan = reader.IsDBNull(reader.GetOrdinal("ActionPlan")) ? null : reader.GetString(reader.GetOrdinal("ActionPlan"));
                            employeeKRA.Measure = reader.IsDBNull(reader.GetOrdinal("Measure")) ? null : reader.GetString(reader.GetOrdinal("Measure"));
                            employeeKRA.TargetDate = reader.IsDBNull(reader.GetOrdinal("TargetDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("TargetDate"));
                            employeeKRA.KRAStatusId = reader.IsDBNull(reader.GetOrdinal("KRAStatusId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRAStatusId"));
                            employeeKRA.KRASetId = reader.IsDBNull(reader.GetOrdinal("KRASetId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("KRASetId"));
                            employeeKRA.CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy"));
                            employeeKRA.CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CreatedOn"));
                            employeeKRA.ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy"));
                            employeeKRA.ModifiedOn = reader.IsDBNull(reader.GetOrdinal("ModifiedOn")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ModifiedOn"));
                            employeeKRA.ManagerId = reader.IsDBNull(reader.GetOrdinal("ManagerId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ManagerId"));
                            employeeKRA.IsSeen = reader.IsDBNull(reader.GetOrdinal("IsSeen")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("IsSeen"));
                            employeeKRA.Selfassesment = reader.IsDBNull(reader.GetOrdinal("Selfassesment")) ? null : reader.GetString(reader.GetOrdinal("Selfassesment"));
                            
                            // Map TrainingItemId and TrainingRequirementName explicitly
                            // TrainingItemId is now NVARCHAR(500) for comma-separated IDs
                            int trainingItemIdOrdinal = reader.GetOrdinal("TrainingItemId");
                            employeeKRA.TrainingItemId = reader.IsDBNull(trainingItemIdOrdinal) ? null : reader.GetString(trainingItemIdOrdinal);
                            
                            int trainingRequirementNameOrdinal = reader.GetOrdinal("TrainingRequirementName");
                            employeeKRA.TrainingRequirementName = reader.IsDBNull(trainingRequirementNameOrdinal) ? null : reader.GetString(trainingRequirementNameOrdinal);
                            
                            // Map TrainingCategory if column exists
                            try
                            {
                                int trainingCategoryOrdinal = reader.GetOrdinal("TrainingCategory");
                                employeeKRA.TrainingCategory = reader.IsDBNull(trainingCategoryOrdinal) ? null : reader.GetString(trainingCategoryOrdinal);
                            }
                            catch
                            {
                                // Column doesn't exist yet, set to null
                                employeeKRA.TrainingCategory = null;
                            }
                            
                            approvedKRAs.Add(employeeKRA);
                        }
                    }
                }
                
                return approvedKRAs;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetApprovedKRAsWithTraining");
                return new List<EmployeeKRA>();
            }
            finally
            {
                CloseConnection();
            }
        }

        /// <summary>
        /// Get KRAs with training data for an employee (Submitted or Approved status).
        /// Used when processing training requests after Manager Feedback submit.
        /// </summary>
        public List<EmployeeKRA> GetKRAsWithTrainingForFeedback(int employeeId, int appraisalCycleId)
        {
            List<EmployeeKRA> result = new List<EmployeeKRA>();
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("usp_GetKRAsWithTrainingForFeedback", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    cmd.Parameters.Add(new SqlParameter("@SubmittedStatus", SqlDbType.Int) { Value = Convert.ToInt32(EnumCollection.KRA.Submitted) });
                    cmd.Parameters.Add(new SqlParameter("@ApprovedStatus", SqlDbType.Int) { Value = Convert.ToInt32(EnumCollection.KRA.Approved) });

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var kra = new EmployeeKRA();
                            kra.KRAId = reader.GetInt32(reader.GetOrdinal("KRAId"));
                            kra.EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId"));
                            kra.TrainingItemId = reader.IsDBNull(reader.GetOrdinal("TrainingItemId")) ? null : reader.GetString(reader.GetOrdinal("TrainingItemId"));
                            kra.TrainingRequirementName = reader.IsDBNull(reader.GetOrdinal("TrainingRequirementName")) ? null : reader.GetString(reader.GetOrdinal("TrainingRequirementName"));
                            kra.TrainingCategory = reader.IsDBNull(reader.GetOrdinal("TrainingCategory")) ? null : reader.GetString(reader.GetOrdinal("TrainingCategory"));
                            result.Add(kra);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetKRAsWithTrainingForFeedback");
            }
            finally
            {
                CloseConnection();
            }
            return result;
        }

        /// <summary>
        /// Get CreatedBy and ModifiedBy for pending KRAs (status 1/2/18) of an employee in an appraisal cycle.
        /// Must be called BEFORE the approval SP runs so that ModifiedBy reflects actual edits, not the approval stamp.
        /// </summary>
        public List<EmployeeKRA> GetApprovedKRAsCreatedByModifiedBy(int employeeId, int appraisalCycleId)
        {
            List<EmployeeKRA> list = new List<EmployeeKRA>();
            try
            {
                OpeneConnection();
                using (SqlCommand cmd = new SqlCommand("usp_GetApprovedKRAsCreatedByModifiedBy", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId });
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId });
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var k = new EmployeeKRA();
                            k.KRAId = reader.GetInt32(reader.GetOrdinal("KRAId"));
                            k.CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("CreatedBy"));
                            k.ModifiedBy = reader.IsDBNull(reader.GetOrdinal("ModifiedBy")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("ModifiedBy"));
                            list.Add(k);
                        }
                    }
                }
                return list;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetApprovedKRAsCreatedByModifiedBy");
                return new List<EmployeeKRA>();
            }
            finally
            {
                CloseConnection();
            }
        }

        //public void Update(DataRow dataRow)

        //{

        //    try

        //    {

        //        // Ensure connection is opened

        //        OpeneConnection();

        //        // Use the global connection object ConCampus

        //        SqlDataAdapter dataAdapter = new SqlDataAdapter("SELECT * FROM EmployeeKRA WHERE KRAId = @KRAId", ConCampus);

        //        dataAdapter.SelectCommand.Parameters.AddWithValue("@KRAId", dataRow["KRAId"]);


        //        // Ensure schema (keys) is loaded so CommandBuilder can generate correct SQL
        //        dataAdapter.MissingSchemaAction = MissingSchemaAction.AddWithKey;

        //        SqlCommandBuilder commandBuilder = new SqlCommandBuilder(dataAdapter);
        //        commandBuilder.ConflictOption = ConflictOption.OverwriteChanges;

        //        dataAdapter.UpdateCommand = commandBuilder.GetUpdateCommand();

        //        dataAdapter.Update(dataRow.Table);
        //    }

        //    catch (Exception ex)

        //    {

        //        throw new Exception("Error updating the DataSet", ex);

        //    }

        //    finally

        //    {

        //        // Ensure the connection is closed

        //        CloseConnection();

        //    }

        //}

        /// <summary>
        /// Get OldEmployeeCode from EmployeeMaster table using stored procedure
        /// </summary>
        public string GetEmployeeCode(int employeeId)
        {
            try
            {
                var query = "EXEC [dbo].[sp_GetOldEmployeeCodeByEmployeeId] @EmployeeId";
                var result = context.Database.SqlQuery<string>(query, new SqlParameter("@EmployeeId", employeeId)).FirstOrDefault();
                return result;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeCode");
                return null;
            }
        }

        /// <summary>
        /// Save training request tracking information using stored procedure
        /// </summary>
        public void SaveTrainingRequestTracking(int kraId, int employeeId, string employeeCode, int trainingId, string trainingType, 
            TrainingRequestAPIResponse apiResponse, int? createdBy)
        {
            try
            {
                // Handle batch requests (trainingType starts with "batch:" or "custom:")
                string apiRequestJson;
                if (trainingType.StartsWith("batch:"))
                {
                    // Format: "batch:types:ids" (e.g., "batch:course,lp:304,305")
                    string[] parts = trainingType.Substring(6).Split(':');
                    if (parts.Length == 2)
                    {
                        apiRequestJson = JsonConvert.SerializeObject(new
                        {
                            training_type = parts[0],
                            training_id = parts[1],
                            emp_id = employeeCode
                        });
                    }
                    else
                    {
                        // Fallback to default format
                        apiRequestJson = JsonConvert.SerializeObject(new
                        {
                            training_type = trainingType.ToLower(),
                            training_id = trainingId.ToString(),
                            emp_id = employeeCode
                        });
                    }
                }
                else if (trainingType.StartsWith("custom:"))
                {
                    // Format: "custom:course_names:course_categories" (e.g., "custom:Leadership Development,Data Privacy:Soft Skill,Compliance")
                    string[] parts = trainingType.Substring(7).Split(':');
                    if (parts.Length == 2)
                    {
                        apiRequestJson = JsonConvert.SerializeObject(new
                        {
                            emp_id = employeeCode,
                            course_name = parts[0],
                            course_category = parts[1]
                        });
                    }
                    else
                    {
                        // Fallback to default format
                        apiRequestJson = JsonConvert.SerializeObject(new
                        {
                            training_type = trainingType.ToLower(),
                            training_id = trainingId.ToString(),
                            emp_id = employeeCode
                        });
                    }
                }
                else
                {
                    // Regular single training request
                    apiRequestJson = JsonConvert.SerializeObject(new
                    {
                        training_type = trainingType.ToLower(),
                        training_id = trainingId.ToString(),
                        emp_id = employeeCode
                    });
                }

                string apiResponseJson = JsonConvert.SerializeObject(apiResponse);

                string trainingName = apiResponse.data?.training_name ?? string.Empty;
                string status = apiResponse.data?.status ?? string.Empty;
                string message = apiResponse.message ?? string.Empty;
                string fiscalYear = apiResponse.data?.fiscal_year ?? string.Empty;
                string completionTimeline = apiResponse.data?.completion_timeline ?? string.Empty;

                // Use stored procedure to insert tracking information
                var query = "EXEC [dbo].[sp_InsertTrainingRequestTracking] @KRAId, @EmployeeId, @EmployeeCode, @TrainingId, @TrainingType, @TrainingName, @APIRequest, @APIResponse, @IsSuccess, @IsDuplicate, @Status, @Message, @FiscalYear, @CompletionTimeline, @CreatedBy";

                var parameters = new List<SqlParameter>
                {
                    new SqlParameter("@KRAId", kraId),
                    new SqlParameter("@EmployeeId", employeeId),
                    new SqlParameter("@EmployeeCode", employeeCode ?? (object)DBNull.Value),
                    new SqlParameter("@TrainingId", trainingId),
                    new SqlParameter("@TrainingType", trainingType),
                    new SqlParameter("@TrainingName", trainingName ?? (object)DBNull.Value),
                    new SqlParameter("@APIRequest", apiRequestJson),
                    new SqlParameter("@APIResponse", apiResponseJson),
                    new SqlParameter("@IsSuccess", apiResponse.success),
                    new SqlParameter("@IsDuplicate", apiResponse.isDuplicate),
                    new SqlParameter("@Status", status ?? (object)DBNull.Value),
                    new SqlParameter("@Message", message ?? (object)DBNull.Value),
                    new SqlParameter("@FiscalYear", fiscalYear ?? (object)DBNull.Value),
                    new SqlParameter("@CompletionTimeline", completionTimeline ?? (object)DBNull.Value),
                    new SqlParameter("@CreatedBy", createdBy ?? (object)DBNull.Value)
                };

                context.Database.ExecuteSqlCommand(query, parameters.ToArray());
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SaveTrainingRequestTracking");
                throw;
            }
        }

        /// <summary>
        /// Check if Self Assessment exists for the given cycle using stored procedure (ADO.NET)
        /// </summary>
        public bool HasSelfAssessment(int employeeId, int appraisalCycleId, string cycle)
        {
            bool hasAssessment = false;
            try
            {
                OpeneConnection();
                
                using (SqlCommand cmd = new SqlCommand("sp_PEP_SelfAssessment_HasAssessment", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@YearBreakCheck", SqlDbType.NVarChar, 20)).Value = cycle;
                    
                    SqlParameter hasAssessmentParam = new SqlParameter("@HasAssessment", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(hasAssessmentParam);
                    
                    cmd.ExecuteNonQuery();
                    
                    hasAssessment = hasAssessmentParam.Value != DBNull.Value && Convert.ToBoolean(hasAssessmentParam.Value);
                }
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "HasSelfAssessment");
                throw;
            }
            finally
            {
                CloseConnection();
            }
            
            return hasAssessment;
        }

        #endregion

        /// <summary>
        /// Get Reference Goal Master Accessibility
        /// </summary>
        public DataSet GetReferenceGoalMasterAccessable(string EmployeeId)
        {
            DataSet ds = new DataSet();
            try
            {
                // Open the connection (use your method to open the DB connection)
                OpeneConnection();

                // Define the SQL command to call the stored procedure
                string storedProcedureName = "sp_GetReferenceGoalMasterAccessable";
                cmdObj = new SqlCommand(storedProcedureName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                // Adding parameters to the stored procedure - FIX: Use single @ not @@
                cmdObj.Parameters.Add(new SqlParameter("@EmpId", SqlDbType.VarChar)).Value = EmployeeId;
             
                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);  // Fill the DataSet with the result of the stored procedure

               
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "Data"; 
                }

                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetReferenceGoalMasterAccessable");
            }

            return ds;
        }

        /// <summary>
        /// Get Reference Goal Master by GradeId and EmpUnitId
        /// </summary>
        public DataSet GetReferenceGoalMaster(int GradeId, int? EmpUnitId)
        {
            DataSet ds = new DataSet();
            try
            {
                // Open the connection
                OpeneConnection();

                // Define the SQL command to call the stored procedure
                string storedProcedureName = "sp_GetReferenceGoalMaster";
                cmdObj = new SqlCommand(storedProcedureName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                // Adding parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@GradeId", SqlDbType.Int)).Value = GradeId;
                if (EmpUnitId.HasValue)
                {
                    cmdObj.Parameters.Add(new SqlParameter("@EmpUnitId", SqlDbType.Int)).Value = EmpUnitId.Value;
                }
             
                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);

                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "Data"; 
                }

                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                // Handle exceptions, log them as needed
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetReferenceGoalMaster");
            }

            return ds;
        }

        /// <summary>
        /// Check if custom reference goal already exists for employee and appraisal cycle
        /// </summary>
        public bool CheckCustomReferenceGoalExists(int employeeId, int appraisalCycleId)
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("sp_PEP_CustomReferenceGoal_GetByEmployee", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                    dataAdapter.Fill(ds);
                }

                CloseConnection();
                
                // Return true if any records exist
                if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "CheckCustomReferenceGoalExists");
                throw ex;
            }
        }

        /// <summary>
        /// Insert a new custom reference goal
        /// </summary>
        public int InsertCustomReferenceGoal(int employeeId, int appraisalCycleId, 
            string roleDescription, string skillsUsed, string projectDetails, int createdBy)
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("sp_PEP_CustomReferenceGoal_Insert", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                    cmd.Parameters.Add(new SqlParameter("@RoleDescription", SqlDbType.NVarChar)).Value = string.IsNullOrEmpty(roleDescription) ? (object)DBNull.Value : roleDescription;
                    cmd.Parameters.Add(new SqlParameter("@SkillsUsed", SqlDbType.NVarChar)).Value = string.IsNullOrEmpty(skillsUsed) ? (object)DBNull.Value : skillsUsed;
                    cmd.Parameters.Add(new SqlParameter("@ProjectDetails", SqlDbType.NVarChar)).Value = string.IsNullOrEmpty(projectDetails) ? (object)DBNull.Value : projectDetails;
                    cmd.Parameters.Add(new SqlParameter("@CreatedBy", SqlDbType.Int)).Value = createdBy;

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                    dataAdapter.Fill(ds);
                    
                    if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Convert.ToInt32(ds.Tables[0].Rows[0]["CustomGoalId"]);
                    }
                }

                CloseConnection();
                return 0;
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "InsertCustomReferenceGoal");
                throw ex;
            }
        }

        /// <summary>
        /// Get custom reference goals by employee and appraisal cycle
        /// </summary>
        public DataTable GetCustomReferenceGoalsByEmployee(int employeeId, int appraisalCycleId)
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("sp_PEP_CustomReferenceGoal_GetByEmployee", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("@EmployeeId", SqlDbType.Int)).Value = employeeId;
                    cmd.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                    dataAdapter.Fill(ds);
                }

                CloseConnection();
                
                if (ds.Tables.Count > 0)
                {
                    return ds.Tables[0];
                }
                return new DataTable();
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCustomReferenceGoalsByEmployee");
                throw ex;
            }
        }

        /// <summary>
        /// Get all active sub-skills
        /// </summary>
        public DataTable GetAllSubSkills()
        {
            DataSet ds = new DataSet();
            try
            {
                OpeneConnection();

                using (SqlCommand cmd = new SqlCommand("sp_PEP_SubSkill_GetAll", ConCampus))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                    dataAdapter.Fill(ds);
                }

                CloseConnection();
                
                if (ds.Tables.Count > 0)
                {
                    return ds.Tables[0];
                }
                return new DataTable();
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAllSubSkills");
                throw ex;
            }
        }
    }
}
    

