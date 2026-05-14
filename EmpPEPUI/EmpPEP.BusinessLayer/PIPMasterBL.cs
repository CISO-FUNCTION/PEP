using System;
using System.Collections.Generic;
using System.Linq;
using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using EmpPEP.BusinessEntity;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using EmpPEP.Framework.Log4Net.Helper;
using static EmpPEP.Framework.Helper.EnumCollection;

namespace EmpPEP.BusinessLayer
{

    public class PIPMasterBL
    {

        //public DataSet  GetEmployeesByRM(int RMID)
        //{
        //    using (var repository = new EmployeeMasterRepository())
        //    {

        //        var mgrList = repository.GetEmployeesByRM(RMID);
        //        if (mgrList.Any())
        //        {
        //            return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.EmployeeMasterRepository.Employees, ManagerEntity>(mgrList);
        //        }
        //        return null;
        //    }

        //}
        public DataSet GetPIPEmployeesByRM(int RMID) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetPIPEmployeesByRM(RMID);
            }
            return dataDs;

        }

        public DataSet GetPIPEmployeeDetailsBySelectEmpID(int SEmpId) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetPIPEmployeeDetailsBySelectEmpID(SEmpId);
            }
            return dataDs;

        }

        public DataSet GetPIPEmployeeDetailsByRoleId(int LoginId, int RoleId, int FilterId) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetPIPEmployeeDetailsByRoleId(LoginId, RoleId, FilterId);
            }
            return dataDs;

        }

        public DataSet PIP_GetEmployeeSavedParameterDetailsByPIPId(int PIPId, int SEmpID) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetEmployeeSavedParameterDetailsByPIPId(PIPId, SEmpID);
            }
            return dataDs;

        }


        public DataSet PIP_GetEmployeeAllPIPDetailsByEmpID(int SEmpID) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetEmployeeAllPIPDetailsByEmpID(SEmpID);
            }
            return dataDs;

        }


        public DataSet GetActionHistory(int PIPId) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetActionHistory(PIPId);
            }
            return dataDs;

        }

        public DataSet PIP_GetFeedbackByParamId(int ParameterId) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetFeedbackByParamId(ParameterId);
            }
            return dataDs;

        }
        public DataSet PIP_GetParamterDetailByParamId(int PIPId, int WeekNo) //added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetParamterDetailByParamId(PIPId, WeekNo);
            }
            return dataDs;

        }

        public DataSet GetPIPEndateExceptHoliday_Weekends(int PIPId, DateTime PIPEndDate)//added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetPIPEndateExceptHoliday_Weekends(PIPId, PIPEndDate);
            }
            return dataDs;

        }
        public DataSet PIP_GetEligibleExtension(int PIPId)//added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetEligibleExtension(PIPId);
            }
            return dataDs;

        }

        public DataSet PIP_GetPIPResultValues(int PIPId)//added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetPIPResultValues(PIPId);
            }
            return dataDs;

        }



        public DataSet PIP_GetTotalWeeksForFeedback(int ParameterId)//added for kaushal saini on 2 April 2024
        {

            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetTotalWeeksForFeedback(ParameterId);
            }
            return dataDs;

        }


        public DataSet PIP_GetEmployeeSavedParameterDetasByParamId(int ParameterId) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {

                dataDs = PIPRepository.PIP_GetEmployeeSavedParameterDetasByParamId(ParameterId);
            }
            return dataDs;

        }




        public DataSet PIP_GetEmpSavedFeedbackDetByWeekId(int WeekId) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_GetEmployeeSavedParameterDetasByParamId(WeekId);
            }
            return dataDs;

        }


        public int SavePIPMeasurementAgainstEmployee(int ParamterId, int PIPId, int LoginEmpId, int SelectEmpID, string ProgressIssue, string Deliverables, string ProgressMeasuremnt, int CreatedBy)
        {

            int result;
            using (var PIPRepository = new PIPRepository())
            {


                result = PIPRepository.SavePIPMeasurementAgainstEmployee(ParamterId, PIPId, LoginEmpId, SelectEmpID, ProgressIssue, Deliverables, ProgressMeasuremnt, CreatedBy);


            }
            return result;

        }

        public int SendMailBasedOnStatus(int PIPId, int LoginEmpId, int SelectEmpID, int Action)
        {
            {

                int result;
                using (var PIPRepository = new PIPRepository())
                {


                    result = PIPRepository.SendMailBasedOnStatus(PIPId, LoginEmpId, SelectEmpID, Action);

                }
                return result;

            }
        }


        public int SendMailOnSubmitFeedback(int PIPId, int LoginEmpId, int WeekNo)
        {
            {

                int result;
                using (var PIPRepository = new PIPRepository())
                {


                    result = PIPRepository.SendMailOnSubmitFeedback(PIPId, LoginEmpId, WeekNo);

                }
                return result;

            }
        }




        public bool Update(AddPIPWeeklyFeedback lstemployeeFeedbackEntity)
        {
            bool result = false;
            int Id = 0;
            PIPRepository employeeMasterRepository = new PIPRepository();
            foreach (var employeeFeedbackEntity in lstemployeeFeedbackEntity.FeedbackArray)
            {
                PIP_PeriodWeekEmpMappingMaster employeeFeedBack = employeeMasterRepository.GetFeedbackRowByWeekId(employeeFeedbackEntity.WeekId);

                employeeFeedBack.Feedback = employeeFeedbackEntity.Feedback;
                employeeFeedBack.Modifiedby = employeeFeedbackEntity.LogEmpId;
                employeeFeedBack.ModifiedOn = DateTime.Now;
                employeeFeedBack.Status = lstemployeeFeedbackEntity.Status;


                Id = employeeMasterRepository.UpdateFeedback(employeeFeedBack);
                if (Id > 0)
                { result = true; }
            }
            return result;
        }



        public int AddPIPWeeklyFeedback(int WeekId, int LoginEmpId, string Feedback)
        {

            int result;

            using (var PIPRepository = new PIPRepository())
            {


                result = PIPRepository.AddPIPWeeklyFeedback(WeekId, LoginEmpId, Feedback);

            }
            return result;

        }


        public DataSet GetEmpRoleListById(int EmpID) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.GetEmpRoleListById(EmpID);
            }
            return dataDs;

        }


        public DataSet PIP_CurrentlyPIPStatusByEmployeeId(int ManagerId) //added for kaushal saini on 2 April 2024
        {


            DataSet dataDs;
            using (var PIPRepository = new PIPRepository())
            {
                dataDs = PIPRepository.PIP_CurrentlyPIPStatusByEmployeeId(ManagerId);
            }
            return dataDs;

        }


        public int Post(int SelectedEmpId, int LoginEmpId, string UploadedDocs, int Action, string PIPReason)
        {
            using (var PIPRepository = new PIPRepository())
            {
                PIPEmpListDetail pipEmpListDetail = PIPRepository.Get(SelectedEmpId);

                if (pipEmpListDetail.PIPId > 0 && UploadedDocs == "")
                {
                    pipEmpListDetail.PIPStatus = Action;
                    pipEmpListDetail.ModifiedBy = LoginEmpId;
                    pipEmpListDetail.ModifiedOn = DateTime.Now;
                    pipEmpListDetail.PIPReason = PIPReason;

                    return PIPRepository.Update(pipEmpListDetail);
                }
                else if (pipEmpListDetail.PIPId > 0)
                {
                    pipEmpListDetail.PIPDocFiles = UploadedDocs;
                    pipEmpListDetail.ModifiedBy = LoginEmpId;
                    pipEmpListDetail.ModifiedOn = DateTime.Now;
                    pipEmpListDetail.PIPStatus = Action;
                    pipEmpListDetail.PIPReason = PIPReason;

                    return PIPRepository.Update(pipEmpListDetail);
                }
                else
                {
                    pipEmpListDetail.PEPEmployeeId = SelectedEmpId;
                    pipEmpListDetail.PIPDocFiles = UploadedDocs;
                    pipEmpListDetail.CreatedBy = LoginEmpId;
                    pipEmpListDetail.CreatedOn = DateTime.Now;
                    pipEmpListDetail.PIPStatus = Action;
                    pipEmpListDetail.PIPReason = PIPReason;
                    return PIPRepository.Insert(pipEmpListDetail);
                }

            }
        }

        public int PutActionbyHRBP(int LoginEmpId, int SelectedEmpId, int PIPId, int Action, string PIPRejectionReason)
        {
            int Result = 0;
            using (var PIPRepository = new PIPRepository())
            {
                PIPEmpListDetail pipEmpListDetail = PIPRepository.GetPIPDetails(PIPId);

                if (pipEmpListDetail.PIPId > 0)
                {
                    pipEmpListDetail.PIPStatus = Action;
                    pipEmpListDetail.PIPRejectionReason = PIPRejectionReason;
                    pipEmpListDetail.ModifiedOn = DateTime.Now;
                    pipEmpListDetail.ModifiedBy = LoginEmpId;

                    Result = PIPRepository.Update(pipEmpListDetail);
                }


            }
            return Result;
        }
        public int PIP_DeleteEmployeeSavedParamDetByParameterId(int ParamId)
        {
            int Result = 0;
            using (var PIPRepository = new PIPRepository())
            {
                tblPIPEmployeeParameterDetail paramDet = PIPRepository.GetPIPIssueDetails(ParamId);

                if (paramDet.ParameterId > 0)
                {
                    Result = PIPRepository.Delete(paramDet);
                }


            }
            return Result;
        }


        public int PutPIPDocApproveProcess(int LoginEmpId, int SelectEmpId, int PIPDuration, DateTime PIPDiscussionDate, DateTime PIPActualStartDate, int PIPId, int Action, int RoleId)
        {
            int result;

            using (var PIPRepository = new PIPRepository())
            {


                result = PIPRepository.PutPIPDocApproveProcess(LoginEmpId, SelectEmpId, PIPDuration, PIPDiscussionDate, PIPActualStartDate, PIPId, Action, RoleId);

            }
            return result;

        }



        public int Put(int LoginEmpId, int PIPId, int StatusId)
        {
            using (var employeePIPRepository = new PIPRepository())
            {
                PIPEmpListDetail employeePIP = employeePIPRepository.GetPIPDetail(PIPId);
                if ((employeePIP != null) && (employeePIP.PIPId > 0))
                {
                    employeePIP.PIPStatus = StatusId;
                    employeePIP.ModifiedBy = LoginEmpId;
                    employeePIP.ModifiedOn = DateTime.Now;
                    return employeePIPRepository.Update(employeePIP);

                }

                return 0;
            }
        }

        public int PIP_SubmitFinalResult(int PIPId, int PIPResultId, int PIPExtension, int PIPSubmitBy)
        {
            {

                int result;
                using (var PIPRepository = new PIPRepository())
                {


                    result = PIPRepository.PIP_SubmitFinalResult(PIPId, PIPResultId, PIPExtension, PIPSubmitBy);

                }
                return result;

            }
        }


        public int PIP_CheckMandatoryWeekFill(int PIPId, int WeekId)
        {

            int result;

            using (var PIPRepository = new PIPRepository())
            {


                result = PIPRepository.PIP_CheckMandatoryWeekFill(PIPId, WeekId);

            }
            return result;

        }


    }
}
