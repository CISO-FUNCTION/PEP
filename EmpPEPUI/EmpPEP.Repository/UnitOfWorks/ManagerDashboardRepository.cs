using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;
using System;
using System.Data;
using System.Data.SqlClient;
using EmpPEP.Repository.common;
using System.Configuration;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class ManagerDashboardRepository : BaseDispose
    {

        SqlCommand cmdObj;
        string sectionName = "ManagerDashboardRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public ManagerDashboardRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #endregion

        #region "Public Methods"

        public DataSet GetFeedbackCountForManagerGraph(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetFeedbackCountForManagerGraph";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
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
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedbackCountForManagerGraph");
            }

            return ds;
        }
        public DataSet GetFeedbackCountForManagerDashboardSkipLevel(int EmployeeId, int AppraisalCycleId, string SelectSubcycle)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetFeedbackCountForManagerDashboardSkipLevel";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@EmployeeId", SqlDbType.Int))
                 .Value = EmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCyleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@SelectSubcycle", SqlDbType.VarChar))
                 .Value = SelectSubcycle;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedbackCountForManagerDashboardSkipLevel");
            }

            return ds;
        }
        public DataSet GetFeedbackCountForManagerDashboard(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedyear)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetFeedbackCountForManagerDashboard";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@Vsign", SqlDbType.VarChar))
                 .Value = Color;
                cmdObj.Parameters
                 .Add(new SqlParameter("@selectedyear", SqlDbType.Int))
                 .Value = selectedyear;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetFeedbackCountForManagerDashboard");
            }

            return ds;
        }
        
        public DataSet GetEmployeeAvgRatings(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId,int ActionTypeId, int AreaId, int selectedyear)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeAvgRatings";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FromEmployeeId", SqlDbType.Int))
                 .Value = FromEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ToEmployeeId", SqlDbType.Int))
                 .Value = ToEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@ActionTypeId", SqlDbType.Int))
                 .Value = ActionTypeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AreaId", SqlDbType.Int))
                 .Value = AreaId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@selectedyear", SqlDbType.Int))
                 .Value = selectedyear;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeAvgRatings");
            }

            return ds;
        }
        
        public DataSet GetMyTeamAwards(int managerId, int appraisalCycleId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetMyTeamAwards";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@ManagerId", SqlDbType.Int))
                 .Value = managerId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = appraisalCycleId;
               

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeAvgRatings");
            }

            return ds;
        }
        
        public DataSet GetManagerListByEmployeeId(int appraisalCycleId, int EmployeeId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetManagerListByEmployeeId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = appraisalCycleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@EmployeeId", SqlDbType.Int))
                 .Value = EmployeeId;
               

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeAvgRatings");
            }

            return ds;
        }
        public DataSet GetManagerDashboardData(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedYear)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                using (SqlCommand cmdObj = new SqlCommand("GetManagerDashboardData", ConCampus))
                {
                    cmdObj.CommandType = CommandType.StoredProcedure;
                    cmdObj.Parameters.AddWithValue("@AppraisalCycleId", AppraisalCycleId);
                    cmdObj.Parameters.AddWithValue("@FromEmployeeId", FromEmployeeId);
                    cmdObj.Parameters.AddWithValue("@ActionTypeId", ActionTypeId);
                    cmdObj.Parameters.AddWithValue("@Color", Color);
                    cmdObj.Parameters.AddWithValue("@SelectedYear", selectedYear);

                    ds = du.GetDataSetWithProc(cmdObj);
                    ds.Tables[0].TableName = "data";
                    CloseConnection();
                }
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetManagerDashboardData");
            }

            return ds;
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
    }
}
