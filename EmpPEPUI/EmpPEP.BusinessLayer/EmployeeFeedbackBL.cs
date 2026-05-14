using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Framework.Helper;
using EmpPEP.BusinessEntities;
using EmpPEP.Repository.UnitOfWorks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.SqlClient;
using System.Data;
using EmpPEP.Framework.Log4Net;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.common;

namespace EmpPEP.BusinessLayer
{
    public class EmployeeFeedbackBL
    {
        #region "Public Methods"

        public EmployeeFeedbackEntity Get(int Id)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                var employeeFeedback = employeeFeedBackRepository.Get(Id);

                if (employeeFeedback != null)
                {
                    EmployeeFeedbackEntity employeeFeedbackEntity = new EmployeeFeedbackEntity();
                    return (EmployeeFeedbackEntity)Utility.ConvertToObject(employeeFeedback, employeeFeedbackEntity);
                }
                return null;
            }
        }

        //public List<GetEmployeeFeedback_ResultEntity> Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
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

        //    sqlParam = new SqlParameter("@ParentFeedBackId", ParentFeedBackId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@AreaId", AreaID);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetEmployeeFeedback_Result> getEmployeeFeedback_Result = employeeFeedBackRepository.GetEmployeeFeedback("EXEC dbo.[GetEmployeeFeedback] @AppraisalCycleId, @ToEmployeeId,@FromEmployeeId,@ActionTypeId,@ParentFeedBackId,@AreaId", parameters).ToList<GetEmployeeFeedback_Result>(); ;
        //        return Utility.ConvertToList<GetEmployeeFeedback_Result, GetEmployeeFeedback_ResultEntity>(getEmployeeFeedback_Result);
        //    }
        //}
        //Modified by Garima for History of feedback 11-19-2018

        public DataSet Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        {
            DataSet dataDs;
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                dataDs = employeeFeedBackRepository.GetEmployeeFeedback(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, ParentFeedBackId, AreaID);
            }

            return dataDs;
        }
        public DataSet Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID, int SelectedYear)
        {
            DataSet dataDs;
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                dataDs = employeeFeedBackRepository.GetEmployeeFeedback(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, ParentFeedBackId, AreaID, SelectedYear);
            }

            return dataDs;
        }

        //public List<GetEmployeeFeedback_ResultEntity> Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID, int SelectedYear)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
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

        //    sqlParam = new SqlParameter("@ParentFeedBackId", ParentFeedBackId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@AreaId", AreaID);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);
        //    sqlParam = new SqlParameter("@SelectedYear", SelectedYear);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetEmployeeFeedback_Result> getEmployeeFeedback_Result = employeeFeedBackRepository.GetEmployeeFeedback("EXEC dbo.[GetEmployeeFeedbackbyYear] @AppraisalCycleId, @ToEmployeeId,@FromEmployeeId,@ActionTypeId,@ParentFeedBackId,@AreaId,@SelectedYear", parameters).ToList<GetEmployeeFeedback_Result>(); ;
        //        return Utility.ConvertToList<GetEmployeeFeedback_Result, GetEmployeeFeedback_ResultEntity>(getEmployeeFeedback_Result);
        //    }
        //}

        //public List<GetEmployeeFeedbackGivenBYPeer_ResultEntity> Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
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
        //    using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetEmployeeFeedbackGivenBYPeer_Result> getEmployeeFeedbackGivenBYPeer_Result = employeeFeedBackRepository.GetEmployeeFeedbackGivenBYPeer("EXEC [GetEmployeeFeedbackGivenBYPeer]  @AppraisalCycleId, @ToEmployeeId,@FromEmployeeId,@ActionTypeId", parameters).ToList<GetEmployeeFeedbackGivenBYPeer_Result>(); ;
        //        return Utility.ConvertToList<GetEmployeeFeedbackGivenBYPeer_Result, GetEmployeeFeedbackGivenBYPeer_ResultEntity>(getEmployeeFeedbackGivenBYPeer_Result);
        //    }
        //}

        public DataSet Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId)
        {
            DataSet dataDs;
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                dataDs = employeeFeedBackRepository.GetEmployeeFeedbackGivenBYPeer(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId);
            }

            return dataDs;
        }

        //public List<GetEmployeeFeedbackGivenBYPeer_ResultEntity> Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int SelectedYear)
        //{
        //    #region "Parameter"
        //    List<SqlParameter> parameterList = new List<SqlParameter>();
        //    SqlParameter sqlParam;
        //    sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
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
        //    sqlParam = new SqlParameter("@SelectedYear", SelectedYear);
        //    sqlParam.SqlDbType = SqlDbType.Int;
        //    sqlParam.Direction = ParameterDirection.Input;
        //    parameterList.Add(sqlParam);

        //    #endregion
        //    using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
        //    {
        //        SqlParameter[] parameters = parameterList.ToArray();

        //        List<GetEmployeeFeedbackGivenBYPeer_Result> getEmployeeFeedbackGivenBYPeer_Result = employeeFeedBackRepository.GetEmployeeFeedbackGivenBYPeer("EXEC [GetEmployeeFeedbackGivenBYPeerbyYear]  @AppraisalCycleId, @ToEmployeeId,@FromEmployeeId,@ActionTypeId,@SelectedYear", parameters).ToList<GetEmployeeFeedbackGivenBYPeer_Result>(); ;
        //        return Utility.ConvertToList<GetEmployeeFeedbackGivenBYPeer_Result, GetEmployeeFeedbackGivenBYPeer_ResultEntity>(getEmployeeFeedbackGivenBYPeer_Result);
        //    }
        //}
        public DataSet Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int SelectedYear)
        {
            DataSet dataDs;
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                dataDs = employeeFeedBackRepository.GetEmployeeFeedbackGivenBYPeer(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, SelectedYear);
            }

            return dataDs;
        }

        public bool Insert(List<EmployeeFeedbackEntity> lstemployeeFeedbackEntity)
        {
            bool result = false;
            int Id = 0;
            EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
            foreach (var employeeFeedbackEntity in lstemployeeFeedbackEntity)
            {
                employeeFeedbackEntity.FeedbackDate = DateTime.Now;
                employeeFeedbackEntity.IsSeen = 0;
                Id = Insert(employeeFeedbackEntity);
                if (Id > 0)
                { result = true; }
            }
            return result;
        }

        /// <summary>
        /// Insert Manager Feedback using stored procedure with automatic goal snapshot storage
        /// The stored procedure (sp_PEP_ManagerFeedback_Insert) automatically retrieves and stores goal snapshot
        /// </summary>
        public int Insert(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeFeedBack employeeFeedBack = new EmployeeFeedBack();
                employeeFeedBack = (EmployeeFeedBack)Utility.ConvertToObject(employeeFeedbackEntity, employeeFeedBack);
                employeeFeedBack.CreatedBy = employeeFeedBack.FromEmployeeId;
                employeeFeedBack.CreatedOn = DateTime.Now;

                // Note: Goal snapshot is automatically retrieved and stored by sp_PEP_ManagerFeedback_Insert
                // No need to manually fetch goal data here - stored procedure handles it on every save

                int result = employeeFeedBackRepository.Insert(employeeFeedBack);
                if ((employeeFeedBack.ParentFeedBackId == null || employeeFeedBack.ParentFeedBackId == 0))
                {
                    employeeFeedbackEntity.FeedBackId = result;
                    employeeFeedbackEntity.ParentFeedBackId = result;
                    employeeFeedbackEntity.Sequence = 1;
                    UpdateParentId(employeeFeedbackEntity);
                }
                return result;
            }
        }


        public bool UpdateParentId(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBack employeeFeedBack = employeeFeedBackRepository.Get(employeeFeedbackEntity.FeedBackId);

                employeeFeedBack.ParentFeedBackId = employeeFeedbackEntity.ParentFeedBackId;
                employeeFeedBack.Sequence = employeeFeedbackEntity.Sequence;
                employeeFeedBack.ModifiedOn = DateTime.Now;

                return employeeFeedBackRepository.Update(employeeFeedBack);
            }

        }
        public bool UpdateParentIdAsDraft(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBackAsDraft employeeFeedBack = employeeFeedBackRepository.GetDraftFeedback(employeeFeedbackEntity.FeedBackId);

                employeeFeedBack.ParentFeedBackId = employeeFeedbackEntity.ParentFeedBackId;
                employeeFeedBack.Sequence = employeeFeedbackEntity.Sequence;
                employeeFeedBack.Feedback = employeeFeedbackEntity.Feedback;
                employeeFeedBack.ModifiedOn = DateTime.Now;

                return employeeFeedBackRepository.UpdateDraftFeedback(employeeFeedBack);
            }

        }
        public bool InsertAsDraft(List<EmployeeFeedbackEntity> lstemployeeFeedbackEntity)
        {
            bool result = false;
            int Id = 0;
            EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
            foreach (var employeeFeedbackEntity in lstemployeeFeedbackEntity)
            {
                employeeFeedbackEntity.FeedbackDate = DateTime.Now;
                employeeFeedbackEntity.IsSeen = 0;
                Id = InsertAsDraft(employeeFeedbackEntity);
                if (Id > 0)
                { result = true; }
            }
            return result;
        }
        /// <summary>
        /// Insert Manager Feedback Draft using stored procedure with automatic goal snapshot storage
        /// The stored procedure (sp_SaveManagerFeedbackDraft) automatically retrieves and stores goal snapshot
        /// </summary>
        public int InsertAsDraft(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeFeedBackAsDraft employeeFeedBack = new EmployeeFeedBackAsDraft();
                employeeFeedBack = (EmployeeFeedBackAsDraft)Utility.ConvertToObject(employeeFeedbackEntity, employeeFeedBack);
                employeeFeedBack.CreatedBy = employeeFeedBack.FromEmployeeId;
                employeeFeedBack.CreatedOn = DateTime.Now;

                // Note: Goal snapshot is automatically retrieved and stored by sp_SaveManagerFeedbackDraft
                // No need to manually fetch goal data here - stored procedure handles it on every save

                int result = 0;
                if (employeeFeedBack.FeedBackId > 0)
                {
                    bool result1 = UpdateParentIdAsDraft(employeeFeedbackEntity);

                    if (result1 == true)
                    {
                        result = 1;
                    }
                }
                else
                {
                    result = employeeFeedBackRepository.InsertAsDraft(employeeFeedBack);

                }
                //int result = employeeFeedBackRepository.InsertAsDraft(employeeFeedBack);
                //if ((employeeFeedBack.ParentFeedBackId == null || employeeFeedBack.ParentFeedBackId == 0))
                //{
                //    employeeFeedbackEntity.FeedBackId = result;
                //    employeeFeedbackEntity.ParentFeedBackId = result;
                //    employeeFeedbackEntity.Sequence = 1;
                //    UpdateParentIdAsDraft(employeeFeedbackEntity);
                //}
                return result;
            }
        }
        public bool Update(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBack employeeFeedBack = employeeFeedBackRepository.Get(employeeFeedbackEntity.FeedBackId);
                //changed by kinjal as it should return only one object

                // int companyID = employeeMasterRepository.GetEmployeeDetails(employeeFeedbackEntity.FromEmployeeId).FirstOrDefault().CompanyId;
                int companyID = Convert.ToInt32(employeeMasterRepository.GetEmployeeDetails(employeeFeedbackEntity.FromEmployeeId).Tables[0].Rows[0]["CompanyId"]);

                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                int AppraiscalCycleId = appraisalCycleBL.GetCurrent(companyID).AppraisalCycleId;


                bool IsCurrentManager = employeeMasterRepository.IsMyManager(employeeFeedbackEntity.ToEmployeeId, employeeFeedbackEntity.FromEmployeeId, AppraiscalCycleId);

                if (IsCurrentManager)
                {
                    employeeFeedBack.AreaID = employeeFeedbackEntity.AreaID;
                    employeeFeedBack.Rating = employeeFeedbackEntity.Rating;
                    employeeFeedBack.GradeAreaQuestionMappingID = employeeFeedbackEntity.GradeAreaQuestionMappingID;
                    employeeFeedBack.QuestionaireId = employeeFeedbackEntity.QuestionaireId;
                }

                employeeFeedBack.ActionTypeId = employeeFeedbackEntity.FeedBackId;
                employeeFeedBack.Feedback = employeeFeedbackEntity.Feedback;
                employeeFeedBack.ToEmployeeId = employeeFeedbackEntity.ToEmployeeId;
                employeeFeedBack.FromEmployeeId = employeeFeedbackEntity.FromEmployeeId;
                employeeFeedBack.ModifiedOn = DateTime.Now;
                employeeFeedBack.ModifiedBy = employeeFeedBack.FromEmployeeId;

                return employeeFeedBackRepository.Update(employeeFeedBack);
            }

        }

        //Created by : kaushal kumar saini(108384)
        //Create Date :5 August 2019 
        public bool UpdateKRAFeedbackByManager(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBack employeeFeedBack = employeeFeedBackRepository.Get(employeeFeedbackEntity.FeedBackId);
                int companyID = Convert.ToInt32(employeeMasterRepository.GetEmployeeDetails(employeeFeedbackEntity.FromEmployeeId).Tables[0].Rows[0]["CompanyId"]);

                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                int AppraiscalCycleId = appraisalCycleBL.GetCurrent(companyID).AppraisalCycleId;


                bool IsCurrentManager = employeeMasterRepository.IsMyManager(employeeFeedbackEntity.ToEmployeeId, employeeFeedbackEntity.FromEmployeeId, AppraiscalCycleId);

                if (IsCurrentManager)
                {
                    employeeFeedBack.AreaID = employeeFeedbackEntity.AreaID;
                    employeeFeedBack.QuestionaireId = employeeFeedbackEntity.QuestionaireId;
                }

                employeeFeedBack.ActionTypeId = employeeFeedbackEntity.ActionTypeId;
                employeeFeedBack.FeedBackId = employeeFeedbackEntity.FeedBackId;
                employeeFeedBack.Feedback = employeeFeedbackEntity.Feedback;
                employeeFeedBack.ToEmployeeId = employeeFeedbackEntity.ToEmployeeId;
                employeeFeedBack.FromEmployeeId = employeeFeedbackEntity.FromEmployeeId;
                employeeFeedBack.IsIgnore = employeeFeedbackEntity.IsIgnore;
                employeeFeedBack.ModifiedOn = DateTime.Now;
                employeeFeedBack.ModifiedBy = employeeFeedBack.FromEmployeeId;

                // Note: Goal snapshot is automatically retrieved and stored by sp_PEP_ManagerFeedback_Update
                // No need to manually fetch goal data here - stored procedure handles it on every save

                return employeeFeedBackRepository.Update(employeeFeedBack);
            }

        }
        //Created by : kaushal kumar saini(108384)
        //Create Date :5 August 2019 
        public bool DeleteDraftFeedback(int ToEmployeeId, int? AreaID, string PerformCycleCheck)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBackAsDraft EmployeeFeedBackAsDraft = new EmployeeFeedBackAsDraft();
                EmployeeFeedBackAsDraft.ToEmployeeId = ToEmployeeId;
                EmployeeFeedBackAsDraft.AreaID = AreaID;
                EmployeeFeedBackAsDraft.PerformCycleCheck = PerformCycleCheck;
                return employeeFeedBackRepository.DraftDelete(EmployeeFeedBackAsDraft);
            }

        }
        public bool UpdateIgnore(int FeedbackId, int UserId)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                EmployeeMasterRepository employeeMasterRepository = new EmployeeMasterRepository();
                EmployeeFeedBack employeeFeedBack = employeeFeedBackRepository.Get(FeedbackId);

                employeeFeedBack.IsIgnore = true;
                employeeFeedBack.ModifiedOn = DateTime.Now;
                employeeFeedBack.ModifiedBy = UserId;

                return employeeFeedBackRepository.Update(employeeFeedBack);
            }

        }

        public bool UpdateIsSeen(int FeedbackId, int ParentId, int UserId)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                employeeFeedBackRepository.MarkThreadAsSeen(ParentId, UserId);
                return true;
            }
        }
        public DateTime? Get(int EmployeeId, int AppraisalCycleId)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                return employeeFeedBackRepository.Get(EmployeeId, AppraisalCycleId);
            }
        }

        public List<ValidationsEntity> Validations(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            ValidationHelper helper = new ValidationHelper();
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();

            if (employeeFeedbackEntity.Feedback == "")
            {
                validationsEntity.Add(helper.CreateValidation("Feedback", employeeFeedbackEntity.Feedback, "Feedback can not be blank."));
            }
            if (employeeFeedbackEntity.Feedback.Contains("<") || employeeFeedbackEntity.Feedback.Contains(">") || employeeFeedbackEntity.Feedback.Contains("'") || employeeFeedbackEntity.Feedback.Contains("="))
            {
                validationsEntity.Add(helper.CreateValidation("Feedback", employeeFeedbackEntity.Feedback, "Please enter valid text.<, >,',= are not allowed."));
            }
            return validationsEntity;
        }

        public List<ValidationsEntity> ManagerValidations(EmployeeFeedbackEntity employeeFeedbackEntity)
        {
            ValidationHelper helper = new ValidationHelper();
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();

            if (employeeFeedbackEntity.Feedback == "")
            {
                validationsEntity.Add(helper.CreateValidation("Feedback", employeeFeedbackEntity.Feedback, "Feedback can not be blank."));
            }
            else
            if (employeeFeedbackEntity.Rating > 5 || employeeFeedbackEntity.Rating < 1)
            {
                validationsEntity.Add(helper.CreateValidation("Feedback", employeeFeedbackEntity.Rating.ToString(), "Rating must fall in the range of 1-5"));
            }
            else
             if (employeeFeedbackEntity.Feedback.Contains("<") || employeeFeedbackEntity.Feedback.Contains(">") || employeeFeedbackEntity.Feedback.Contains("'") || employeeFeedbackEntity.Feedback.Contains("="))
            {
                validationsEntity.Add(helper.CreateValidation("Feedback", employeeFeedbackEntity.Feedback, "Please enter valid text.<, >,' are not allowed."));
            }
            return validationsEntity;
        }

        //public List<EmployeeFeedbackEntity> GetFeedback(int Id)
        //{
        //    using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
        //    {
        //        var employeeFeedback = employeeFeedBackRepository.GetFeedback(Id);

        //        if (employeeFeedback != null)
        //        {
        //            List<EmployeeFeedbackEntity> employeeFeedbackEntity = new List<EmployeeFeedbackEntity>();
        //            return Utility.ConvertToList<EmployeeFeedBack, EmployeeFeedbackEntity>(employeeFeedback);
        //        }
        //        return null;
        //    }
        //}
        public DataSet GetFeedback(int Id)
        {
            DataSet dataDs;
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                dataDs = employeeFeedBackRepository.GetFeedback(Id);
            }

            return dataDs;
        }

        public int GetFeedbackLimit()
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                return employeeFeedBackRepository.GetFeedbackLimit();
            }
        }


        #endregion

        //By Sourabh
        #region Previous RM Feedback
        public List<GetEmployeeByKRAStatusEntity> GetPreviousRM(int EmployeeId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@EmployeeId", EmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetPreviousRM_Result> getPreviousRM_Result = employeeFeedBackRepository.GetPreviousRM("EXEC [GetPreviousRM] @EmployeeId", parameters).ToList<GetPreviousRM_Result>(); ;
                return Utility.ConvertToList<GetPreviousRM_Result, GetEmployeeByKRAStatusEntity>(getPreviousRM_Result);
            }
        }
        public List<GetEmployeeFeedback_ResultEntity> GetPreviousRMFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ParentFeedBackId", ParentFeedBackId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AreaId", AreaID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetPreviousRMFeedback_Result> getPreviousRM_Result = employeeFeedBackRepository.GetPreviousRMFeedback("EXEC [GetPreviousRMFeedback] @AppraisalCycleId,@ToEmployeeId,@FromEmployeeId,@ActionTypeId,@ParentFeedBackId,@AreaId", parameters).ToList<GetPreviousRMFeedback_Result>(); ;
                return Utility.ConvertToList<GetPreviousRMFeedback_Result, GetEmployeeFeedback_ResultEntity>(getPreviousRM_Result);
            }
        }

        #endregion



        //By Garima 26-10-2018
        #region Delegator Feedback
        public List<GetEmployeeByKRAStatusEntity> GetDelegators(int EmployeeId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@EmployeeId", EmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDelegator_Result> getPreviousRM_Result = employeeFeedBackRepository.GetDelegator("EXEC [GetDelegator] @EmployeeId", parameters).ToList<GetDelegator_Result>(); ;
                return Utility.ConvertToList<GetDelegator_Result, GetEmployeeByKRAStatusEntity>(getPreviousRM_Result);
            }
        }


        public List<GetEmployeeByKRAStatusEntity> GetEmployees(int EmployeeId, int ManagerId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@EmployeeId", EmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@ManagerId", ManagerId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeesByDelegator_Result> getPreviousRM_Result = employeeFeedBackRepository.GetEmployees("EXEC [GetEmployeesByDelegator] @EmployeeId, @ManagerId", parameters).ToList<GetEmployeesByDelegator_Result>(); ;
                return Utility.ConvertToList<GetEmployeesByDelegator_Result, GetEmployeeByKRAStatusEntity>(getPreviousRM_Result);
            }
        }

        public List<GetEmployeeFeedback_ResultEntity> GetDelegatorFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int AreaID)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@FromEmployeeId", FromEmployeeId > 0 ? FromEmployeeId : (object)DBNull.Value);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@ActionTypeId", ActionTypeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);



            sqlParam = new SqlParameter("@AreaId", AreaID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDelegatorFeedback_Result> getPreviousRM_Result = employeeFeedBackRepository.GetDelegatorFeedback("EXEC [GetDelegatorFeedback] @AppraisalCycleId,@ToEmployeeId,@FromEmployeeId,@ActionTypeId,@AreaId", parameters).ToList<GetDelegatorFeedback_Result>(); ;
                return Utility.ConvertToList<GetDelegatorFeedback_Result, GetEmployeeFeedback_ResultEntity>(getPreviousRM_Result);
            }
        }

        #endregion

        #region Save Draft and Submit Feedback Methods

        /// <summary>
        /// Save draft feedback with goal metadata using stored procedure
        /// </summary>
        public bool SaveDraft(int toEmployeeId, int fromEmployeeId, int appraisalCycleId, int questionaireId, 
            string feedback, string performCycleCheck, int areaId = 2, string trainingItemId = null, 
            string trainingRequirementName = null, string trainingCategory = null)
        {
            try
            {
                using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
                {
                    int feedBackId = employeeFeedBackRepository.SaveDraft(
                        toEmployeeId,
                        fromEmployeeId,
                        appraisalCycleId,
                        questionaireId,
                        feedback,
                        performCycleCheck,
                        areaId,
                        trainingItemId,
                        trainingRequirementName,
                        trainingCategory
                    );
                    
                    return feedBackId > 0;
                }
            }
            catch (Exception ex)
            {
                // Log exception (ExceptionLogging is internal to Repository, so we just throw)
                throw new Exception("Error saving draft feedback: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Get all draft feedbacks for an employee and cycle using stored procedure
        /// </summary>
        public DataSet GetDraftFeedbacks(int toEmployeeId, string performCycleCheck, int areaId = 2)
        {
            using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
            {
                return employeeFeedBackRepository.GetDraftFeedbacksByEmployeeCycle(toEmployeeId, performCycleCheck, areaId);
            }
        }

        /// <summary>
        /// Submit all draft feedbacks - move to final EmployeeFeedback table using stored procedure
        /// </summary>
        public bool SubmitFeedback(int toEmployeeId, int fromEmployeeId, int appraisalCycleId, string performCycleCheck, out string message, int areaId = 2)
        {
            try
            {
                bool success;
                using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
                {
                    success = employeeFeedBackRepository.SubmitFeedback(
                        toEmployeeId,
                        fromEmployeeId,
                        appraisalCycleId,
                        performCycleCheck,
                        areaId,
                        out message
                    );
                }

                if (success)
                {
                    ProcessTrainingRequestsAfterFeedbackSubmit(toEmployeeId, appraisalCycleId, fromEmployeeId, performCycleCheck, areaId);
                }

                return success;
            }
            catch (Exception ex)
            {
                message = "Error submitting feedback: " + ex.Message;
                return false;
            }
        }

        /// <summary>
        /// After feedback submit, call external training API for developmental goals
        /// that have training requirements (same pattern as ApproveEmployeeKRA).
        /// </summary>
        private void ProcessTrainingRequestsAfterFeedbackSubmit(int employeeId, int appraisalCycleId, int managerId, string performCycleCheck, int areaId)
        {
            ILogService logService = new FileLogService(typeof(EmployeeFeedbackBL));
            string section = "EmployeeFeedbackBL";
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
                {
                    // Trainings saved on EmployeeFeedBack rows (manager recommendations only), not EmployeeKRA goal-setting fields
                    var krasWithTraining = employeeFeedBackRepository.GetSubmittedManagerFeedbackTrainingsForCycle(
                        employeeId, managerId, appraisalCycleId, performCycleCheck, areaId);
                    if (krasWithTraining == null || krasWithTraining.Count == 0)
                    {
                        logService.Info(section, "ProcessTrainingRequestsAfterFeedbackSubmit",
                            $"No manager-feedback training rows for EmployeeId: {employeeId}, AppraisalCycleId: {appraisalCycleId}");
                        return;
                    }

                    string employeeCode = employeeKRARepository.GetEmployeeCode(employeeId);
                    if (string.IsNullOrEmpty(employeeCode))
                    {
                        logService.Fatal(section, "ProcessTrainingRequestsAfterFeedbackSubmit",
                            $"OldEmployeeCode not found for EmployeeId: {employeeId}");
                        return;
                    }

                    var regularTrainingTypes = new List<string>();
                    var regularTrainingIds = new List<string>();
                    var regularKRAIds = new List<int>();
                    var customCourseNames = new List<string>();
                    var customCourseCategories = new List<string>();
                    var customKRAIds = new List<int>();

                    using (var trainingRepository = new TrainingRepository())
                    {
                        foreach (var kra in krasWithTraining)
                        {
                            if (string.IsNullOrEmpty(kra.TrainingItemId) || string.IsNullOrEmpty(kra.TrainingRequirementName))
                                continue;

                            // Split by ||| only — no comma fallback since training names may contain commas
                            string[] trainingIds = kra.TrainingItemId.Contains("|||")
                                ? kra.TrainingItemId.Split(new[] { "|||" }, StringSplitOptions.RemoveEmptyEntries)
                                : new[] { kra.TrainingItemId.Trim() };

                            string[] trainingNames = kra.TrainingRequirementName.Contains("|||")
                                ? kra.TrainingRequirementName.Split(new[] { "|||" }, StringSplitOptions.RemoveEmptyEntries)
                                : new[] { kra.TrainingRequirementName.Trim() };

                            string[] trainingCategories = null;
                            if (!string.IsNullOrEmpty(kra.TrainingCategory))
                            {
                                trainingCategories = kra.TrainingCategory.Contains("|||")
                                    ? kra.TrainingCategory.Split(new[] { "|||" }, StringSplitOptions.RemoveEmptyEntries)
                                    : new[] { kra.TrainingCategory.Trim() };
                            }

                            int minLength = Math.Min(trainingIds.Length, trainingNames.Length);
                            for (int i = 0; i < minLength; i++)
                            {
                                string trainingIdStr = trainingIds[i].Trim();
                                string trainingName = trainingNames[i].Trim();
                                if (!int.TryParse(trainingIdStr, out int trainingId)) continue;

                                if (trainingId == 0)
                                {
                                    string categoryName = trainingName;
                                    string courseName = trainingName;
                                    if (trainingCategories != null && i < trainingCategories.Length && !string.IsNullOrEmpty(trainingCategories[i].Trim()))
                                        categoryName = trainingCategories[i].Trim();
                                    if (trainingName.Contains(":"))
                                    {
                                        var parts = trainingName.Split(new[] { ':' }, 2);
                                        if (parts.Length == 2)
                                        {
                                            if (trainingCategories == null || i >= trainingCategories.Length || string.IsNullOrEmpty(trainingCategories[i].Trim()))
                                                categoryName = parts[0].Trim();
                                            courseName = parts[1].Trim();
                                        }
                                    }
                                    customCourseNames.Add(courseName);
                                    customCourseCategories.Add(categoryName);
                                    customKRAIds.Add(kra.KRAId);
                                }
                                else
                                {
                                    string trainingType = trainingRepository.GetTrainingTypeByTrainingId(trainingId);
                                    if (!string.IsNullOrEmpty(trainingType))
                                    {
                                        regularTrainingTypes.Add(trainingType.ToLower());
                                        regularTrainingIds.Add(trainingId.ToString());
                                        regularKRAIds.Add(kra.KRAId);
                                    }
                                }
                            }
                        }
                    }

                    var trainingService = new TrainingRequestService();

                    if (regularTrainingTypes.Count > 0 && regularTrainingIds.Count > 0)
                    {
                        try
                        {
                            string batchTypes = string.Join(",", regularTrainingTypes);
                            string batchIds = string.Join(",", regularTrainingIds);
                            logService.Info(section, "ProcessTrainingRequestsAfterFeedbackSubmit",
                                $"Calling batch API: training_type={batchTypes}, training_id={batchIds}, emp_id={employeeCode}");
                            var apiResponse = trainingService.CreateBatchTrainingRequest(batchTypes, batchIds, employeeCode);

                            foreach (int kraId in regularKRAIds.Distinct())
                            {
                                employeeKRARepository.SaveTrainingRequestTracking(
                                    kraId, employeeId, employeeCode, 0,
                                    $"feedback_batch:{batchTypes}:{batchIds}",
                                    apiResponse, managerId);
                            }
                        }
                        catch (Exception ex)
                        {
                            logService.Fatal(section, "ProcessTrainingRequestsAfterFeedbackSubmit-RegularBatch", ex.Message);
                        }
                    }

                    if (customCourseNames.Count > 0 && customCourseCategories.Count > 0)
                    {
                        try
                        {
                            string batchNames = string.Join(",", customCourseNames);
                            string batchCategories = string.Join(",", customCourseCategories);
                            logService.Info(section, "ProcessTrainingRequestsAfterFeedbackSubmit",
                                $"Calling custom batch API: course_name={batchNames}, course_category={batchCategories}, emp_id={employeeCode}");
                            var apiResponse = trainingService.CreateBatchCustomTrainingRequest(batchNames, batchCategories, employeeCode);

                            foreach (int kraId in customKRAIds.Distinct())
                            {
                                employeeKRARepository.SaveTrainingRequestTracking(
                                    kraId, employeeId, employeeCode, 0,
                                    $"feedback_custom_batch:{batchNames}:{batchCategories}",
                                    apiResponse, managerId);
                            }
                        }
                        catch (Exception ex)
                        {
                            logService.Fatal(section, "ProcessTrainingRequestsAfterFeedbackSubmit-CustomBatch", ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logService.Fatal(section, "ProcessTrainingRequestsAfterFeedbackSubmit", $"Error: {ex.Message}");
            }
        }

        #endregion
    }
}
