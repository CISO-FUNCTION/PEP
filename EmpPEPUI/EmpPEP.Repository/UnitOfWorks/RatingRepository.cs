using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.EntityClient;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static EmpPEP.Framework.Helper.EnumCollection;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class RatingRepository : BaseDispose
    {



        SqlCommand cmdObj;
        string sectionName = "RatingRepository";
        DataUtility du;


        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        public RatingRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }


        public List<PEPEmployeeRating> GetRating()
        {
            var getAnnualsRating = (from t1 in context.PEPRatingMasters

                                    select new
                                    {
                                        ID = t1.ID,
                                        RatingName = t1.RatingName,
                                        SortLevel = t1.SortLevel
                                    }).Distinct().OrderBy(a => a.SortLevel).ToList()

                 .Select(x => new PEPEmployeeRating()
                 {
                     Id = x.ID,
                     Rating = x.RatingName
                 }).ToList();
            return getAnnualsRating != null ? getAnnualsRating : new List<PEPEmployeeRating>();

        }

        public int Insert(EmployeeRatingNormailizationDetail obj)
        {
            context.Set<EmployeeRatingNormailizationDetail>().Add(obj);
            context.SaveChanges();
            return obj.Id;
        }

        public int Insert(EmployeeRatingNormailizationTrackDetail obj)
        {
            context.Set<EmployeeRatingNormailizationTrackDetail>().Add(obj);
            context.SaveChanges();
            return obj.Id;
        }

        public int ReferBack(EmployeeRatingNormailizationDetail obj)
        {
            context.Set<EmployeeRatingNormailizationDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }
        public EmployeeRatingNormailizationDetail Get(int Id)
        {
            EmployeeRatingNormailizationDetail query = context.Set<EmployeeRatingNormailizationDetail>().SingleOrDefault(x => x.Id == Id);
            return query != null ? query : new EmployeeRatingNormailizationDetail();
        }
        public EmployeeRatingNormailizationDetail GetGivenRating(int? EmployeeId, int? AppraisalCycleId)
        {
            EmployeeRatingNormailizationDetail query = context.Set<EmployeeRatingNormailizationDetail>().SingleOrDefault(x => x.PEPEmployeeId == EmployeeId && x.AppraisalCycleId == AppraisalCycleId);
            return query != null ? query : new EmployeeRatingNormailizationDetail();
        }

        public EmployeeRatingNormailizationDetail GetReferBack(int? AppraisalCycleId, int? EmployeeId)
        {
            EmployeeRatingNormailizationDetail query = context.Set<EmployeeRatingNormailizationDetail>().SingleOrDefault(x => x.AppraisalCycleId == AppraisalCycleId && x.PEPEmployeeId == EmployeeId);
            return query;
        }
        public List<EmployeeRatingNormailizationDetail> GetReferBackForAdmin(int? AppraisalCycleId, string GDLId)
        {
            var GDL = Convert.ToInt32(GDLId);

            var EmpList = (from b in context.EmployeeRatingNormailizationDetails
                           join em in context.EmployeeMasters on b.PEPEmployeeId equals em.EmployeeId
                           join aa in context.EmpRMRatingListForAdmins on em.OldEmployeeCode equals aa.EMPID
                           join em1 in context.EmployeeMasters on aa.GDLId equals em1.OldEmployeeCode
                           where em1.EmployeeId == GDL && b.AppraisalCycleId == AppraisalCycleId
                           select b).ToList();

            return EmpList != null ? EmpList : new List<EmployeeRatingNormailizationDetail>();
        }

        public EmployeeRatingNormailizationTrackDetail GetNormalizationTrackDetail(int? AppraisalCycleId, int? userEmployeeId, int? RatingHistoryGivenBy)
        {
            EmployeeRatingNormailizationTrackDetail query = context.Set<EmployeeRatingNormailizationTrackDetail>().SingleOrDefault(x => x.AppraisalCycleId == AppraisalCycleId && x.UserEmployeeId == userEmployeeId && x.RatingHistoryGivenBy == RatingHistoryGivenBy && x.IsActive == 1);
            return query;
        }

        public EmployeeRatingNormailizationTrackDetail GetReferbackNormalizationTrackDetail(int? AppraisalCycleId, int? RatingHistoryGivenBy, int? PEPEmployeeId)
        {
            EmployeeRatingNormailizationTrackDetail query = context.Set<EmployeeRatingNormailizationTrackDetail>().SingleOrDefault(x => x.AppraisalCycleId == AppraisalCycleId && x.UserEmployeeId == PEPEmployeeId && x.RatingHistoryGivenBy == RatingHistoryGivenBy);
            return query;
        }
        public int Update(EmployeeRatingNormailizationDetail obj)
        {


            context.Set<EmployeeRatingNormailizationDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }

        public int UpdateReferback(EmployeeRatingNormailizationTrackDetail obj)
        {


            context.Set<EmployeeRatingNormailizationTrackDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }

        public int UpdateTrack(EmployeeRatingNormailizationTrackDetail obj)
        {


            context.Set<EmployeeRatingNormailizationTrackDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }

        public int DeleteTrack(EmployeeRatingNormailizationTrackDetail obj)
        {


            context.Set<EmployeeRatingNormailizationTrackDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Deleted;
            return context.SaveChanges() > 0 ? 1 : 0;
        }
        public List<PEP_MaleFemaleNormalizationData_ResultEntity> GetPEP_MaleFemaleNormalizationData(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEP_MaleFemaleNormalizationData_ResultEntity>(query, parameters).ToList();
        }

        public List<PEP_GradeRatingTypeWiseNormData_ResultEntity> GetRatingOverallData(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEP_GradeRatingTypeWiseNormData_ResultEntity>(query, parameters).ToList();
        }

        public List<PEP_MaleFemaleNormalizationData_ResultEntity> GetPEP_HRBPMaleFemaleNormalizationData(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEP_MaleFemaleNormalizationData_ResultEntity>(query, parameters).ToList();
        }

        public List<PEP_GradeRatingTypeWiseNormData_ResultEntity> GetRatingHRBPAdminOverallData(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEP_GradeRatingTypeWiseNormData_ResultEntity>(query, parameters).ToList();
        }
        public List<GetRatingPromotionDetails_ResultEntity> GetRatingPromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingPromotionDetails_ResultEntity>(query, parameters).ToList();
        }
        public List<GetRatingMaleFemalePromotionDetails_ResultEntity> GetRatingMaleFemalePromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingMaleFemalePromotionDetails_ResultEntity>(query, parameters).ToList();
        }

        public List<GetDataforPromotionGraph_ResultEntity> GetDataforPromotionGraph(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDataforPromotionGraph_ResultEntity>(query, parameters).ToList();
        }


        public List<GetDataForDropdown_ResultEntity> GetDataForDropdown(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDataForDropdown_ResultEntity>(query, parameters).ToList();
        }
        public List<GetRatingPromotionDetails_ResultEntity> GetHRBPAdminRatingPromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingPromotionDetails_ResultEntity>(query, parameters).ToList();
        }
        public List<GetRatingMaleFemalePromotionDetails_ResultEntity> GetHRBPAdminRatingMaleFemalePromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingMaleFemalePromotionDetails_ResultEntity>(query, parameters).ToList();
        }

        public List<GetDataforPromotionGraph_ResultEntity> GetHRBPAdminDataforPromotionGraph(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDataforPromotionGraph_ResultEntity>(query, parameters).ToList();
        }

        public DataSet GetAspireeReporteeList(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetAspireDirectReportees";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
               .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                .Value = AppraisalCycleId;

                cmdObj.Parameters
               .Add(new SqlParameter("@LoginEmployeeId", SqlDbType.Int))
                .Value = LoginEmployeeId;


                cmdObj.Parameters
                 .Add(new SqlParameter("@RoleId", SqlDbType.Int))
               .Value = RoleId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAspireeReporteeList");
            }

            return ds;
        }

        public DataSet GetDataForChartStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetDataForChartStudioView_local";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
               .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                .Value = AppraisalCycleId;

                cmdObj.Parameters
                .Add(new SqlParameter("@EMPID", SqlDbType.Int))
                 .Value = EMPID;

                cmdObj.Parameters
               .Add(new SqlParameter("@Practice", SqlDbType.VarChar))
                .Value = Practice;


                cmdObj.Parameters
               .Add(new SqlParameter("@GradeId", SqlDbType.VarChar))
                .Value = GradeId;


                cmdObj.Parameters
               .Add(new SqlParameter("@LocationId", SqlDbType.VarChar))
                .Value = LocationId;


                cmdObj.Parameters
               .Add(new SqlParameter("@GroupAccountId", SqlDbType.VarChar))
                .Value = GroupAccountId;


                cmdObj.Parameters
               .Add(new SqlParameter("@Gender", SqlDbType.VarChar))
                .Value = Gender;


                cmdObj.Parameters
               .Add(new SqlParameter("@EmpStatus", SqlDbType.VarChar))
                .Value = EmpStatus;

                cmdObj.Parameters
           .Add(new SqlParameter("@Promotion", SqlDbType.VarChar))
            .Value = Promotion;

                cmdObj.Parameters
                 .Add(new SqlParameter("@RoleId", SqlDbType.Int))
               .Value = RoleId;

                cmdObj.Parameters
                    .Add(new SqlParameter("@CriticalityPriorityIds", SqlDbType.VarChar, -1))
                    .Value = string.IsNullOrWhiteSpace(criticalityPriorityIds) ? (object)DBNull.Value : criticalityPriorityIds.Trim();

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataForChartStudioView");
            }

            return ds;
        }


        public DataSet GetRatingOverallDataStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PEP_GradeRatingTypeWiseNormDataStudioView_local";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
               .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                .Value = AppraisalCycleId;

                cmdObj.Parameters
                .Add(new SqlParameter("@EMPID", SqlDbType.Int))
                 .Value = EMPID;

                cmdObj.Parameters
               .Add(new SqlParameter("@Practice", SqlDbType.VarChar))
                .Value = Practice;


                cmdObj.Parameters
               .Add(new SqlParameter("@GradeId", SqlDbType.VarChar))
                .Value = GradeId;


                cmdObj.Parameters
               .Add(new SqlParameter("@LocationId", SqlDbType.VarChar))
                .Value = LocationId;


                cmdObj.Parameters
               .Add(new SqlParameter("@GroupAccountId", SqlDbType.VarChar))
                .Value = GroupAccountId;


                cmdObj.Parameters
               .Add(new SqlParameter("@Gender", SqlDbType.VarChar))
                .Value = Gender;


                cmdObj.Parameters
               .Add(new SqlParameter("@EmpStatus", SqlDbType.VarChar))
                .Value = EmpStatus;


                cmdObj.Parameters
               .Add(new SqlParameter("@Promotion", SqlDbType.VarChar))
                .Value = Promotion;

                cmdObj.Parameters
                 .Add(new SqlParameter("@RoleId", SqlDbType.Int))
               .Value = RoleId;

                cmdObj.Parameters
                    .Add(new SqlParameter("@CriticalityPriorityIds", SqlDbType.VarChar, -1))
                    .Value = string.IsNullOrWhiteSpace(criticalityPriorityIds) ? (object)DBNull.Value : criticalityPriorityIds.Trim();

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PEP_GradeRatingTypeWiseNormDataStudioView");
            }

            return ds;
        }


        public DataSet GetMaleFemaleNormalizationStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PEP_MaleFemaleNormalizationData_StudioView_local";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
               .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                .Value = AppraisalCycleId;

                cmdObj.Parameters
                .Add(new SqlParameter("@EMPID", SqlDbType.Int))
                 .Value = EMPID;

                cmdObj.Parameters
               .Add(new SqlParameter("@Practice", SqlDbType.VarChar))
                .Value = Practice;


                cmdObj.Parameters
               .Add(new SqlParameter("@GradeId", SqlDbType.VarChar))
                .Value = GradeId;


                cmdObj.Parameters
               .Add(new SqlParameter("@LocationId", SqlDbType.VarChar))
                .Value = LocationId;


                cmdObj.Parameters
               .Add(new SqlParameter("@GroupAccountId", SqlDbType.VarChar))
                .Value = GroupAccountId;


                cmdObj.Parameters
               .Add(new SqlParameter("@Gender", SqlDbType.VarChar))
                .Value = Gender;


                cmdObj.Parameters
               .Add(new SqlParameter("@EmpStatus", SqlDbType.VarChar))
                .Value = EmpStatus;

                cmdObj.Parameters
               .Add(new SqlParameter("@Promotion", SqlDbType.VarChar))
                .Value = Promotion;

                cmdObj.Parameters
                 .Add(new SqlParameter("@RoleId", SqlDbType.Int))
               .Value = RoleId;

                cmdObj.Parameters
                    .Add(new SqlParameter("@CriticalityPriorityIds", SqlDbType.VarChar, -1))
                    .Value = string.IsNullOrWhiteSpace(criticalityPriorityIds) ? (object)DBNull.Value : criticalityPriorityIds.Trim();

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetMaleFemaleNormalizationStudioView");
            }

            return ds;
        }






        //public List<GetAspireDirectReportees_Result> GetAspireeReporteeList(string query, params object[] parameters)
        //{
        //    return context.Database.SqlQuery<GetAspireDirectReportees_Result>(query, parameters).ToList();
        //}
        public List<GetGradeList_Result> GetGradeList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetGradeList_Result>(query, parameters).ToList();
        }

        public List<PEP_RoleAccessDetail_Result> GetRoleList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEP_RoleAccessDetail_Result>(query, parameters).ToList();
        }


        public List<GetAccountGroupList_Result> GetAccountList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetAccountGroupList_Result>(query, parameters).ToList();
        }
        public List<GetGDLHeadandRMList_Result> GetGDLRMList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetGDLHeadandRMList_Result>(query, parameters).ToList();
        }
        public List<PEPDataForGraph_ResultEntity> GetDataForChart(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEPDataForGraph_ResultEntity>(query, parameters).ToList();

        }
        public List<PEPDataForGraph_ResultEntity> GetHRBPadminDataForChart(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<PEPDataForGraph_ResultEntity>(query, parameters).ToList();

        }


        public List<GetDataForChartForImmdediateReportee_ResultEntity> GetDataChartForImmediateReportee(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDataForChartForImmdediateReportee_ResultEntity>(query, parameters).ToList();

        }


        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@LoginEmployeeId", LoginEmployeeId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@Reportees", Convert.ToString(ReporteeIds as object));
        //    sqlParam.SqlDbType = SqlDbType.VarChar;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@AllSelected", AllSelected);
        //    sqlParam.SqlDbType = SqlDbType.Bit;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@RoleId", RoleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection
        public DataSet GetDashBoardEmployeeRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string ReporteeIds, bool AllSelected, int RoleId, string CriticalityPriorityIds = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeRatingDetailsYearWise";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@LoginEmployeeId", SqlDbType.Int))
                .Value = LoginEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@Reportees", SqlDbType.VarChar))
             .Value = ReporteeIds;

                cmdObj.Parameters
             .Add(new SqlParameter("@AllSelected", SqlDbType.Int))
             .Value = AllSelected;

                cmdObj.Parameters
             .Add(new SqlParameter("@RoleId", SqlDbType.Int))
             .Value = RoleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@CriticalityPriorityIds", SqlDbType.VarChar, -1))
             .Value = string.IsNullOrWhiteSpace(CriticalityPriorityIds) ? DBNull.Value : (object)CriticalityPriorityIds.Trim();

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "data";
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeRatingDetailsYearWise");
            }

            return ds;
        }



        public DataSet PracticeGridView(int AppraisalCycleId, string Practice, int LogEmpID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeRatingDetailsStudioYearWise";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@Practice", SqlDbType.VarChar))
             .Value = Practice;


                cmdObj.Parameters
             .Add(new SqlParameter("@LogEmpID", SqlDbType.Int))
             .Value = LogEmpID;


                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeRatingDetailsYearWise");
            }

            return ds;
        }

        public DataSet GetRMHistoryDetails(int SelectedEmpId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PEP_GetEmployeeRMHistory";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@empid", SqlDbType.Int))
                .Value = SelectedEmpId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PEP_GetEmployeeRMHistory");
            }

            return ds;
        }

        public DataSet GetPracticeList(int LogInEmpId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PEP_GetpracticeList";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@empid", SqlDbType.Int))
                .Value = LogInEmpId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetPracticeList");
            }

            return ds;
        }



        public DataSet IsloginEmpSubmittedRatings(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "IsloginEmpSubmittedRatings";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
                          .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                .Value = AppraisalCycleId;
                cmdObj.Parameters
              .Add(new SqlParameter("@LoginEmployeeId", SqlDbType.Int))
                .Value = LoginEmployeeId;
                cmdObj.Parameters
                     .Add(new SqlParameter("@RoleId", SqlDbType.Int))
                .Value = RoleId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "IsloginEmpSubmittedRatings");
            }

            return ds;
        }


        public DataSet IsDesignationUploaded(int AppraisalCycleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "IsDesignationUploaded";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
                      .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
            .Value = AppraisalCycleId;
                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "IsDesignationUploaded");
            }

            return ds;
        }





        public List<GetEmployeeRatingDetailsYearWise_ResultEntity> GetEmployeeRatingDetailsYearWise(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeeRatingDetailsYearWise_ResultEntity>(query, parameters).ToList();
        }
        public List<GetConfirmationRatingGiventoEmployees_Result> GetConfirmationRatingGiventoEmployees(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetConfirmationRatingGiventoEmployees_Result>(query, parameters).ToList();
        }

        public DataSet GetValidRecommendedDesignations()
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetValidRecommendedDesignations";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetValidRecommendedDesignations");
            }

            return ds;
        }

        public DataSet GetHRBPAdminEmployeeRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string GDLId, string DPId, string InputterId, int Role, string CriticalityPriorityId = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetHRBPAdminEmployeeRatingDetailsYearWise_local";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@LoginEmployeeId", SqlDbType.Int))
                .Value = LoginEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@GDLId", SqlDbType.VarChar))
             .Value = GDLId;

                cmdObj.Parameters
             .Add(new SqlParameter("@DPId", SqlDbType.VarChar))
             .Value = DPId;

                cmdObj.Parameters
             .Add(new SqlParameter("@InputterId", SqlDbType.VarChar))
             .Value = InputterId;

                cmdObj.Parameters
             .Add(new SqlParameter("@Role", SqlDbType.Int))
             .Value = Role;

                cmdObj.Parameters
             .Add(new SqlParameter("@CriticalityPriorityId", SqlDbType.VarChar, -1))
             .Value = string.IsNullOrWhiteSpace(CriticalityPriorityId) ? (object)DBNull.Value : CriticalityPriorityId.Trim();

                ds = du.GetDataSetWithProc(cmdObj);
                
                // Check if DataSet and Tables are not null before accessing
                if (ds != null && ds.Tables != null && ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "data";
                }
                else
                {
                    // If no data returned, create an empty DataSet with one empty table
                    if (ds == null)
                    {
                        ds = new DataSet();
                    }
                    DataTable emptyTable = new DataTable("data");
                    ds.Tables.Add(emptyTable);
                }
                
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetHRBPAdminEmployeeRatingDetailsYearWise");
                
                // Ensure we return a valid DataSet even on error
                if (ds == null)
                {
                    ds = new DataSet();
                    DataTable emptyTable = new DataTable("data");
                    ds.Tables.Add(emptyTable);
                }
            }

            return ds;
        }



        public List<GetEmployeeRatingHistoryDetail_ResultEntity> GetPEPRatingHistoryDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeeRatingHistoryDetail_ResultEntity>(query, parameters).ToList();
        }


        public List<GetRatingPracticeLeadWisePromotionDetails_ResultEntity> GetRatingPracticeLeadWisePromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingPracticeLeadWisePromotionDetails_ResultEntity>(query, parameters).ToList();
        }

        public List<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity> GetRatingMaleFemalePracticeLeadWisePromotionDetails(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity>(query, parameters).ToList();
        }

        public List<GetDataforPracticeLeadWisePromotionGraph_ResultEntity> GetDataforPracticeLeadWisePromotionGraph(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetDataforPracticeLeadWisePromotionGraph_ResultEntity>(query, parameters).ToList();
        }
        public List<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity> GetNormalisationAppraisalCycleGradeMapping(string query)
        {
            return context.Database.SqlQuery<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity>(query).ToList();
        }

        public int Insert(NormalisationGradeAppraisalMapping obj)
        {
            context.Set<NormalisationGradeAppraisalMapping>().Add(obj);
            context.SaveChanges();
            return obj.Id;
        }
        public List<GetAdminRatingVisibility_ResultEntity> GetAdminRatingVisibility(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetAdminRatingVisibility_ResultEntity>(query, parameters).ToList();
        }
        public NormalisationGradeAppraisalMapping GetNormalisationGradeAppraisalMapping(int Id)
        {
            NormalisationGradeAppraisalMapping query = context.Set<NormalisationGradeAppraisalMapping>().SingleOrDefault(x => x.Id == Id);
            return query;
        }

        public int Update(NormalisationGradeAppraisalMapping obj)
        {
            context.Set<NormalisationGradeAppraisalMapping>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }
        public PromotionPercentageYearGenderWise GetPromotionPercentageYearGenderWise(int Id)
        {
            PromotionPercentageYearGenderWise query = context.Set<PromotionPercentageYearGenderWise>().SingleOrDefault(x => x.Id == Id);
            return query;
        }
        public int Insert(NormalisationRatingVisibilityConfig obj)
        {
            context.Set<NormalisationRatingVisibilityConfig>().Add(obj);
            context.SaveChanges();
            return obj.Id;
        }
        public List<GetPromotionGradeConfig_ResultEntity> GetPromotionGradeConfiguration(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetPromotionGradeConfig_ResultEntity>(query, parameters).ToList();
        }
        public NormalisationRatingVisibilityConfig GetNormalisationRatingVisibility(int Id)
        {
            NormalisationRatingVisibilityConfig query = context.Set<NormalisationRatingVisibilityConfig>().SingleOrDefault(x => x.Id == Id);
            return query;
        }

        public int SendMailAfterAction(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<int>(query, parameters).FirstOrDefault();
        }
        public string GetEmpName(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<string>(query, parameters).FirstOrDefault();
        }
        public int Update(NormalisationRatingVisibilityConfig obj)
        {
            context.Set<NormalisationRatingVisibilityConfig>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }

        public int Insert(PromotionPercentageYearGenderWise obj)
        {
            context.Set<PromotionPercentageYearGenderWise>().Add(obj);
            context.SaveChanges();
            return obj.Id;
        }

        public int Update(PromotionPercentageYearGenderWise obj)
        {
            context.Set<PromotionPercentageYearGenderWise>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }
        public string EncryptString(string strEncrypted)

        {
            byte[] b = System.Text.ASCIIEncoding.ASCII.GetBytes(strEncrypted);

            string encrypted = Convert.ToBase64String(b); return encrypted;
        }

        public int InsertUpdateRating(List<EmployeeRatingNormailizationDetailsEntity> Ratngarray)
        {
            DataSet ds = null;
            int result = 0;
            try
            {
                string entityConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ConnectionString;
                EntityConnectionStringBuilder entityBuilder = new EntityConnectionStringBuilder(entityConnectionString);
                string sqlConnectionString = entityBuilder.ProviderConnectionString;

                using (SqlConnection conn = new SqlConnection(sqlConnectionString))
                {
                    conn.Open();
                    foreach (var ratingarr in Ratngarray)
                    {
                        using (SqlCommand cmd = new SqlCommand("usp_InsertEmployeeRating", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;

                            cmd.Parameters.AddWithValue("@AppraisalCycleId", ratingarr.AppraisalCycleId);
                            cmd.Parameters.AddWithValue("@PEPEmployeeId", ratingarr.PEPEmployeeId);
                            cmd.Parameters.AddWithValue("@Rating", EncryptString(ratingarr.Rating) ?? "");
                            cmd.Parameters.AddWithValue("@RatingGivenBy", ratingarr.RatingGivenBy ?? 0);
                            cmd.Parameters.AddWithValue("@RecoForPromotion", ratingarr.RecoForPromotion);
                            cmd.Parameters.AddWithValue("@Status", ratingarr.Status);
                            cmd.Parameters.AddWithValue("@Comments", ratingarr.Comments);
                            cmd.Parameters.AddWithValue("@RoleId", ratingarr.RoleId);
                            cmd.Parameters.AddWithValue("@PromotionTrack", ratingarr.PromotionTrack);

                            SqlParameter outputParam = new SqlParameter("@InsertedRows", SqlDbType.Int);
                            outputParam.Direction = ParameterDirection.Output;
                            cmd.Parameters.Add(outputParam);

                            cmd.ExecuteNonQuery();

                            result += (int)outputParam.Value;

                        }
                    }
                }

            }

            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAnnualrating");
            }

            return result;
        }


        public int UpdateConsent(int AppraisalCycleId, int LogEmpId, int SelectEmpId, int action, int RoleId)
        {
            DataSet ds = null;
            int result = 0;
            try
            {
                string entityConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ConnectionString;
                EntityConnectionStringBuilder entityBuilder = new EntityConnectionStringBuilder(entityConnectionString);
                string sqlConnectionString = entityBuilder.ProviderConnectionString;

                using (SqlConnection conn = new SqlConnection(sqlConnectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("usp_InsertEmployeeRecoDesigConsent", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@AppraisalCycleId", AppraisalCycleId);
                        cmd.Parameters.AddWithValue("@LogEmpId", LogEmpId);
                        cmd.Parameters.AddWithValue("@SelectEmpId", SelectEmpId);
                        cmd.Parameters.AddWithValue("@action", action);
                        cmd.Parameters.AddWithValue("@RoleId", RoleId);
                        SqlParameter outputParam = new SqlParameter("@InsertedRows", SqlDbType.Int);
                        outputParam.Direction = ParameterDirection.Output;
                        cmd.Parameters.Add(outputParam);

                        cmd.ExecuteNonQuery();

                        result += (int)outputParam.Value;

                    }

                }

            }

            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAnnualrating");
            }

            return result;
        }


        public int ReferbackRating(List<EmployeeRatingNormailizationDetailsEntity> Ratngarray)
        {
            DataSet ds = null;
            int result = 0;
            try
            {
                string entityConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ConnectionString;
                EntityConnectionStringBuilder entityBuilder = new EntityConnectionStringBuilder(entityConnectionString);
                string sqlConnectionString = entityBuilder.ProviderConnectionString;

                using (SqlConnection conn = new SqlConnection(sqlConnectionString))
                {
                    conn.Open();
                    foreach (var ratingarr in Ratngarray.Where(e => e.Rating != "0"))
                    {
                        using (SqlCommand cmd = new SqlCommand("usp_ReferBacktEmployeeRating", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;

                            cmd.Parameters.AddWithValue("@AppraisalCycleId", ratingarr.AppraisalCycleId);
                            cmd.Parameters.AddWithValue("@PEPEmployeeId", ratingarr.PEPEmployeeId);
                            //cmd.Parameters.AddWithValue("@Rating", EncryptString(ratingarr.Rating) ?? "");
                            cmd.Parameters.AddWithValue("@ModifiedBy", ratingarr.ModifiedBy);
                            //cmd.Parameters.AddWithValue("@RecoForPromotion", ratingarr.RecoForPromotion);
                            cmd.Parameters.AddWithValue("@Status", ratingarr.Status);
                            cmd.Parameters.AddWithValue("@Comments", ratingarr.Comments);
                            cmd.Parameters.AddWithValue("@RoleId", ratingarr.RoleId);

                            SqlParameter outputParam = new SqlParameter("@UpdatedRows", SqlDbType.Int);
                            outputParam.Direction = ParameterDirection.Output;
                            cmd.Parameters.Add(outputParam);

                            cmd.ExecuteNonQuery();

                            result += (int)outputParam.Value;

                        }
                    }
                }

            }

            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAnnualrating");
            }

            return result;
        }


        public List<BindDropdown_Result> BindRolesByApprCycle(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<BindDropdown_Result>(query, parameters).ToList();
        }



        public DataSet GetAppraisalCycleRoleMapping()
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetAppraisalCycleRoleMapping";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAppraisalCycleRoleMapping");
            }

            return ds;
        }

        public int SaveNormalisationRoleMapping(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<int>(query, parameters).FirstOrDefault();
        }
        public class StartEndDateDTO
        {
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
        }

        public (DateTime?, DateTime?) BindStartDateByRole(string query, params object[] parameters)
        {
            var result = context.Database.SqlQuery<StartEndDateDTO>(query, parameters).FirstOrDefault();

            if (result != null)
            {
                return (result.StartDate, result.EndDate);
            }

            return (null, null);
        }
        public int ExecuteNonQuery(string query, params object[] parameters)
        {
            return context.Database.ExecuteSqlCommand(query, parameters);
        }

        #region Column Visibility Methods

        /// <summary>
        /// Get all column configuration for Rating table
        /// </summary>
        public DataSet GetRatingColumnConfiguration(string pageType = "Rating")
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetRatingColumnConfiguration";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@PageType", pageType);

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "ColumnConfig";
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetRatingColumnConfiguration");
            }

            return ds;
        }

        /// <summary>
        /// Get user's saved column preferences or default preferences
        /// </summary>
        public DataSet GetUserColumnPreferences(int employeeId, string pageType = "Rating")
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetUserColumnPreferences";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@EmployeeId", employeeId);
                cmdObj.Parameters.AddWithValue("@PageType", pageType);

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "UserPreferences";
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetUserColumnPreferences");
            }

            return ds;
        }

        /// <summary>
        /// Save user's column visibility preferences
        /// </summary>
        public DataSet SaveUserColumnPreferences(int employeeId, string visibleColumnIds, string pageType = "Rating")
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_SaveUserColumnPreferences";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                // Add parameters with explicit null handling
                cmdObj.Parameters.Add("@EmployeeId", SqlDbType.Int).Value = employeeId;
                cmdObj.Parameters.Add("@VisibleColumnIds", SqlDbType.NVarChar, -1).Value = 
                    string.IsNullOrEmpty(visibleColumnIds) ? (object)DBNull.Value : visibleColumnIds;
                cmdObj.Parameters.AddWithValue("@PageType", pageType);

                System.Diagnostics.Debug.WriteLine($"SaveUserColumnPreferences - EmployeeId: {employeeId}, ColumnIds: {visibleColumnIds}, PageType: {pageType}");

                ds = du.GetDataSetWithProc(cmdObj);
                
                System.Diagnostics.Debug.WriteLine($"SaveUserColumnPreferences - Dataset null: {ds == null}, Tables count: {ds?.Tables?.Count ?? 0}");
                
                if (ds != null && ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "SaveResult";
                    System.Diagnostics.Debug.WriteLine($"SaveUserColumnPreferences - Result: {ds.Tables[0].Rows[0]["Message"]}");
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SaveUserColumnPreferences Exception: {ex.Message}");
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SaveUserColumnPreferences");
                throw; // Re-throw to see the actual error
            }

            return ds;
        }

        #endregion


        #region  IDiosposable
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
        #region Criticality Details Methods

        /// <summary>
        /// Get criticality details for an employee using stored procedure
        /// </summary>
        public EmployeeRatingNormailizationDetailsEntity GetCriticalityDetails(int pepEmployeeId, int appraisalCycleId)
        {
            DataSet ds = null;
            EmployeeRatingNormailizationDetailsEntity result = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@PEPEmployeeId", pepEmployeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    result = new EmployeeRatingNormailizationDetailsEntity
                    {
                        PEPEmployeeId = pepEmployeeId,
                        AppraisalCycleId = appraisalCycleId,
                        CriticalityReasons = row["CriticalityReasons"] != DBNull.Value ? row["CriticalityReasons"].ToString() : null,
                        CriticalityPriority = row["CriticalityPriority"] != DBNull.Value ? row["CriticalityPriority"].ToString() : null,
                        AttritionRisk = row["AttritionRisk"] != DBNull.Value ? row["AttritionRisk"].ToString() : null,
                        AttritionRiskReason = row["AttritionRiskReason"] != DBNull.Value ? row["AttritionRiskReason"].ToString() : null,
                        ImmediateBackup = row["ImmediateBackup"] != DBNull.Value ? row["ImmediateBackup"].ToString() : null,
                        SuccessorName = row["SuccessorName"] != DBNull.Value ? row["SuccessorName"].ToString() : null
                    };
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityDetails");
            }
            return result;
        }

        /// <summary>
        /// Save criticality details for an employee using stored procedure
        /// </summary>
        public int SaveCriticalityDetails(EmployeeRatingNormailizationDetailsEntity criticalityData)
        {
            int result = 0;
            try
            {
                OpeneConnection();
                string _sql = "sp_SaveCriticalityDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                cmdObj.Parameters.AddWithValue("@PEPEmployeeId", criticalityData.PEPEmployeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", criticalityData.AppraisalCycleId);
                cmdObj.Parameters.Add("@CriticalityReasons", SqlDbType.NVarChar, -1).Value = 
                    string.IsNullOrEmpty(criticalityData.CriticalityReasons) ? (object)DBNull.Value : criticalityData.CriticalityReasons;
                cmdObj.Parameters.Add("@CriticalityPriority", SqlDbType.NVarChar, 50).Value = 
                    string.IsNullOrEmpty(criticalityData.CriticalityPriority) ? (object)DBNull.Value : criticalityData.CriticalityPriority;
                cmdObj.Parameters.Add("@AttritionRisk", SqlDbType.NVarChar, 50).Value = 
                    string.IsNullOrEmpty(criticalityData.AttritionRisk) ? (object)DBNull.Value : criticalityData.AttritionRisk;
                cmdObj.Parameters.Add("@AttritionRiskReason", SqlDbType.NVarChar, -1).Value = 
                    string.IsNullOrEmpty(criticalityData.AttritionRiskReason) ? (object)DBNull.Value : criticalityData.AttritionRiskReason;
                cmdObj.Parameters.Add("@ImmediateBackup", SqlDbType.NVarChar, 200).Value = 
                    string.IsNullOrEmpty(criticalityData.ImmediateBackup) ? (object)DBNull.Value : criticalityData.ImmediateBackup;
                cmdObj.Parameters.Add("@SuccessorName", SqlDbType.NVarChar, 200).Value = 
                    string.IsNullOrEmpty(criticalityData.SuccessorName) ? (object)DBNull.Value : criticalityData.SuccessorName;
                
                // Add ModifiedBy (RatingGivenBy) and ByRoleId for history logging
                int modifiedBy = criticalityData.RatingGivenBy ?? 0;
                int roleId = criticalityData.RoleId ?? 0;
                
                cmdObj.Parameters.Add("@ModifiedBy", SqlDbType.Int).Value = 
                    modifiedBy > 0 ? (object)modifiedBy : (object)DBNull.Value;
                cmdObj.Parameters.Add("@ByRoleId", SqlDbType.Int).Value = 
                    roleId > 0 ? (object)roleId : (object)DBNull.Value;
                
                SqlParameter outputParam = new SqlParameter("@Result", SqlDbType.Int);
                outputParam.Direction = ParameterDirection.Output;
                cmdObj.Parameters.Add(outputParam);
                
                cmdObj.ExecuteNonQuery();
                
                result = (int)outputParam.Value;
                
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SaveCriticalityDetails");
            }
            return result;
        }

        /// <summary>
        /// Clear criticality fields via sp_RemoveCriticalityDetails (wraps sp_SaveCriticalityDetails with NULLs).
        /// </summary>
        public int RemoveCriticalityDetails(int pepEmployeeId, int appraisalCycleId, int? modifiedBy, int? byRoleId)
        {
            int result = 0;
            try
            {
                OpeneConnection();
                string _sql = "sp_RemoveCriticalityDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters.AddWithValue("@PEPEmployeeId", pepEmployeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);
                cmdObj.Parameters.Add("@ModifiedBy", SqlDbType.Int).Value =
                    modifiedBy.HasValue && modifiedBy.Value > 0 ? (object)modifiedBy.Value : DBNull.Value;
                cmdObj.Parameters.Add("@ByRoleId", SqlDbType.Int).Value =
                    byRoleId.HasValue && byRoleId.Value > 0 ? (object)byRoleId.Value : DBNull.Value;

                SqlParameter outputParam = new SqlParameter("@Result", SqlDbType.Int);
                outputParam.Direction = ParameterDirection.Output;
                cmdObj.Parameters.Add(outputParam);

                cmdObj.ExecuteNonQuery();

                result = outputParam.Value != DBNull.Value ? Convert.ToInt32(outputParam.Value) : 0;

                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "RemoveCriticalityDetails");
            }
            return result;
        }

        /// <summary>
        /// Get Criticality Reasons master data from database using stored procedure
        /// </summary>
        public List<CriticalityMasterEntity> GetCriticalityReasons()
        {
            DataSet ds = null;
            List<CriticalityMasterEntity> result = new List<CriticalityMasterEntity>();
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityMasterData";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@Type", "Reason");

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        result.Add(new CriticalityMasterEntity
                        {
                            Id = Convert.ToInt32(row["Id"]),
                            Value = row["Value"].ToString(),
                            DisplayText = row["DisplayText"].ToString(),
                            Type = row["Type"].ToString(),
                            IsActive = row["IsActive"] != DBNull.Value ? Convert.ToInt32(row["IsActive"]) : (int?)null,
                            DisplayOrder = row["DisplayOrder"] != DBNull.Value ? Convert.ToInt32(row["DisplayOrder"]) : (int?)null
                        });
                    }
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityReasons");
            }
            return result;
        }

        /// <summary>
        /// Get Criticality Priority master data from database using stored procedure
        /// </summary>
        public List<CriticalityMasterEntity> GetCriticalityPriorities()
        {
            DataSet ds = null;
            List<CriticalityMasterEntity> result = new List<CriticalityMasterEntity>();
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityMasterData";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@Type", "Priority");

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        result.Add(new CriticalityMasterEntity
                        {
                            Id = Convert.ToInt32(row["Id"]),
                            Value = row["Value"].ToString(),
                            DisplayText = row["DisplayText"].ToString(),
                            Type = row["Type"].ToString(),
                            IsActive = row["IsActive"] != DBNull.Value ? Convert.ToInt32(row["IsActive"]) : (int?)null,
                            DisplayOrder = row["DisplayOrder"] != DBNull.Value ? Convert.ToInt32(row["DisplayOrder"]) : (int?)null
                        });
                    }
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityPriorities");
            }
            return result;
        }

        /// <summary>
        /// Get Attrition Risk master data from database using stored procedure
        /// </summary>
        public List<CriticalityMasterEntity> GetAttritionRisks()
        {
            DataSet ds = null;
            List<CriticalityMasterEntity> result = new List<CriticalityMasterEntity>();
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityMasterData";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@Type", "AttritionRisk");

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        result.Add(new CriticalityMasterEntity
                        {
                            Id = Convert.ToInt32(row["Id"]),
                            Value = row["Value"].ToString(),
                            DisplayText = row["DisplayText"].ToString(),
                            Type = row["Type"].ToString(),
                            IsActive = row["IsActive"] != DBNull.Value ? Convert.ToInt32(row["IsActive"]) : (int?)null,
                            DisplayOrder = row["DisplayOrder"] != DBNull.Value ? Convert.ToInt32(row["DisplayOrder"]) : (int?)null
                        });
                    }
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAttritionRisks");
            }
            return result;
        }

        /// <summary>
        /// Get active employees in manager's span using stored procedure
        /// Excludes the employee for whom criticality details are being filled
        /// </summary>
        public List<EmployeeDropdownEntity> GetEmployeesInSpan(int managerId, int appraisalCycleId, int excludeEmployeeId = 0)
        {
            DataSet ds = null;
            List<EmployeeDropdownEntity> result = new List<EmployeeDropdownEntity>();
            try
            {
                OpeneConnection();
                string _sql = "sp_GetEmployeesInSpan";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@ManagerId", managerId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);
                cmdObj.Parameters.Add("@ExcludeEmployeeId", SqlDbType.Int).Value = 
                    excludeEmployeeId > 0 ? (object)excludeEmployeeId : DBNull.Value;

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        result.Add(new EmployeeDropdownEntity
                        {
                            EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                            EmployeeName = row["EmployeeName"].ToString(),
                            EmployeeCode = row["EmployeeCode"].ToString(),
                            DisplayText = row["DisplayText"].ToString()
                        });
                    }
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeesInSpan");
            }
            return result;
        }

        /// <summary>
        /// Get complete hierarchical span count for an employee
        /// Includes all direct and indirect reportees recursively
        /// </summary>
        public int GetCompleteSpanCount(int employeeId, int appraisalCycleId, int? roleId = null)
        {
            int spanCount = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCompleteSpanCount";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@EmployeeId", employeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);
                if (roleId.HasValue && roleId.Value > 0)
                {
                    cmdObj.Parameters.AddWithValue("@RoleId", roleId.Value);
                }
                else
                {
                    cmdObj.Parameters.Add("@RoleId", SqlDbType.Int).Value = DBNull.Value;
                }

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    spanCount = Convert.ToInt32(row["SpanCount"]);
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCompleteSpanCount");
            }
            return spanCount;
        }

        /// <summary>
        /// Get count of employees marked with Criticality Priority by a specific user in their span
        /// </summary>
        public int GetCriticalityMarkedCount(int employeeId, int appraisalCycleId, int? roleId = null)
        {
            int markedCount = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityMarkedCount";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@EmployeeId", employeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);
                if (roleId.HasValue && roleId.Value > 0)
                {
                    cmdObj.Parameters.AddWithValue("@RoleId", roleId.Value);
                }
                else
                {
                    cmdObj.Parameters.Add("@RoleId", SqlDbType.Int).Value = DBNull.Value;
                }

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    markedCount = Convert.ToInt32(row["MarkedCount"]);
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityMarkedCount");
            }
            return markedCount;
        }

        /// <summary>
        /// Get count of employees marked with specific Criticality Priority (P1, P2, or P3) by a specific user in their span
        /// </summary>
        public int GetCriticalityPriorityMarkedCount(int employeeId, int appraisalCycleId, string priorityCode, int? roleId = null)
        {
            int markedCount = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityPriorityMarkedCount";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@EmployeeId", employeeId);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);
                cmdObj.Parameters.AddWithValue("@PriorityCode", priorityCode ?? string.Empty);
                if (roleId.HasValue && roleId.Value > 0)
                {
                    cmdObj.Parameters.AddWithValue("@RoleId", roleId.Value);
                }
                else
                {
                    cmdObj.Parameters.Add("@RoleId", SqlDbType.Int).Value = DBNull.Value;
                }

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    markedCount = Convert.ToInt32(row["MarkedCount"]);
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityPriorityMarkedCount");
            }
            return markedCount;
        }

        /// <summary>
        /// Get employee recognitions (awards) from Aspire database using stored procedure
        /// Accepts NewEmployeeCode, stored procedure will look up OldEmployeeCode internally
        /// </summary>
        public List<EmployeeAspireAwardEntity> GetEmployeeAspireAwards(string newEmployeeCode, int appraisalCycleId)
        {
            DataSet ds = null;
            List<EmployeeAspireAwardEntity> result = new List<EmployeeAspireAwardEntity>();
            try
            {
                OpeneConnection();
                string _sql = "sp_GetEmployeeAspireAwards";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters.AddWithValue("@NewEmployeeCode", newEmployeeCode ?? string.Empty);
                cmdObj.Parameters.AddWithValue("@AppraisalCycleId", appraisalCycleId);

                ds = du.GetDataSetWithProc(cmdObj);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        result.Add(new EmployeeAspireAwardEntity
                        {
                            Id = Convert.ToInt32(row["Id"]),
                            EmpId = row["EmpId"].ToString(),
                            Month = row["Month"].ToString(),
                            Year = Convert.ToInt32(row["Year"]),
                            Location = row["Location"] != DBNull.Value ? row["Location"].ToString() : null,
                            DeliveryUnit = row["DeliveryUnit"] != DBNull.Value ? row["DeliveryUnit"].ToString() : null,
                            AwardId = Convert.ToInt32(row["AwardId"]),
                            AwardName = row["AwardName"] != DBNull.Value ? row["AwardName"].ToString() : "Unknown Recognition",
                            AwardType = row.Table.Columns.Contains("AwardType") && row["AwardType"] != DBNull.Value ? row["AwardType"].ToString() : "",
                            IsActive = Convert.ToInt32(row["isActive"]),
                            IsDeleted = row["isDeleted"] != DBNull.Value ? Convert.ToInt32(row["isDeleted"]) : 0,
                            Duration = row["Duration"] != DBNull.Value ? row["Duration"].ToString() : null,
                            AwardDate = row.Table.Columns.Contains("AwardDate") && row["AwardDate"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(row["AwardDate"]) : null,
                            CreatedOn = row["CreatedOn"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(row["CreatedOn"]) : null
                        });
                    }
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeAspireAwards");
            }
            return result;
        }

        /// <summary>
        /// Get Criticality Priority dropdown data from CriticalityMaster table
        /// Uses stored procedure sp_GetCriticalityPriorityForDropdown
        /// </summary>
        //public List<CriticalityMasterEntity> GetCriticalityPriorityForDropdown()
        //{
        //    DataSet ds = null;
        //    List<CriticalityMasterEntity> result = new List<CriticalityMasterEntity>();
        //    try
        //    {
        //        OpeneConnection();
        //        string _sql = "sp_GetCriticalityPriorityForDropdown";
        //        cmdObj = new SqlCommand(_sql, ConCampus);
        //        cmdObj.CommandType = CommandType.StoredProcedure;

        //        ds = du.GetDataSetWithProc(cmdObj);
        //        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //        {
        //            foreach (DataRow row in ds.Tables[0].Rows)
        //            {
        //                result.Add(new CriticalityMasterEntity
        //                {
        //                    Id = Convert.ToInt32(row["Id"]),
        //                    Value = row["Value"].ToString(),
        //                    DisplayText = row["DisplayText"].ToString(),
        //                    Type = row["Type"].ToString()
        //                });
        //            }
        //        }
        //        CloseConnection();
        //    }
        //    catch (Exception ex)
        //    {
        //        ExceptionLogging.SendExcepToDB(ex, sectionName, "GetCriticalityPriorityForDropdown");
        //    }
        //    return result;
        //}

        public DataSet GetCriticalityPriorityForDropdown()
        {
            //try
            //{
            //    return ExecuteStoredProcedure("sp_GetCriticalityPriorityForDropdown");
            //}
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "sp_GetCriticalityPriorityForDropdown";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetAspireeReporteeList");
            }

            return ds;
          
        }

        #endregion
    }
}
