using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;

namespace EmpPEP.Repository.UnitOfWorks
{

    public class PIPRepository : BaseDispose
    {

        SqlCommand cmdObj;
        string sectionName = "PIPRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"

        public PIPRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #endregion


        public DataSet GetPIPEmployeesByRM(int RMID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_PIPEmployeesListByRM";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@RMID", SqlDbType.Int))
                 .Value = RMID;


                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetPIPEmployeesByRM");
            }

            return ds;
        }
        public DataSet GetPIPEmployeeDetailsByRoleId(int LoginId, int RoleId, int FilterId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetPIPDetailOfEmpByRoleId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@LoginId", SqlDbType.Int))
                 .Value = LoginId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@RoleId", SqlDbType.Int))
                 .Value = RoleId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@FilterId", SqlDbType.Int))
                 .Value = FilterId;


                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetPIPDetailOfEmpByRoleId");
            }

            return ds;
        }

        public DataSet GetPIPEmployeeDetailsBySelectEmpID(int SEmpId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetPIPEmployeeDetailsBySelectEmpID";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@SEmpId", SqlDbType.Int))
                 .Value = SEmpId;


                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetPIPEmployeeDetailsBySelectEmpID");
            }

            return ds;
        }



        public DataSet PIP_GetEmployeeSavedParameterDetasByParamId(int ParameterId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetEmployeeSavedParameterDetasByParamId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@ParameterId", SqlDbType.Int))
                 .Value = ParameterId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetEmployeeSavedParameterDetasByParamId");
            }

            return ds;
        }

        public DataSet PIP_GetEmpSavedFeedbackDetByWeekId(int WeekId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetEmployeeFeebackDetailsByWeekId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@ParameterId", SqlDbType.Int))
                 .Value = WeekId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetEmployeeSavedParameterDetasByParamId");
            }

            return ds;
        }

        public DataSet PIP_GetEmployeeSavedParameterDetailsByPIPId(int PIPId, int SEmpID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetEmployeeSavedParameterDetailsByPIPId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                 .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                 .Value = PIPId;

                cmdObj.Parameters
                        .Add(new SqlParameter("@SEmpID", SqlDbType.Int))
                       .Value = SEmpID;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetEmployeeSavedParameterDetailsByPIPId");
            }

            return ds;
        }

        public DataSet PIP_GetEmployeeAllPIPDetailsByEmpID(int SEmpID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetEmployeeAllPIPDetailsByEmpID";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@SEmpID", SqlDbType.Int))
                       .Value = SEmpID;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetEmployeeAllPIPDetailsByEmpID");
            }

            return ds;
        }
        public DataSet GetActionHistory(int PIPId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetHistory";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetHistory");
            }

            return ds;
        }

        public DataSet PIP_GetFeedbackByParamId(int ParameterId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetFeedbackByParamId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@ParameterId", SqlDbType.Int))
                       .Value = ParameterId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetFeedbackByParamId");
            }

            return ds;
        }


        public DataSet PIP_GetParamterDetailByParamId(int PIPId, int WeekNo)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetParamterDetailByParamId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                cmdObj.Parameters
                        .Add(new SqlParameter("@WeekNo", SqlDbType.Int))
                       .Value = WeekNo;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetFeedbackByParamId");
            }

            return ds;
        }


        public DataSet GetPIPEndateExceptHoliday_Weekends(int PIPId, DateTime PIPEndDate)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetPIPEndateExceptHoliday_Weekend";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPEndDate", SqlDbType.DateTime))
                       .Value = PIPEndDate;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetPIPEndateExceptHoliday_Weekends");
            }

            return ds;
        }
        public DataSet PIP_GetEligibleExtension(int PIPId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetEligibleExtension";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;


                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetEligibleExtension");
            }

            return ds;
        }


        public DataSet PIP_GetPIPResultValues(int PIPId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetPIPResultValues";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetPIPResultValues");
            }

            return ds;
        }


        public DataSet PIP_GetTotalWeeksForFeedback(int ParameterId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_GetPIPResultValues";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@ParameterId", SqlDbType.Int))
                       .Value = ParameterId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_GetTotalWeeksForFeedback");
            }

            return ds;
        }

        public int SavePIPMeasurementAgainstEmployee(int ParameterId, int PIPId, int LoginEmpId, int SelectEmpID, string ProgressIssue, string Deliverables, string ProgressMeasuremnt, int CreatedBy)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_SaveupdateParameterDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@ParameterId", SqlDbType.Int))
                       .Value = ParameterId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@LoginEmpId", SqlDbType.Int))
                       .Value = LoginEmpId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@SelectEmpID", SqlDbType.Int))
                       .Value = SelectEmpID;

                cmdObj.Parameters
                       .Add(new SqlParameter("@ProgressIssue", SqlDbType.VarChar))
                      .Value = ProgressIssue;
                cmdObj.Parameters
                       .Add(new SqlParameter("@Deliverables", SqlDbType.VarChar))
                      .Value = Deliverables;
                cmdObj.Parameters
                       .Add(new SqlParameter("@ProgressMeasuremnt", SqlDbType.VarChar))
                      .Value = ProgressMeasuremnt;
                cmdObj.Parameters
                 .Add(new SqlParameter("@CreatedBy", SqlDbType.Int))
                .Value = CreatedBy;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SavePIPMeasurementAgainstEmployee");
            }

            return res;
        }

        public int SendMailBasedOnStatus(int PIPId, int LoginEmpId, int SelectEmpID, int Action)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_SendMailBasedOnStatus";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@LoginEmpId", SqlDbType.Int))
                       .Value = LoginEmpId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@SelectEmpID", SqlDbType.Int))
                       .Value = SelectEmpID;
                cmdObj.Parameters
                        .Add(new SqlParameter("@Action", SqlDbType.Int))
                       .Value = Action;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SendMailBasedOnStatus");
            }

            return res;
        }

        public int SendMailOnSubmitFeedback(int PIPId, int LoginEmpId, int WeekNo)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_SendMailOnSubmitFeedback";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@LoginEmpId", SqlDbType.Int))
                       .Value = LoginEmpId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@WeekNo", SqlDbType.Int))
                       .Value = WeekNo;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "SendMailBasedOnStatus");
            }

            return res;
        }
        public int AddPIPWeeklyFeedback(int WeekId, int LoginEmpId, string Feedback)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_AddFeedbackAgainstParameterWeekWise";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@WeekId", SqlDbType.Int))
                       .Value = WeekId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@LoginEmpId", SqlDbType.Int))
                       .Value = LoginEmpId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@Feedback", SqlDbType.Int))
                       .Value = Feedback;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "AddPIPWeeklyFeedback");
            }

            return res;
        }


        public int PIP_CheckMandatoryWeekFill(int PIPId, int WeekId)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_CheckMandatoryWeekFill";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@WeekId", SqlDbType.Int))
                       .Value = WeekId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_CheckMandatoryWeekFill");
            }

            return res;
        }


        public int PIP_SubmitFinalResult(int PIPId, int PIPResultId, int PIPExtension, int PIPSubmitBy)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_SubmitPIPResult";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                       .Value = PIPId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@PIPResultId", SqlDbType.Int))
                       .Value = PIPResultId;

                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPExtension", SqlDbType.Int))
                      .Value = PIPExtension;

                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPSubmitBy", SqlDbType.Int))
                      .Value = PIPSubmitBy;

                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_SubmitFinalResult");
            }

            return res;
        }
        public int PutPIPDocApproveProcess(int LoginEmpId, int SelectEmpId, int PIPDuration, DateTime PIPDiscussionDate, DateTime PIPActualStartDate, int PIPId, int Action, int RoleId)
        {

            int res = 0;
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_DocApproveProcess";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@LoginEmpId", SqlDbType.Int))
                       .Value = LoginEmpId;
                cmdObj.Parameters
                        .Add(new SqlParameter("@SelectEmpId", SqlDbType.Int))
                       .Value = SelectEmpId;

                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPDuration", SqlDbType.Int))
                      .Value = PIPDuration;

                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPDiscussionDate", SqlDbType.DateTime))
                      .Value = PIPDiscussionDate;


                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPActualStartDate", SqlDbType.DateTime))
                      .Value = PIPActualStartDate;


                cmdObj.Parameters
                       .Add(new SqlParameter("@PIPId", SqlDbType.Int))
                      .Value = PIPId;


                cmdObj.Parameters
                       .Add(new SqlParameter("@Action", SqlDbType.Int))
                      .Value = Action;


                cmdObj.Parameters
                       .Add(new SqlParameter("@RoleId", SqlDbType.Int))
                      .Value = RoleId;



                ds = du.GetDataSetWithProc(cmdObj);
                res = (int)ds.Tables[0].Rows[0][0];
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PutPIPDocApproveProcess");
            }

            return res;
        }




        public DataSet GetEmpRoleListById(int EmpID)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_FindRoleByEmpLogin";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@EmpID", SqlDbType.Int))
                       .Value = EmpID;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmpRoleListById");
            }

            return ds;
        }





        public DataSet PIP_CurrentlyPIPStatusByEmployeeId(int ManagerId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "PIP_CurrentlyPIPStatusByEmployeeId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters
                        .Add(new SqlParameter("@ManagerId", SqlDbType.Int))
                       .Value = ManagerId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                ds.Tables[1].TableName = "PIPData";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "PIP_CurrentlyPIPStatusByEmployeeId");
            }

            return ds;
        }


        public PIPEmpListDetail Get(int SelectedEmpId)
        {
            PIPEmpListDetail query = context.Set<PIPEmpListDetail>().SingleOrDefault(x => x.PEPEmployeeId == SelectedEmpId && x.PIPStatus != 10 && x.PIPStatus != 11);
            return query != null ? query : new PIPEmpListDetail();
        }

        public PIPEmpListDetail GetPIPDetails(int PIPId)
        {
            PIPEmpListDetail query = context.Set<PIPEmpListDetail>().SingleOrDefault(x => x.PIPId == PIPId);
            return query != null ? query : new PIPEmpListDetail();
        }

        public tblPIPEmployeeParameterDetail GetPIPIssueDetails(int Paramid)
        {
            tblPIPEmployeeParameterDetail query = context.Set<tblPIPEmployeeParameterDetail>().SingleOrDefault(x => x.ParameterId == Paramid);
            return query != null ? query : new tblPIPEmployeeParameterDetail();
        }


        public int Update(PIPEmpListDetail obj)
        {
            context.Set<PIPEmpListDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }


        public int UpdateFeedback(PIP_PeriodWeekEmpMappingMaster obj)
        {
            context.Set<PIP_PeriodWeekEmpMappingMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? 1 : 0;
        }
        public PIP_PeriodWeekEmpMappingMaster GetFeedbackRowByWeekId(int WeekId)
        {
            PIP_PeriodWeekEmpMappingMaster query = context.Set<PIP_PeriodWeekEmpMappingMaster>().SingleOrDefault(x => x.WeekId == WeekId);
            return query;

        }

        // feedback Section End

        public int Delete(tblPIPEmployeeParameterDetail obj)
        {
            context.Set<tblPIPEmployeeParameterDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Deleted;
            return context.SaveChanges() > 0 ? 1 : 0;
        }

        public int Insert(PIPEmpListDetail obj)
        {
            PIPEmpListDetail PIPEmpListDetail = context.Set<PIPEmpListDetail>().Add(obj);
            int result = context.SaveChanges();
            if (result > 0) //modified by Janice 10Apr2017
                return PIPEmpListDetail.PIPId;
            else
                return 0;
        }




        public PIPEmpListDetail GetPIPDetail(int PIPId)
        {
            PIPEmpListDetail query = context.Set<PIPEmpListDetail>().SingleOrDefault(x => x.PIPId == PIPId);
            return query != null ? query : new PIPEmpListDetail();
        }



        #region  IDiosposable
        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;
        }

        #endregion
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }




    }
}
