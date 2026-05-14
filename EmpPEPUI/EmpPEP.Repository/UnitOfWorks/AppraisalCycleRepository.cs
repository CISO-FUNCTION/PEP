using EmpPEP.Framework.Helper;
using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    
    public class AppraisalCycleRepository : BaseDispose
    {
        SqlCommand cmdObj;
        string sectionName = "AppraisalCycleRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public AppraisalCycleRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #endregion

        #region "Public Methods"
        public List<AppraisalCycleMaster> Get()
        {
            IQueryable<AppraisalCycleMaster> query = context.Set<AppraisalCycleMaster>();
            return query.Where(x => x.EndDate.Year <= DateTime.Now.Year).OrderByDescending(x => x.EndDate).Take(2).ToList();
        }

        /// <summary>
        /// Get all active appraisal cycles (IsActive = 1)
        /// </summary>
        public List<AppraisalCycleMaster> GetActive()
        {
            return context.AppraisalCycleMasters
                .Where(x => x.IsActive == 1)
                .OrderByDescending(x => x.AppraisalCycleId)
                .ToList();
        }
        public List<AppraisalCycleYearbreakupDetail> GetDetail(DateTime date, string Type)
        {
            var flag = "";
            var currentAppraisal = DateTime.Parse(DateTime.Now.Year + "-04-01");
            if (DateTime.Now >= DateTime.Parse(DateTime.Now.Year + "-04-01") && DateTime.Now <= DateTime.Parse(DateTime.Now.Year + "-09-30"))
            {
                flag = "11" + DateTime.Now.Year;
            }
            else
            {
                flag = "12" + DateTime.Now.Year;
            }
            flag = "122021";

            if (Type == "2")
            {

                IQueryable<AppraisalCycleYearbreakupDetail> query = context.Set<AppraisalCycleYearbreakupDetail>();
                if (flag == "11" + DateTime.Now.Year && DateTime.Now.Month >= 4 && DateTime.Now.Month <= 9)
                {
                    return context.AppraisalCycleYearbreakupDetails.Where(x => x.YearBreakCheck.ToString() == flag).OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();
                }
                else if (DateTime.Now.Month >= 9 && DateTime.Now.Month <= 12)
                {
                    var flag1 = Convert.ToInt32(DateTime.Now.Year);
                    //return context.AppraisalCycleYearbreakupDetails.Where(x => x.AppraisalCycleDesc.ToString() == "Appraisal Cycle 2019 - 20").OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();
                    return context.AppraisalCycleYearbreakupDetails.Where(x => x.YearBreakCheck.ToString() == "12" + flag1.ToString() || x.YearBreakCheck.ToString() == "11" + flag1.ToString()).OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();

                }
                else
                {
                    var flag2 = Convert.ToInt32(DateTime.Now.Year) - 1;
                    //var flag2 = 2020;
                    return context.AppraisalCycleYearbreakupDetails.Where(x => x.YearBreakCheck.ToString() == "12" + flag2.ToString() || x.YearBreakCheck.ToString() == "11" + flag2.ToString()).OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();

                }
            }
            else
            {
                if (DateTime.Now.Month <= 9 && DateTime.Now.Month >= 4)
                {
                    // return context.AppraisalCycleYearbreakupDetails.OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();
                    return context.AppraisalCycleYearbreakupDetails.Where(x => x.EndDate > date).ToList<AppraisalCycleYearbreakupDetail>();
                }
                else
                {
                    return context.AppraisalCycleYearbreakupDetails.Where(x => x.EndDate > date).OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();

                }
            }
        }
        //public List<AppraisalCycleYearbreakupDetail> GetAllDetail(DateTime date, string Type, string DropDownCheck)
        //{

        //    return context.AppraisalCycleYearbreakupDetails.Where(x => x.StartDate < date).OrderByDescending(x => x.EndDate).ToList<AppraisalCycleYearbreakupDetail>();

        //}

        public DataSet GetAllDetail(DateTime date, string Type, string DropDownCheck)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetAllAppraisalCycleDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@Date", SqlDbType.Date))
                 .Value = date;
                cmdObj.Parameters
                 .Add(new SqlParameter("@Type", SqlDbType.NVarChar))
                 .Value = Type;
                cmdObj.Parameters
                 .Add(new SqlParameter("@DropDownCheck", SqlDbType.NVarChar))
                 .Value = DropDownCheck;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAllAppraisalCycleDetails");
            }

            return ds;
        }

        public AppraisalCycleMaster Get(int id)
        {
            return context.AppraisalCycleMasters.FirstOrDefault(x => x.AppraisalCycleId == id);
        }

        public List<AppraisalCycleMaster> GetByCompanyId(int CompanyId)
        {
            int statusId = Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started); //editted as per requirement 29May2017
            return context.AppraisalCycleMasters.Where(x => x.StatusId == statusId && x.IsActive == 1).ToList<AppraisalCycleMaster>(); //x.CompanyId == CompanyId &&
        }
        //public List<AppraisalCycleMaster> GetActiveCycle()
        //{
        //    int statusId = Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started); //added as per change on 19 April 2022
        //    return context.AppraisalCycleMasters.Where(x => x.StatusId == statusId && x.IsActive == 1).OrderByDescending(x => x.AppraisalCycleId).ToList<AppraisalCycleMaster>(); //x.CompanyId == CompanyId &&
        //}

        public DataSet GetActiveCycle()
        {
            int statusId = Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started);
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetActiveCycle";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@statusId", SqlDbType.Int))
                 .Value = statusId;

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


        //public List<AppraisalCycleYearbreakupDetail> GetSelectSelfAssesmentCycle(int AppCycleId)
        //{
        //    return context.AppraisalCycleYearbreakupDetails.Where(x => x.AppraisalCycleId == AppCycleId).OrderByDescending(x => x.YearBreakCheck).ToList<AppraisalCycleYearbreakupDetail>();
        //}
        public DataSet GetSelectSelfAssesmentCycle(int AppCycleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetSelectSelfAssesmentCycle";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppCycleId;

               
                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSelectSelfAssesmentCycle");
            }

            return ds;
        }





        public AppraisalCycleMaster GetCurrent(int CompanyId)
        {
            int statusId = Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started);
            return context.AppraisalCycleMasters.Where(x => x.StatusId == statusId && x.IsActive == 1).OrderByDescending(x => x.AppraisalCycleId).FirstOrDefault(); // editted as per requirement 29May2017 x.CompanyId == CompanyId &&
        }
        public AppraisalCycleMaster GetCurrentCycle()
        {
            int statusId = Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started);
            return context.AppraisalCycleMasters.Where(x => x.StatusId == statusId && x.IsActive == 1).FirstOrDefault(); // editted as per requirement 29May2017 x.CompanyId == CompanyId &&
        }
        public int Insert(AppraisalCycleMaster obj)
        {
            context.Set<AppraisalCycleMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(AppraisalCycleMaster obj)
        {
            context.Set<AppraisalCycleMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(AppraisalCycleMaster obj)
        {
            AppraisalCycleMaster mdAppraisalCycle = context.Set<AppraisalCycleMaster>().Find(obj.AppraisalCycleId);

            if (context.Entry(mdAppraisalCycle).State == EntityState.Detached)
                context.Set<AppraisalCycleMaster>().Attach(mdAppraisalCycle);

            context.Set<AppraisalCycleMaster>().Remove(mdAppraisalCycle);
            return context.SaveChanges() > 0 ? true : false;
        }

        public List<GetAllAppraisalCycles_Result> Get(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetAllAppraisalCycles_Result>(query, parameters).ToList();
        }

        /// <summary>
        /// Get current cycle and previous 2 cycles with ShortFYName for dynamic table headers
        /// Uses stored procedure with DataSet
        /// </summary>
        public DataSet GetCyclesForTableHeaders(int currentAppraisalCycleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetCyclesForTableHeaders";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@CurrentCycleId", SqlDbType.Int))
                 .Value = currentAppraisalCycleId;

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "CyclesForTableHeaders";
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCyclesForTableHeaders");
            }

            return ds;
        }

        /// <summary>
        /// Rating / Rating Admin default cycle from stored procedure dbo.GetRatingAppraisalCycleId.
        /// </summary>
        public int? GetRatingAppraisalCycleId(int loginEmployeeId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                const string procName = "GetRatingAppraisalCycleId";
                cmdObj = new SqlCommand(procName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                var p = cmdObj.Parameters.Add("@LoginEmployeeId", SqlDbType.Int);
                p.Value = loginEmployeeId > 0 ? (object)loginEmployeeId : DBNull.Value;

                ds = du.GetDataSetWithProc(cmdObj);
                CloseConnection();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var val = ds.Tables[0].Rows[0]["RatingAppraisalCycleId"];
                    if (val != null && val != DBNull.Value)
                        return Convert.ToInt32(val);
                }
            }
            catch (Exception ex)
            {
                CloseConnection();
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetRatingAppraisalCycleId");
            }

            return null;
        }
        #endregion  

        #region  IDiosposable

        #region private variable
        //private bool disposed = false;
        #endregion

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
        #endregion  

        /// <summary>
        /// Check if cycle is closed
        /// </summary>
        public bool IsCycleClosed(int appraisalCycleId, string cycle)
        {
            try
            {
                // Convert cycle string to int for comparison (YearBreakCheck is stored as int in entity but used as string)
                int? cycleInt = null;
                if (!string.IsNullOrEmpty(cycle) && int.TryParse(cycle, out int parsedCycle))
                {
                    cycleInt = parsedCycle;
                }
                
                // Use stored procedure to avoid LINQ to Entities translation issues with IsClosed property
                OpeneConnection();
                string _sql = "sp_IsCycleClosed";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters
                    .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                    .Value = appraisalCycleId;
                
                if (cycleInt.HasValue)
                {
                    cmdObj.Parameters
                        .Add(new SqlParameter("@YearBreakCheck", SqlDbType.Int))
                        .Value = cycleInt.Value;
                }
                else
                {
                    cmdObj.Parameters
                        .Add(new SqlParameter("@YearBreakCheck", SqlDbType.Int))
                        .Value = DBNull.Value;
                }
                
                var result = du.GetDataSetWithProc(cmdObj);
                CloseConnection();
                
                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    var isClosedValue = result.Tables[0].Rows[0]["IsClosed"];
                    if (isClosedValue != DBNull.Value)
                    {
                        return Convert.ToBoolean(isClosedValue);
                    }
                }
                
                return false;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "IsCycleClosed");
                CloseConnection();
                return false; // Return false on error to be safe
            }
        }

        /// <summary>
        /// Get Self Assessment Cycle Details for Admin Management
        /// </summary>
        public List<AppraisalCycleYearbreakupDetail> GetSelfAssessmentCycleDetails(int appraisalCycleId)
        {
            try
            {
                OpeneConnection();
                string _sql = "sp_GetSelfAssessmentCycleDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters
                    .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                    .Value = appraisalCycleId;
                
                var ds = du.GetDataSetWithProc(cmdObj);
                CloseConnection();
                
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var cycles = new List<AppraisalCycleYearbreakupDetail>();
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        var cycle = new AppraisalCycleYearbreakupDetail
                        {
                            Id = Convert.ToInt32(row["Id"]),
                            AppraisalCycleId = row["AppraisalCycleId"] != DBNull.Value ? Convert.ToInt32(row["AppraisalCycleId"]) : (int?)null,
                            AppraisalCycleName = row["AppraisalCycleName"] != DBNull.Value ? row["AppraisalCycleName"].ToString() : null,
                            AppraisalCycleDesc = row["AppraisalCycleDesc"] != DBNull.Value ? row["AppraisalCycleDesc"].ToString() : null,
                            StartDate = row["StartDate"] != DBNull.Value ? Convert.ToDateTime(row["StartDate"]) : (DateTime?)null,
                            EndDate = row["EndDate"] != DBNull.Value ? Convert.ToDateTime(row["EndDate"]) : (DateTime?)null,
                            YearBreakCheck = row["YearBreakCheck"] != DBNull.Value ? Convert.ToInt32(row["YearBreakCheck"]) : (int?)null,
                            IsClosed = row["IsClosed"] != DBNull.Value ? Convert.ToBoolean(row["IsClosed"]) : (bool?)null,
                            ClosedDate = row["ClosedDate"] != DBNull.Value ? Convert.ToDateTime(row["ClosedDate"]) : (DateTime?)null,
                            ClosedBy = row["ClosedBy"] != DBNull.Value ? Convert.ToInt32(row["ClosedBy"]) : (int?)null
                        };
                        cycles.Add(cycle);
                    }
                    return cycles;
                }
                return new List<AppraisalCycleYearbreakupDetail>();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSelfAssessmentCycleDetails");
                CloseConnection();
                return new List<AppraisalCycleYearbreakupDetail>();
            }
        }

        /// <summary>
        /// Close Self Assessment Cycle
        /// </summary>
        public bool CloseSelfAssessmentCycle(int id, int closedBy)
        {
            try
            {
                OpeneConnection();
                string _sql = "sp_CloseSelfAssessmentCycle";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters
                    .Add(new SqlParameter("@Id", SqlDbType.Int))
                    .Value = id;
                
                cmdObj.Parameters
                    .Add(new SqlParameter("@ClosedBy", SqlDbType.Int))
                    .Value = closedBy;
                
                var result = du.GetDataSetWithProc(cmdObj);
                CloseConnection();
                
                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    var success = result.Tables[0].Rows[0]["Success"];
                    if (success != DBNull.Value)
                    {
                        return Convert.ToBoolean(success);
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "CloseSelfAssessmentCycle");
                CloseConnection();
                return false;
            }
        }

        /// <summary>
        /// Reopen Self Assessment Cycle
        /// </summary>
        public bool ReopenSelfAssessmentCycle(int id)
        {
            try
            {
                OpeneConnection();
                string _sql = "sp_ReopenSelfAssessmentCycle";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters
                    .Add(new SqlParameter("@Id", SqlDbType.Int))
                    .Value = id;
                
                var result = du.GetDataSetWithProc(cmdObj);
                CloseConnection();
                
                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    var success = result.Tables[0].Rows[0]["Success"];
                    if (success != DBNull.Value)
                    {
                        return Convert.ToBoolean(success);
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ReopenSelfAssessmentCycle");
                CloseConnection();
                return false;
            }
        }

    }
}
