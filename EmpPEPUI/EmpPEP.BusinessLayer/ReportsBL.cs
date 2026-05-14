using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static EmpPEP.Framework.Helper.EnumCollection;

namespace EmpPEP.BusinessLayer
{
    public class ReportsBL
    {
        public List<GetManagerFeedbackStatusReportEntity> GetManagerFeedbackStatusReport(int AppraisalCycleId, int SubCycle, int FromEmployeeId, int LoginEmpId, int LocationAdmin, int ActionTypeId, string VSign)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@SubCycle", SubCycle);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId );
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            
            sqlParam = new SqlParameter("@LoginEmpId", LoginEmpId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@LocationAdmin", LocationAdmin);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@VSign", VSign == "null" ? "A" : VSign);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();


                List<GetManagerFeedbackStatusReport_Result> Result = reportsRepository.GetManagerFeedbackStatusReport("EXEC dbo.[GetManagerFeedbackStatusReport] @AppraisalCycleId, @SubCycle,@FromEmployeeId,@LoginEmpId,@LocationAdmin,@ActionTypeId,@VSign", parameters).ToList<GetManagerFeedbackStatusReport_Result>(); ;
                return Utility.ConvertToList<GetManagerFeedbackStatusReport_Result, GetManagerFeedbackStatusReportEntity>(Result);
            }
        }

        public List<GetStrengthWeaknessForEmployee_ResultEntity> GetStrengthWeaknessForEmployeeReport(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AreaId", AreaId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetStrengthWeaknessForEmployee_Result> Result = reportsRepository.GetStrengthWeaknessForEmployeeReport("EXEC dbo.[GetStrengthWeaknessForEmployee] @AppraisalCycleId, @FromEmployeeId,@ToEmployeeId,@ActionTypeId,@AreaId", parameters).ToList<GetStrengthWeaknessForEmployee_Result>(); ;
                return Utility.ConvertToList<GetStrengthWeaknessForEmployee_Result, GetStrengthWeaknessForEmployee_ResultEntity>(Result);
            }
        }

        public List<GetStrengthWeaknessForManager_ResultEntity> GetStrengthWeaknessForManagerReport(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AreaId", AreaId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetStrengthWeaknessForManager_Result> Result = reportsRepository.GetStrengthWeaknessForManagerReport("EXEC dbo.[GetStrengthWeaknessForManager] @AppraisalCycleId, @FromEmployeeId,@ToEmployeeId,@ActionTypeId,@AreaId", parameters).ToList<GetStrengthWeaknessForManager_Result>(); ;
                return Utility.ConvertToList<GetStrengthWeaknessForManager_Result, GetStrengthWeaknessForManager_ResultEntity>(Result);
            }
        }

        //public List<GetCompetenciesAvgRatingsForGraphEntity> GetCompetenciesAvgRatingsForGraph(int AppraisalCycleId, int TOEmployeeId, int ActionTypeId, int AreaId)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@FromEmployeeId", (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", TOEmployeeId > 0 ? TOEmployeeId : (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);


        //    sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@AreaId", AreaId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var reportsRepository = new ReportsRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetCompetenciesAvgRatingsForGraph_Result> Result = reportsRepository.GetCompetenciesAvgRatingsForGraph("EXEC dbo.[GetCompetenciesAvgRatingsForGraph] @AppraisalCycleId, @FromEmployeeId, @ToEmployeeId, @ActionTypeId,@AreaId", parameters).ToList<GetCompetenciesAvgRatingsForGraph_Result>();
        //        return Utility.ConvertToList<GetCompetenciesAvgRatingsForGraph_Result, GetCompetenciesAvgRatingsForGraphEntity>(Result);
        //    }
        //}


        public List<PEP_GivenPendingFeedbackSelfAssesmentstatusResultEntity> GetFeedbackSelfAssessmentStatusReport(int AppraisalSubCycleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalSubCycle", AppraisalSubCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result> Result = reportsRepository.GetFeedbackSelfAssessmentStatusReport("EXEC dbo.[PEP_GivenPendingFeedbackSelfAssesmentstatus] @AppraisalSubCycle", parameters).ToList<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result>();
                return Utility.ConvertToList<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result, PEP_GivenPendingFeedbackSelfAssesmentstatusResultEntity>(Result);
            }
        }



        
        public List<GetKRADefaulterEmployeeResultEntity> GetKRADefaulterEmployeeReport(int AppraisalCycleId, int ManagerId, int LocationId, int EmpLoginId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ManagerId", ManagerId > 0 ? ManagerId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId > 0 ? LocationId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@EmpLoginId", EmpLoginId > 0 ? EmpLoginId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetKRADefaulterEmployee_Result> Result = reportsRepository.GetKRADefaulterEmployeeReport("EXEC dbo.[GetKRADefaulterEmployee] @AppraisalCycleId, @ManagerId, @LocationId, @EmpLoginId", parameters).ToList<GetKRADefaulterEmployee_Result>();
                return Utility.ConvertToList<GetKRADefaulterEmployee_Result, GetKRADefaulterEmployeeResultEntity>(Result);
            }
        }

        public List<GetWeightedScoreCalculationReportEntity> GetWeightedScoreCalculationReport(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetWeightedScoreCalculationReport_Result> Result = reportsRepository.GetWeightedScoreCalculationReport("EXEC [dbo].[GetWeightedScoreCalculationReport] @AppraisalCycleId, @FromEmployeeId,@ToEmployeeId,@ActionTypeId", parameters).ToList<GetWeightedScoreCalculationReport_Result>(); ;
                return Utility.ConvertToList<GetWeightedScoreCalculationReport_Result, GetWeightedScoreCalculationReportEntity>(Result);
            }
        }

        public List<GetBreakDownOfWeightedScoreCalculationReport_ResultEntity> GetWeightedScoreBreakDownReport(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion

            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetBreakDownOfWeightedScoreCalculationReport_Result> Result = reportsRepository.GetBreakDownOfWeightedScoreCalculationReport("EXEC [dbo].[GetBreakDownOfWeightedScoreCalculationReport] @AppraisalCycleId, @FromEmployeeId,@ToEmployeeId,@ActionTypeId", parameters).ToList<GetBreakDownOfWeightedScoreCalculationReport_Result>(); ;
                return Utility.ConvertToList<GetBreakDownOfWeightedScoreCalculationReport_Result, GetBreakDownOfWeightedScoreCalculationReport_ResultEntity>(Result);
            }
        }

        public List<GetManagerFeedbackStatusReportForGraph_ResultEntity> GetManagerFeedbackStatusReportForGraph(int ManagerEmployeeId, int AppraisalCycleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ManagerEmployeeId", ManagerEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetManagerFeedbackStatusReportForGraph_Result> Result = reportsRepository.GetManagerFeedbackStatusReportForGraph("EXEC dbo.[GetManagerFeedbackStatusReportForGraph] @ManagerEmployeeId, @AppraisalCycleId", parameters).ToList<GetManagerFeedbackStatusReportForGraph_Result>(); ;
                return Utility.ConvertToList<GetManagerFeedbackStatusReportForGraph_Result, GetManagerFeedbackStatusReportForGraph_ResultEntity>(Result);
            }
        }

        public List<GetFeedbackRport_ResultEntity> GetFeedbackReport(string Type, int EmpLoginID, DateTime StartDate, DateTime EndDate)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@Type", Type);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpLoginID", EmpLoginID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@FromDate", StartDate);
            sqlParam.SqlDbType = SqlDbType.DateTime;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToDate", EndDate);
            sqlParam.SqlDbType = SqlDbType.DateTime;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetFeedbackRport_Result> Result = reportsRepository.GetFeedbackReport("EXEC dbo.[GetFeedbackRport] @Type,@EmpLoginID,@FromDate,@ToDate", parameters).ToList<GetFeedbackRport_Result>(); 
                return Utility.ConvertToList<GetFeedbackRport_Result, GetFeedbackRport_ResultEntity>(Result);
            }
        }

        public List<GetSelectedEmpFeedbackRport_ResultEntity> GetSelectEmpFeedbackReport(string Type, int EmpLoginID, int SelectEmpID,DateTime StartDate, DateTime EndDate)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@Type", Type);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpLoginID", EmpLoginID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@SelectEmpID", SelectEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@FromDate", StartDate);
            sqlParam.SqlDbType = SqlDbType.DateTime;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToDate", EndDate);
            sqlParam.SqlDbType = SqlDbType.DateTime;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetSelectedEmpFeedbackRport_Result> Result = reportsRepository.GetSelectEmpFeedbackReport("EXEC dbo.[GetSelectedEmpFeedbackRport] @Type,@EmpLoginID,@SelectEmpID,@FromDate,@ToDate", parameters).ToList<GetSelectedEmpFeedbackRport_Result>(); ;
                return Utility.ConvertToList<GetSelectedEmpFeedbackRport_Result, GetSelectedEmpFeedbackRport_ResultEntity>(Result);
            }
        }

        public List<GetDUWiseManagerFeedbackReport_ResultEntity> GetDUWiseManagerFeedbackReport(int DUId, int AppraisalCycleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@DuId", DUId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDUWiseManagerFeedbackReport_Result> Result = reportsRepository.GetDUWiseManagerFeedbackReport("EXEC dbo.[GetDUWiseManagerFeedbackReport] @DuId,@AppraisalCycleId", parameters).ToList<GetDUWiseManagerFeedbackReport_Result>(); ;
                return Utility.ConvertToList<GetDUWiseManagerFeedbackReport_Result, GetDUWiseManagerFeedbackReport_ResultEntity>(Result);
            }
        }

        public List<GetDUWiseSubordinateReport_ResultEntity> GetDUWiseSubordinateReport(int ManagerEmployeeId, int AppraisalCycleId, string type)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EmployeeId", ManagerEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Type", type);
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDUWiseSubordinateReport_Result> Result = reportsRepository.GetDUWiseSubordinateReport("EXEC dbo.[GetDUWiseSubordinateReport] @EmployeeId,@AppraisalCycleId,@Type", parameters).ToList<GetDUWiseSubordinateReport_Result>(); ;
                return Utility.ConvertToList<GetDUWiseSubordinateReport_Result, GetDUWiseSubordinateReport_ResultEntity>(Result);
            }
        }

        public List<GetGoalModificationSummaryReport_ResultEntity> GetGoalModificationSummaryReport(int? AppraisalCycleId, int? EmployeeId, string Status)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId.HasValue ? (object)AppraisalCycleId.Value : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmployeeId", EmployeeId.HasValue ? (object)EmployeeId.Value : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Status", !string.IsNullOrEmpty(Status) ? (object)Status : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.NVarChar;
            sqlParam.Size = 50;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetGoalModificationSummaryReport_Result> Result = reportsRepository.GetGoalModificationSummaryReport("EXEC dbo.[GetGoalModificationSummaryReport] @AppraisalCycleId,@EmployeeId,@Status", parameters).ToList<GetGoalModificationSummaryReport_Result>();
                return Utility.ConvertToList<GetGoalModificationSummaryReport_Result, GetGoalModificationSummaryReport_ResultEntity>(Result);
            }
        }

        public List<GetGoalModificationSummaryReport_ResultEntity> GetGoalModificationSummaryReportForManager(int? AppraisalCycleId, int ManagerId, string Status)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId.HasValue ? (object)AppraisalCycleId.Value : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ManagerId", ManagerId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Status", !string.IsNullOrEmpty(Status) ? (object)Status : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.NVarChar;
            sqlParam.Size = 50;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetGoalModificationSummaryReport_Result> Result = reportsRepository.GetGoalModificationSummaryReportForManager("EXEC dbo.[sp_GetGoalModificationSummaryReportForManager] @AppraisalCycleId,@ManagerId,@Status", parameters).ToList<GetGoalModificationSummaryReport_Result>();
                return Utility.ConvertToList<GetGoalModificationSummaryReport_Result, GetGoalModificationSummaryReport_ResultEntity>(Result);
            }
        }

        public DataSet GetEmployeeTalentManagementData(int? AppraisalCycleId, string LoginEmpId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId.HasValue ? (object)AppraisalCycleId.Value : DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LoginEmployeeId", (object)LoginEmpId ?? DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.NVarChar;
            sqlParam.Size = 50;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                DataSet Result = reportsRepository.GetEmployeeTalentManagementData("EXEC dbo.[sp_GetEmployeeTalentManagementData] @AppraisalCycleId, @LoginEmployeeId", parameters);
                return Result;
            }
        }


        public List<GODefaultNewReport> GetKRADefaulterEmployeeReport1(int AppraisalCycleId, int ManagerId, int LocationId, int EmpLoginId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ManagerId", ManagerId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@EmpLoginId", EmpLoginId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GODefaultNewReport> Result = reportsRepository.GetKRADefaulterEmployeeReport1("EXEC dbo.[GODefaulter] @AppraisalCycleId, @ManagerId, @LocationId, @EmpLoginId", parameters).ToList<GODefaultNewReport>();
                return Utility.ConvertToList<GODefaultNewReport, GODefaultNewReport>(Result);
                //return Result;
            }
        }
        public List<GOFeedbackAssessmentTrackerReport> GetGOSelfAssessmentFeedbackTrackerReport(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int CycleType)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@CycleType", CycleType);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            //@CycleType
            #endregion
            using (var reportsRepository = new ReportsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GOFeedbackAssessmentTrackerReport> Result = reportsRepository.GetGOSelfAssessmentFeedbackTrackerReport("EXEC dbo.[GOAssessmentFeedbacktracker] @AppraisalCycleId, @FromEmployeeId,@ToEmployeeId, @CycleType", parameters).ToList<GOFeedbackAssessmentTrackerReport>();
                return Utility.ConvertToList<GOFeedbackAssessmentTrackerReport, GOFeedbackAssessmentTrackerReport>(Result);
                //return Result;
            }
        }


    }
}
