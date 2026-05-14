using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using EmpPEP.BusinessEntities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class ManagerDashboardBL
    {
        //public List<GetFeedbackCountForManagerGraph_ResultEntiry> Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var managerDashboardRepository = new ManagerDashboardRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetFeedbackCountForManagerGraph_Result> getEmployeeFeedback_Result = managerDashboardRepository.GetFeedbackCountForManagerGraph("EXEC dbo.[GetFeedbackCountForManagerGraph] @AppraisalCycleId,@FromEmployeeId,@ActionTypeId", parameters).ToList<GetFeedbackCountForManagerGraph_Result>(); ;
        //        return Utility.ConvertToList<GetFeedbackCountForManagerGraph_Result, GetFeedbackCountForManagerGraph_ResultEntiry>(getEmployeeFeedback_Result);
        //    }
        //}
        //public List<GetFeedbackCountForManagerDashboard_ResultEntity> Get(int EmployeeId, int AppraisalCycleId, string SelectSubcycle)
        //{

        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;

        //    sqlParam = new SqlParameter("@EmployeeId", EmployeeId > 0 ? EmployeeId : (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@SelectSubcycle", SelectSubcycle);
        //    sqlParam.SqlDbType = SqlDbType.VarChar;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var managerDashboardRepository = new ManagerDashboardRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetFeedbackCountForManagerDashboard_Result> getEmployeeFeedback_Result = managerDashboardRepository.GetFeedbackCountForManagerDashboardSkipLevel("EXEC dbo.[GetFeedbackCountForManagerDashboardSkipLevel] @EmployeeId,@AppraisalCycleId,@SelectSubcycle", parameters).ToList<GetFeedbackCountForManagerDashboard_Result>();
        //        return Utility.ConvertToList<GetFeedbackCountForManagerDashboard_Result, GetFeedbackCountForManagerDashboard_ResultEntity>(getEmployeeFeedback_Result);
        //    }
        //}
        //public List<GetFeedbackCountForManagerDashboard_ResultEntity> Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedyear)
        //{

        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@Vsign", Color);
        //    sqlParam.SqlDbType = SqlDbType.VarChar;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@selectedyear", selectedyear);
        //    sqlParam.SqlDbType = SqlDbType.VarChar;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var managerDashboardRepository = new ManagerDashboardRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetFeedbackCountForManagerDashboard_Result> getEmployeeFeedback_Result = managerDashboardRepository.GetFeedbackCountForManagerDashboard("EXEC dbo.[GetFeedbackCountForManagerDashboard] @AppraisalCycleId,@FromEmployeeId,@ActionTypeId,@VSign,@selectedyear", parameters).ToList<GetFeedbackCountForManagerDashboard_Result>();
        //        return Utility.ConvertToList<GetFeedbackCountForManagerDashboard_Result, GetFeedbackCountForManagerDashboard_ResultEntity>(getEmployeeFeedback_Result);
        //    }
        //}

        //public List<GetEmployeeAvgRatings_ResultEntity> Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId, int selectedyear)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
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

        //    sqlParam = new SqlParameter("@selectedyear", selectedyear);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);



        //    #endregion
        //    using (var managerDashboardRepository = new ManagerDashboardRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetEmployeeAvgRatings_Result> getEmployeeFeedback_Result = managerDashboardRepository.GetEmployeeAvgRatings("EXEC dbo.[GetEmployeeAvgRatings] @AppraisalCycleId,@FromEmployeeId,@ToEmployeeId,@ActionTypeId,@AreaId,@selectedyear", parameters).ToList<GetEmployeeAvgRatings_Result>();
        //        return Utility.ConvertToList<GetEmployeeAvgRatings_Result, GetEmployeeAvgRatings_ResultEntity>(getEmployeeFeedback_Result);
        //    }
        //}

        //public List<GetMyTeamAwards_ResultEntity> GetMyTeamAwards(int managerId, int appraisalCycleId)
        //{
        //    using (var repository = new ManagerDashboardRepository())
        //    {
        //        List<SqlParameter> paramCollection = new List<SqlParameter>();
        //        paramCollection.Add(new SqlParameter("@ManagerId", managerId));
        //        paramCollection.Add(new SqlParameter("@AppraisalCycleId", appraisalCycleId));
        //        SqlParameter[] parameters = paramCollection.ToArray();

        //        List<GetMyTeamAwards_Result> awardList = repository.GetMyTeamAwards("EXEC GetMyTeamAwards @ManagerId, @AppraisalCycleId", parameters).ToList();
        //        if (awardList.Any())
        //        {
        //            return Utility.ConvertToList<GetMyTeamAwards_Result, GetMyTeamAwards_ResultEntity>(awardList);
        //        }
        //        return null;
        //    }

        //}
        //public List<GetManagerListByEmployeeId_ResultEntity> GetManagerListByEmployeeId(int appraisalCycleId, int EmployeeId)
        //{
        //    using (var repository = new ManagerDashboardRepository())
        //    {
        //        List<SqlParameter> paramCollection = new List<SqlParameter>();
        //        paramCollection.Add(new SqlParameter("@AppraisalCycleId", appraisalCycleId));
        //        paramCollection.Add(new SqlParameter("@EmployeeId", EmployeeId));
        //        SqlParameter[] parameters = paramCollection.ToArray();

        //        List<GetManagerListByEmployeeId_Result> awardList = repository.GetManagerListByEmployeeId("EXEC GetManagerListByEmployeeId @AppraisalCycleId, @EmployeeId", parameters).ToList();
        //        if (awardList.Any())
        //        {
        //            return Utility.ConvertToList<GetManagerListByEmployeeId_Result, GetManagerListByEmployeeId_ResultEntity>(awardList);
        //        }
        //        return null;
        //    }

        //}



        public DataSet Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId)
        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetFeedbackCountForManagerGraph(AppraisalCycleId, FromEmployeeId, ActionTypeId);
            }
            return dataDs;
        }
        public DataSet Get(int EmployeeId, int AppraisalCycleId, string SelectSubcycle)
        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetFeedbackCountForManagerDashboardSkipLevel(EmployeeId,AppraisalCycleId, SelectSubcycle);
            }
            return dataDs;
        }
        public DataSet Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedyear)
        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetFeedbackCountForManagerDashboard(AppraisalCycleId,  FromEmployeeId,  ActionTypeId,  Color,  selectedyear);
            }
            return dataDs;
        }
        public DataSet Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId, int selectedyear)
        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetEmployeeAvgRatings(AppraisalCycleId,  FromEmployeeId,  ToEmployeeId,  ActionTypeId,  AreaId,  selectedyear);
            }
            return dataDs;
        }
        public DataSet GetMyTeamAwards(int managerId, int appraisalCycleId)

        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetMyTeamAwards(managerId, appraisalCycleId);

            }
            return dataDs;
        }
        public DataSet GetManagerListByEmployeeId(int appraisalCycleId, int EmployeeId)

        {
            DataSet dataDs;
            using (var managerDashboardRepository = new ManagerDashboardRepository())

            {
                dataDs = managerDashboardRepository.GetManagerListByEmployeeId(appraisalCycleId, EmployeeId);
            }
            return dataDs;
        }
        public DataSet GetManagerDashboardData(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedYear)
        {
            using (var managerDashboardRepository = new ManagerDashboardRepository())
            {
                return managerDashboardRepository.GetManagerDashboardData(AppraisalCycleId, FromEmployeeId, ActionTypeId, Color, selectedYear);
            }
        }











    }
}
