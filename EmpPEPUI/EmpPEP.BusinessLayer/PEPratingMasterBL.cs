using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class PEPratingMasterBL
    {

        public List<PEPEmployeeRatingEntity> GetRating()
        {
            List<PEPEmployeeRating> getAnnualsRating;
            // var getAnnualsRating = new List<PEPEmployeeRating>();
            using (var repository = new RatingRepository())
            {

                getAnnualsRating = repository.GetRating();
            }


            return Utility.ConvertToList<PEPEmployeeRating, PEPEmployeeRatingEntity>(getAnnualsRating);

        }


        public List<GetDataForDropdown_ResultEntity> GetDataForDropdown(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@LoginEmployeeId", LoginEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RoleId", RoleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);



            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDataForDropdown_ResultEntity> empList = repository.GetDataForDropdown("EXEC dbo.[GetDataForDropdown] @AppraisalCycleId, @LoginEmployeeId,@RoleId", parameters).ToList<GetDataForDropdown_ResultEntity>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetDataForDropdown_ResultEntity, GetDataForDropdown_ResultEntity>(empList);
                }
                return null;
            }

        }
        public List<PEPDataForGraph_ResultEntity> GetDataForChart(int EMPID, int AppraisalCycleId, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EmpId", EMPID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@IReportee", IReportee);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Promotion", Promotion);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RoleId", RoleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<PEPDataForGraph_ResultEntity> empList = repository.GetDataForChart("EXEC dbo.[GetDataForChart] @EmpId, @AppraisalCyleId, @IReportee, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @Promotion, @RoleId", parameters).ToList<PEPDataForGraph_ResultEntity>(); ;
                if (empList.Any())
                {
                    return Utility.ConvertToList<PEPDataForGraph_ResultEntity, PEPDataForGraph_ResultEntity>(empList);
                }
                return null;
            }

        }

        public List<PEPDataForGraph_ResultEntity> GetHRBPAdminDataForChart(int EMPID, int AppraisalCycleId, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus,string Promotion)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EmpId", EMPID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);



            sqlParam = new SqlParameter("@Promotion", Promotion);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<PEPDataForGraph_ResultEntity> empList = repository.GetHRBPadminDataForChart("EXEC dbo.[GetHRBPAdminDataForChart_local] @EmpId, @AppraisalCyleId, @GDLList,@DPList, @RMList, @GradeId, @LocationId, @GroupAccountId,@Gender,@EmpStatus, @Role,@DeliveryStatus, @Promotion", parameters).ToList<PEPDataForGraph_ResultEntity>(); ;
                if (empList.Any())
                {
                    return Utility.ConvertToList<PEPDataForGraph_ResultEntity, PEPDataForGraph_ResultEntity>(empList);
                }
                return null;
            }

        }

        public List<GetDataForChartForImmdediateReportee_ResultEntity> GetDataChartForImmediateReportee(int EMPID, int AppraisalCycleId, string IReportee, string GradeId, string LocationId, string GroupAccountId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EmpId", EMPID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@IReportee", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDataForChartForImmdediateReportee_ResultEntity> empList = repository.GetDataChartForImmediateReportee("EXEC dbo.[GetDataForChartForImmdediateReportee] @EmpId, @AppraisalCyleId,@IReportee, @GradeId, @LocationId, @GroupAccountId", parameters).ToList<GetDataForChartForImmdediateReportee_ResultEntity>(); ;
                if (empList.Any())
                {
                    return Utility.ConvertToList<GetDataForChartForImmdediateReportee_ResultEntity, GetDataForChartForImmdediateReportee_ResultEntity>(empList);
                }
                return null;
            }

        }


        public int Insert(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {

                int result = 0;

                EmployeeRatingNormailizationDetail ERND = ratingRepository.GetGivenRating(employeeFeedbackEntity.PEPEmployeeId, employeeFeedbackEntity.AppraisalCycleId);

                if (ERND.PEPEmployeeId != null)
                {
                    ERND.Rating = employeeFeedbackEntity.Rating;
                    ERND.Status = employeeFeedbackEntity.Status;
                    ERND.RecoForPromotion = employeeFeedbackEntity.RecoForPromotion;
                    ERND.RatingGivenBy = employeeFeedbackEntity.RatingGivenBy;
                    ERND.ModifiedBy = employeeFeedbackEntity.RatingGivenBy.ToString();
                    ERND.ModifiedOn = DateTime.Now;
                    result = ratingRepository.Update(ERND);

                }
                else
                {
                    EmployeeRatingNormailizationDetail employeeFeedBack = new EmployeeRatingNormailizationDetail();
                    employeeFeedBack = (EmployeeRatingNormailizationDetail)Utility.ConvertToObject(employeeFeedbackEntity, employeeFeedBack);
                    employeeFeedBack.CreatedBy = employeeFeedBack.RatingGivenBy.ToString();
                    employeeFeedBack.CreatedOn = DateTime.Now;
                    result = ratingRepository.Insert(employeeFeedBack);
                }

                return result;
            }
        }

        public int ReferBackForAdmin(int AppraisalCycleId, int LoginEmpID, string GDLId)
        {
            using (var ratingRepository = new RatingRepository())
            {

                int result = 0;
                List<EmployeeRatingNormailizationDetail> employeeRatingNormailizationDetail = ratingRepository.GetReferBackForAdmin(AppraisalCycleId, GDLId);

                foreach (var ERND in employeeRatingNormailizationDetail)
                {
                    if (ERND.PEPEmployeeId != null)
                    {
                        // ERND.Status = employeeFeedbackEntity.Status;  // 4 for GDL referback to last RM who given rating  // 5 for referback to GDL by Admin
                        ERND.Status = 5; // 5 for referback to GDL by Admin
                        ERND.ModifiedBy = LoginEmpID.ToString();
                        ERND.ModifiedOn = DateTime.Now;
                    }

                    result = ratingRepository.ReferBack(ERND);
                }

                return result;
            }
        }
        //public int ReferBack(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        //{
        //    using (var ratingRepository = new RatingRepository())
        //    {

        //        EmployeeRatingNormailizationDetail ERND = ratingRepository.GetReferBack(employeeFeedbackEntity.AppraisalCycleId, employeeFeedbackEntity.PEPEmployeeId);

        //        if (ERND.PEPEmployeeId != null)
        //        {

        //            ERND.Status = employeeFeedbackEntity.Status;
        //            ERND.Comments = employeeFeedbackEntity.Comments;
        //            ERND.ModifiedBy = employeeFeedbackEntity.ModifiedBy;
        //            ERND.ModifiedOn = DateTime.Now;
        //        }

        //        int result = ratingRepository.ReferBack(ERND);

        //        return result;
        //    }
        //}
        public int AdminRatingApproved(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {

                EmployeeRatingNormailizationDetail ERND = ratingRepository.Get(employeeFeedbackEntity.Id);

                if (ERND != null)
                {
                    ERND.IsAdminApproved = true;
                    ERND.Status = 5;

                }
                ERND.ModifiedBy = employeeFeedbackEntity.ModifiedBy;
                ERND.ModifiedOn = DateTime.Now;
                int result = ratingRepository.Update(ERND);

                return result;
            }
        }

        public int ShowToEmpApproved(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {

                EmployeeRatingNormailizationDetail ERND = ratingRepository.Get(employeeFeedbackEntity.Id);

                if (ERND != null)
                {
                    ERND.IsShowtoEmployee = true;

                }
                ERND.ModifiedBy = employeeFeedbackEntity.ModifiedBy;
                ERND.ModifiedOn = DateTime.Now;
                int result = ratingRepository.Update(ERND);

                return result;
            }
        }

        public int Insert(EmployeeRatingNormailizationTrackDetails_ResultEntity employeeFeedbackEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {
                EmployeeRatingNormailizationTrackDetail employeeFeedBack = new EmployeeRatingNormailizationTrackDetail();
                employeeFeedBack = (EmployeeRatingNormailizationTrackDetail)Utility.ConvertToObject(employeeFeedbackEntity, employeeFeedBack);
                employeeFeedBack.IsActive = 1;
                employeeFeedBack.CreatedOn = DateTime.Now;
                int result = ratingRepository.Insert(employeeFeedBack);

                return result;
            }
        }
        public int InsertReferBack(EmployeeRatingNormailizationTrackDetails_ResultEntity employeeFeedbackEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {


                int ClickStatus = Convert.ToInt32(employeeFeedbackEntity.Status.ToString().Substring(0, 1));
                int RowStatus = Convert.ToInt32(employeeFeedbackEntity.Status.ToString().Substring(1, 1));

                employeeFeedbackEntity.Status = ClickStatus;

                EmployeeRatingNormailizationTrackDetail employeeFeedBack = new EmployeeRatingNormailizationTrackDetail();
                employeeFeedBack = (EmployeeRatingNormailizationTrackDetail)Utility.ConvertToObject(employeeFeedbackEntity, employeeFeedBack);
                employeeFeedBack.IsActive = 1;
                employeeFeedBack.CreatedOn = DateTime.Now;
                int result = ratingRepository.Insert(employeeFeedBack);

                return result;
            }
        }


        public int update(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {
                EmployeeRatingNormailizationDetail employeeRatingNormailizationDetail = new EmployeeRatingNormailizationDetail();

                EmployeeRatingNormailizationDetail GetemployeeRatingNormailizationDetail = ratingRepository.Get(employeeFeedbackEntity.Id);

                //  employeeRatingNormailizationDetail = (EmployeeRatingNormailizationDetail)Utility.ConvertToObject(employeeFeedbackEntity, employeeRatingNormailizationDetail);
                GetemployeeRatingNormailizationDetail.Comments = employeeFeedbackEntity.Comments;
                GetemployeeRatingNormailizationDetail.Rating = employeeFeedbackEntity.Rating;
                GetemployeeRatingNormailizationDetail.RecoForPromotion = employeeFeedbackEntity.RecoForPromotion;
                GetemployeeRatingNormailizationDetail.Status = employeeFeedbackEntity.Status;
                GetemployeeRatingNormailizationDetail.NextSkipRM = employeeFeedbackEntity.NextSkipRM;

                if (employeeFeedbackEntity.RatingGivenBy != GetemployeeRatingNormailizationDetail.RatingGivenBy)
                {
                    GetemployeeRatingNormailizationDetail.SLastRatingGivenBy = GetemployeeRatingNormailizationDetail.RatingGivenBy;
                }
                GetemployeeRatingNormailizationDetail.RatingGivenBy = employeeFeedbackEntity.RatingGivenBy;

                GetemployeeRatingNormailizationDetail.ModifiedBy = employeeFeedbackEntity.RatingGivenBy.ToString();
                GetemployeeRatingNormailizationDetail.ModifiedOn = DateTime.Now;
                GetemployeeRatingNormailizationDetail.CreatedBy = GetemployeeRatingNormailizationDetail.CreatedBy;
                GetemployeeRatingNormailizationDetail.CreatedOn = GetemployeeRatingNormailizationDetail.CreatedOn;


                if (GetemployeeRatingNormailizationDetail.Id != 0)
                {

                    result = ratingRepository.Update(GetemployeeRatingNormailizationDetail);

                }
                return result;
            }
        }


        public int updateReferedBackMainDetail(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {
                EmployeeRatingNormailizationDetail employeeRatingNormailizationDetail = new EmployeeRatingNormailizationDetail();

                EmployeeRatingNormailizationDetail GetemployeeRatingNormailizationDetail = ratingRepository.GetReferBack(employeeFeedbackEntity.AppraisalCycleId, employeeFeedbackEntity.PEPEmployeeId);

                //  employeeRatingNormailizationDetail = (EmployeeRatingNormailizationDetail)Utility.ConvertToObject(employeeFeedbackEntity, employeeRatingNormailizationDetail);
                GetemployeeRatingNormailizationDetail.Comments = employeeFeedbackEntity.Comments;
                GetemployeeRatingNormailizationDetail.Rating = employeeFeedbackEntity.Rating;
                GetemployeeRatingNormailizationDetail.RecoForPromotion = employeeFeedbackEntity.RecoForPromotion;
                GetemployeeRatingNormailizationDetail.Status = employeeFeedbackEntity.Status;
                GetemployeeRatingNormailizationDetail.NextSkipRM = employeeFeedbackEntity.NextSkipRM;

                if (employeeFeedbackEntity.RatingGivenBy != GetemployeeRatingNormailizationDetail.RatingGivenBy)
                {
                    GetemployeeRatingNormailizationDetail.SLastRatingGivenBy = GetemployeeRatingNormailizationDetail.RatingGivenBy;
                }
                GetemployeeRatingNormailizationDetail.RatingGivenBy = employeeFeedbackEntity.RatingGivenBy;

                GetemployeeRatingNormailizationDetail.ModifiedBy = employeeFeedbackEntity.RatingGivenBy.ToString();
                GetemployeeRatingNormailizationDetail.ModifiedOn = DateTime.Now;
                GetemployeeRatingNormailizationDetail.CreatedBy = GetemployeeRatingNormailizationDetail.CreatedBy;
                GetemployeeRatingNormailizationDetail.CreatedOn = GetemployeeRatingNormailizationDetail.CreatedOn;


                if (GetemployeeRatingNormailizationDetail.Id != 0)
                {

                    result = ratingRepository.Update(GetemployeeRatingNormailizationDetail);

                }
                return result;
            }
        }

        public int updateTrackDetail(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity, int ClickStatus)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {

                EmployeeRatingNormailizationTrackDetail employeeRatingNormailizationtrackDetail = ratingRepository.GetReferbackNormalizationTrackDetail(employeeFeedbackEntity.AppraisalCycleId, employeeFeedbackEntity.RatingGivenBy, employeeFeedbackEntity.PEPEmployeeId);

                if (employeeRatingNormailizationtrackDetail != null)
                {
                    //  employeeRatingNormailizationtrackDetail.IsActive = 0;
                    employeeRatingNormailizationtrackDetail.RatingHistoryGivenBy = (int)employeeFeedbackEntity.RatingGivenBy;
                    employeeRatingNormailizationtrackDetail.RecoForPromotion = (int)employeeFeedbackEntity.RecoForPromotion;
                    employeeRatingNormailizationtrackDetail.Rating = employeeFeedbackEntity.Rating;
                    employeeRatingNormailizationtrackDetail.Status = employeeFeedbackEntity.Status;
                    employeeRatingNormailizationtrackDetail.ModifiedBy = Convert.ToString(employeeFeedbackEntity.RatingGivenBy);
                    employeeRatingNormailizationtrackDetail.ModifiedOn = DateTime.Now;


                    result = ratingRepository.UpdateTrack(employeeRatingNormailizationtrackDetail);
                }
                return result;
            }
        }


        public int ReferBackUpdateTrackDetail(EmployeeRatingNormailizationDetailsEntity employeeFeedbackEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {

                EmployeeRatingNormailizationTrackDetail employeeRatingNormailizationtrackDetail = ratingRepository.GetReferbackNormalizationTrackDetail(employeeFeedbackEntity.AppraisalCycleId, employeeFeedbackEntity.RatingGivenBy, employeeFeedbackEntity.PEPEmployeeId);

                if (employeeRatingNormailizationtrackDetail != null)
                {
                    //  employeeRatingNormailizationtrackDetail.IsActive = 0;
                    employeeRatingNormailizationtrackDetail.Status = 1; // ReferedBack and Set to Initial Stage;
                    employeeFeedbackEntity.Comments = employeeFeedbackEntity.Comments;
                    employeeRatingNormailizationtrackDetail.ModifiedBy = Convert.ToString(employeeFeedbackEntity.ModifiedBy);
                    employeeRatingNormailizationtrackDetail.ModifiedOn = DateTime.Now;


                    result = ratingRepository.UpdateTrack(employeeRatingNormailizationtrackDetail);
                }
                return result;
            }
        }

        public int SendMailAfterAction(int EmpId, string action, string selectedEmployees, string Role)
        {
            try
            {
                #region "Parameter"
                List<SqlParameter> parameterList = new List<SqlParameter>();
                SqlParameter sqlParam;
                sqlParam = new SqlParameter("@LoginEmployeeId", EmpId);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);

                sqlParam = new SqlParameter("@Action", action);
                sqlParam.SqlDbType = SqlDbType.NVarChar;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);

                sqlParam = new SqlParameter("@Role", Role);
                sqlParam.SqlDbType = SqlDbType.NVarChar;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);

                sqlParam = new SqlParameter("@selectedEmployees", selectedEmployees);
                sqlParam.SqlDbType = SqlDbType.NVarChar;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);

                #endregion
                SqlParameter[] parameters = parameterList.ToArray();
                var ratingrepository = new RatingRepository();
                return ratingrepository.SendMailAfterAction("EXEC dbo.[SendMailAfterAction] @LoginEmployeeId, @Action ,@Role,@selectedEmployees", parameters);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public string GetEmpName(string Input)
        {
            try
            {
                #region "Parameter"
                List<SqlParameter> parameterList = new List<SqlParameter>();
                SqlParameter sqlParam;
                sqlParam = new SqlParameter("@Input", Input);
                sqlParam.SqlDbType = SqlDbType.NVarChar;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                #endregion
                SqlParameter[] parameters = parameterList.ToArray();
                var ratingrepository = new RatingRepository();
                return ratingrepository.GetEmpName("EXEC dbo.[GetEmpNames] @Input", parameters);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public string DecryptString(string encrString)
        {
            byte[] b; string decrypted; try { b = Convert.FromBase64String(encrString); decrypted = System.Text.ASCIIEncoding.ASCII.GetString(b); }
            catch (FormatException fe) { decrypted = ""; }
            return decrypted;
        }

        public string EncryptString(string strEncrypted)

        {
            byte[] b = System.Text.ASCIIEncoding.ASCII.GetBytes(strEncrypted);

            string encrypted = Convert.ToBase64String(b); return encrypted;
        }

        public DataSet GetDashBoardEmployeeRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string ReporteeIds, bool AllSelected, int RoleId, string CriticalityPriorityIds = null) //added for duhrbp
        {
            DataSet getAnnualsRating;
            // var getAnnualsRating = new List<PEPEmployeeRating>();
            using (var repository = new RatingRepository())
            {

                getAnnualsRating = repository.GetDashBoardEmployeeRatingDetailsYearWise(AppraisalCycleId, LoginEmployeeId, ReporteeIds, AllSelected, RoleId, CriticalityPriorityIds);
            }


            return getAnnualsRating;

        }

        public DataSet PracticeGridView(int AppraisalCycleId, string Practice, int LogEmpID) //added for duhrbp
        {
            DataSet getAnnualsRating;
            // var getAnnualsRating = new List<PEPEmployeeRating>();
            using (var repository = new RatingRepository())
            {

                getAnnualsRating = repository.PracticeGridView(AppraisalCycleId, Practice, LogEmpID);
            }


            return getAnnualsRating;

        }


        public List<GetEmployeeRatingDetailsYearWise_ResultEntity> GetEmployeeRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string ReporteeIds, bool AllSelected, int RoleId) //added for duhrbp
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LoginEmployeeId", LoginEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Reportees", Convert.ToString(ReporteeIds as object));
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AllSelected", AllSelected);
            sqlParam.SqlDbType = SqlDbType.Bit;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RoleId", RoleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);



            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeeRatingDetailsYearWise_ResultEntity> empList = repository.GetEmployeeRatingDetailsYearWise("EXEC dbo.[GetEmployeeRatingDetailsYearWise] @AppraisalCyleId,@LoginEmployeeId,@Reportees,@AllSelected,@RoleId", parameters).ToList<GetEmployeeRatingDetailsYearWise_ResultEntity>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeeRatingDetailsYearWise_ResultEntity, GetEmployeeRatingDetailsYearWise_ResultEntity>(empList);
                }
                return null;
            }

        }

        public List<PEP_MaleFemaleNormalizationData_ResultEntity> GetHRBPAdminMalefemaleNorm(int EMPID, int AppraisalCycleId, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus,string Promotion)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EMPID", EMPID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Promotion", Promotion);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_MaleFemaleNormalizationData_ResultEntity> getratingNorm_Result = ratingRepository.GetPEP_MaleFemaleNormalizationData("EXEC dbo.[PEP_HRBPAdminMaleFemaleNormalizationData_local]  @EMPID, @AppraisalCycleId, @GDLList,@DPList,@RMList, @GradeId, @LocationId, @GroupAccountId ,@Gender,@EmpStatus, @Role,@DeliveryStatus, @Promotion", parameters).ToList<PEP_MaleFemaleNormalizationData_ResultEntity>(); ;
                return Utility.ConvertToList<PEP_MaleFemaleNormalizationData_ResultEntity, PEP_MaleFemaleNormalizationData_ResultEntity>(getratingNorm_Result);

            }
        }

        public List<PEP_GradeRatingTypeWiseNormData_ResultEntity> GetRatingHRBPAdminOverallData(int EMPID, int AppraisalCycleId, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus,string Promotion)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@EMPID", EMPID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@Promotion", Promotion);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_GradeRatingTypeWiseNormData_ResultEntity> getratingNorm_Result = ratingRepository.GetRatingHRBPAdminOverallData("EXEC dbo.[PEP_HRBPAdminGradeRatingTypeWiseNormData_local]  @EMPID,@AppraisalCycleId,@GDLList,@DPList,@RMList, @GradeId, @LocationId, @GroupAccountId,@Gender,@EmpStatus, @Role,@DeliveryStatus, @Promotion", parameters).ToList<PEP_GradeRatingTypeWiseNormData_ResultEntity>(); ;
                return Utility.ConvertToList<PEP_GradeRatingTypeWiseNormData_ResultEntity, PEP_GradeRatingTypeWiseNormData_ResultEntity>(getratingNorm_Result);

            }
        }

        public List<PEP_MaleFemaleNormalizationData_ResultEntity> GetMalefemaleNorm(int EMPID, int AppraisalCycleId, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId,string CriticalityPriorityId)

        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@EMPID", EMPID);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@IReportee", IReportee);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Promotion", Promotion);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);



            sqlParam = new SqlParameter("@RoleId", RoleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@CriticalityPriorityIds", string.IsNullOrWhiteSpace(CriticalityPriorityId) ? (object)DBNull.Value : CriticalityPriorityId.Trim());

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Size = -1;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_MaleFemaleNormalizationData_ResultEntity> getratingNorm_Result = ratingRepository.GetPEP_MaleFemaleNormalizationData("EXEC dbo.[PEP_MaleFemaleNormalizationData]  @EMPID, @AppraisalCycleId, @IReportee, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @Promotion, @RoleId, @CriticalityPriorityIds", parameters).ToList<PEP_MaleFemaleNormalizationData_ResultEntity>(); ;

                return Utility.ConvertToList<PEP_MaleFemaleNormalizationData_ResultEntity, PEP_MaleFemaleNormalizationData_ResultEntity>(getratingNorm_Result);

            }

        }




        public DataSet GetMaleFemaleNormalizationStudioView(int EMPID, int AppraisalCycleId, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus,string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet getRatings;
            using (var repository = new RatingRepository())
            {

                getRatings = repository.GetMaleFemaleNormalizationStudioView(AppraisalCycleId, EMPID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
            }


            return getRatings;

        }
        public List<PEP_GradeRatingTypeWiseNormData_ResultEntity> GetRatingOverallData(int AppraisalCycleId, int EMPID, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string CriticalityPriorityIds = null)

        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EMPID", EMPID);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@IReportee", IReportee);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Promotion", Promotion);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RoleId", RoleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@CriticalityPriorityIds", string.IsNullOrWhiteSpace(CriticalityPriorityIds) ? (object)DBNull.Value : CriticalityPriorityIds.Trim());

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Size = -1;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);




            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_GradeRatingTypeWiseNormData_ResultEntity> getratingNorm_Result = ratingRepository.GetRatingOverallData("EXEC dbo.[PEP_GradeRatingTypeWiseNormData]  @AppraisalCycleId, @EMPID, @IReportee, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @Promotion, @RoleId, @CriticalityPriorityIds", parameters).ToList<PEP_GradeRatingTypeWiseNormData_ResultEntity>(); ;

                return Utility.ConvertToList<PEP_GradeRatingTypeWiseNormData_ResultEntity, PEP_GradeRatingTypeWiseNormData_ResultEntity>(getratingNorm_Result);

            }

        }



        public DataSet GetRatingOverallDataStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus,string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet getRatings;
            using (var repository = new RatingRepository())
            {

                getRatings = repository.GetRatingOverallDataStudioView(AppraisalCycleId, EMPID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
            }


            return getRatings;

        }

        public DataSet GetDataForChartStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus,string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            DataSet getRatings;
            using (var repository = new RatingRepository())
            {

                getRatings = repository.GetDataForChartStudioView(AppraisalCycleId, EMPID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
            }


            return getRatings;

        }


        public List<GetRatingPromotionDetails_ResultEntity> GetRatingPromotionDetails(int AppraisalCycleId, int LogEmpID, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int RoleId, string CriticalityPriorityIds = null)

        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@IReportee", IReportee);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RoleId", RoleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@CriticalityPriorityIds", string.IsNullOrWhiteSpace(CriticalityPriorityIds) ? (object)DBNull.Value : CriticalityPriorityIds.Trim());

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Size = -1;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingPromotionDetails_ResultEntity> getratingPromotion_Result = ratingRepository.GetRatingPromotionDetails("EXEC dbo.[PEP_RatingPromotionDetails] @AppraisalCyleId,@LogEmpID,@IReportee, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @RoleId, @CriticalityPriorityIds", parameters).ToList<GetRatingPromotionDetails_ResultEntity>(); ;

                return Utility.ConvertToList<GetRatingPromotionDetails_ResultEntity, GetRatingPromotionDetails_ResultEntity>(getratingPromotion_Result);

            }

        }

        public List<GetRatingMaleFemalePromotionDetails_ResultEntity> GetRatingMaleFemalePromotionDetails(int AppraisalCycleId, int LogEmpID, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int RoleId, string CriticalityPriorityId = null)

        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@IReportee", IReportee);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RoleId", RoleId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@CriticalityPriorityIds", string.IsNullOrWhiteSpace(CriticalityPriorityId) ? (object)DBNull.Value : CriticalityPriorityId.Trim());

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Size = -1;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingMaleFemalePromotionDetails_ResultEntity> getratingPromotion_Result = ratingRepository.GetRatingMaleFemalePromotionDetails("EXEC dbo.[PEP_RatingMaleFemalePromotionDetails] @AppraisalCyleId,@LogEmpID,@IReportee, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @RoleId, @CriticalityPriorityIds", parameters).ToList<GetRatingMaleFemalePromotionDetails_ResultEntity>(); ;

                return Utility.ConvertToList<GetRatingMaleFemalePromotionDetails_ResultEntity, GetRatingMaleFemalePromotionDetails_ResultEntity>(getratingPromotion_Result);

            }

        }


        public List<GetDataforPromotionGraph_ResultEntity> GetDataforPromotionGraph(int AppraisalCycleId, int LogEmpID, string IReportee, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int RoleId)

        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@IReportee", IReportee);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);

            sqlParam.SqlDbType = SqlDbType.VarChar;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@RoleId", RoleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);



            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDataforPromotionGraph_ResultEntity> getratingPromotion_Result = ratingRepository.GetDataforPromotionGraph("EXEC dbo.[GetDataforPromotionGraph] @AppraisalCyleId,@LogEmpID,@IReportee,@GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus, @RoleId", parameters).ToList<GetDataforPromotionGraph_ResultEntity>(); ;

                return Utility.ConvertToList<GetDataforPromotionGraph_ResultEntity, GetDataforPromotionGraph_ResultEntity>(getratingPromotion_Result);

            }

        }

        public List<GetEmployeeRatingDetailsYearWise_ResultEntity> GetEmployeeApprovedRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string ReporteeIds, bool AllSelected)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LoginEmployeeId", LoginEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Reportees", Convert.ToString(ReporteeIds as object));
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AllSelected", AllSelected);
            sqlParam.SqlDbType = SqlDbType.Bit;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeeRatingDetailsYearWise_ResultEntity> empList = repository.GetEmployeeRatingDetailsYearWise("EXEC dbo.[GetEmployeeApprovedRatingDetailsYearWise] @AppraisalCyleId,@LoginEmployeeId,@Reportees,@AllSelected", parameters).ToList<GetEmployeeRatingDetailsYearWise_ResultEntity>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeeRatingDetailsYearWise_ResultEntity, GetEmployeeRatingDetailsYearWise_ResultEntity>(empList);
                }
                return null;
            }

        }
        public List<GetRatingPromotionDetails_ResultEntity> GetHRBPAdminRatingPromotionDetails(int AppraisalCycleId, int LogEmpID, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingPromotionDetails_ResultEntity> getratingPromotion_Result = ratingRepository.GetRatingPromotionDetails("EXEC dbo.[PEP_HRBPAdminRatingPromotionDetails] @AppraisalCyleId,@LogEmpID,@GDLList,@DPList,@RMList, @GradeId, @LocationId, @GroupAccountId,@Gender,@EmpStatus,@Role,@DeliveryStatus", parameters).ToList<GetRatingPromotionDetails_ResultEntity>(); ;
                return Utility.ConvertToList<GetRatingPromotionDetails_ResultEntity, GetRatingPromotionDetails_ResultEntity>(getratingPromotion_Result);

            }
        }
        public List<GetRatingMaleFemalePromotionDetails_ResultEntity> GetHRBPAdminRatingMaleFemalePromotionDetails(int AppraisalCycleId, int LogEmpID, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingMaleFemalePromotionDetails_ResultEntity> getratingPromotion_Result = ratingRepository.GetHRBPAdminRatingMaleFemalePromotionDetails("EXEC dbo.[PEP_HRBPAdminRatingMaleFemalePromotionDetails] @AppraisalCyleId,@LogEmpID,@GDLList,@DPList,@RMList, @GradeId, @LocationId, @GroupAccountId,@Gender,@EmpStatus,@Role,@DeliveryStatus", parameters).ToList<GetRatingMaleFemalePromotionDetails_ResultEntity>(); ;
                return Utility.ConvertToList<GetRatingMaleFemalePromotionDetails_ResultEntity, GetRatingMaleFemalePromotionDetails_ResultEntity>(getratingPromotion_Result);

            }
        }
        public List<GetDataforPromotionGraph_ResultEntity> GetHRBPAdminDataforPromotionGraph(int AppraisalCycleId, int LogEmpID, string GDLList, string DPList, string RMList, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, int Role, string DeliveryStatus)
        {

            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@GDLList", GDLList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPList", DPList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@RMList", RMList);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Role", Role);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DeliveryStatus", DeliveryStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion

            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDataforPromotionGraph_ResultEntity> getratingPromotion_Result = ratingRepository.GetHRBPAdminDataforPromotionGraph("EXEC dbo.[GetHRBPAdminDataforPromotionGraph] @AppraisalCyleId,@LogEmpID,@GDLList,@DPList,@RMList, @GradeId, @LocationId, @GroupAccountId,@Gender,@EmpStatus,@Role,@DeliveryStatus", parameters).ToList<GetDataforPromotionGraph_ResultEntity>(); ;
                return Utility.ConvertToList<GetDataforPromotionGraph_ResultEntity, GetDataforPromotionGraph_ResultEntity>(getratingPromotion_Result);

            }
        }

        public List<GetGradeList_ResultEntity> GetGradeList()
        {



            using (var ratingrepository = new RatingRepository())
            {

                List<GetGradeList_Result> md_GetGradeList_Resultepository = ratingrepository.GetGradeList("EXEC dbo.[GetGradeList]").ToList<GetGradeList_Result>(); ;

                return Utility.ConvertToList<GetGradeList_Result, GetGradeList_ResultEntity>(md_GetGradeList_Resultepository);

            }
        }

        public List<PEP_RoleAccessDetail_ResultEntity> GetRoleList(int AppraisalId, int LoginEmpId)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LoginEmpId", LoginEmpId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            using (var ratingrepository = new RatingRepository())
            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<PEP_RoleAccessDetail_Result> md_GetRoleList_Resultepository = ratingrepository.GetRoleList("EXEC dbo.[PEP_RoleAccessDetail_copy] @AppraisalCycleId, @LoginEmpId", parameters).ToList<PEP_RoleAccessDetail_Result>(); ;


                return Utility.ConvertToList<PEP_RoleAccessDetail_Result, PEP_RoleAccessDetail_ResultEntity>(md_GetRoleList_Resultepository);

            }
        }


        public List<GetAccountGroupList_ResultEntity> GetAccountList()
        {
            using (var ratingrepository = new RatingRepository())
            {

                List<GetAccountGroupList_Result> md_GetAccountList_Resultepository = ratingrepository.GetAccountList("EXEC dbo.[GetAccountGroupList]").ToList<GetAccountGroupList_Result>(); ;

                return Utility.ConvertToList<GetAccountGroupList_Result, GetAccountGroupList_ResultEntity>(md_GetAccountList_Resultepository);

            }
        }
        public List<GetGDLHeadandRMList_ResultEntity> GetGDLRMList(int DropdownValue, string GDLId, string DPId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@DropdownValue", DropdownValue);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GDLId", GDLId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DPId", DPId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetGDLHeadandRMList_Result> md_GetGDLRMList_Resultepository = ratingRepository.GetGDLRMList("EXEC dbo.[GetGDLHeadandRMList] @DropdownValue, @GDLId,@DPId", parameters).ToList<GetGDLHeadandRMList_Result>(); ;
                return Utility.ConvertToList<GetGDLHeadandRMList_Result, GetGDLHeadandRMList_ResultEntity>(md_GetGDLRMList_Resultepository);

            }
        }

        public DataSet GetPracticeList(int LoginEmpId)
        {
            DataSet getPracticeList;
            using (var repository = new RatingRepository())
            {

                getPracticeList = repository.GetPracticeList(LoginEmpId);
            }


            return getPracticeList;

        }
        public DataSet IsloginEmpSubmittedRatings(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {

            DataSet Result;
            using (var repository = new RatingRepository())
            {

                Result = repository.IsloginEmpSubmittedRatings(AppraisalCycleId, LoginEmployeeId, RoleId);
            }

            return Result;

        }
        public DataSet IsDesignationUploaded(int AppraisalCycleId)
        {

            DataSet Result;
            using (var repository = new RatingRepository())
            {

                Result = repository.IsDesignationUploaded(AppraisalCycleId);
            }

            return Result;

        }



        public DataSet GetAspireeReporteeList(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {

            DataSet getAspireReporteeListList;
            using (var repository = new RatingRepository())
            {

                getAspireReporteeListList = repository.GetAspireeReporteeList(AppraisalCycleId, LoginEmployeeId, RoleId);
            }


            return getAspireReporteeListList;

        }

        public List<GetEmployeeRatingHistoryDetail_ResultEntity> GetRatingHistoryDetails(int AppraisalCycleId, int EmpID, int LogEmpId) //added for duhrbp
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpID", EmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpId", LogEmpId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion

            using (var ratingrepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeeRatingHistoryDetail_ResultEntity> ratingHistory = ratingrepository.GetPEPRatingHistoryDetails("EXEC dbo.[PEP_EmployeeRatingHistoryDetail] @AppraisalCyleId,@EmpID,@LogEmpId", parameters).ToList<GetEmployeeRatingHistoryDetail_ResultEntity>(); ;

                return Utility.ConvertToList<GetEmployeeRatingHistoryDetail_ResultEntity, GetEmployeeRatingHistoryDetail_ResultEntity>(ratingHistory);

            }

        }

        public DataSet GetRMHistoryDetails(int SelectedEmpId)
        {
            DataSet getRMHistory;
            using (var repository = new RatingRepository())
            {

                getRMHistory = repository.GetRMHistoryDetails(SelectedEmpId);
            }


            return getRMHistory;

        }

        public List<GetRatingPracticeLeadWisePromotionDetails_ResultEntity> GetRatingPracticeLeadWisePromotionDetails(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Practice", Practice);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingPracticeLeadWisePromotionDetails_ResultEntity> getratingPracticeLeadWisePromotion_Result = ratingRepository.GetRatingPracticeLeadWisePromotionDetails("EXEC dbo.[PEP_RatingPracticeLeadWisePromotionDetails] @AppraisalCyleId,@LogEmpID,@Practice, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus", parameters).ToList<GetRatingPracticeLeadWisePromotionDetails_ResultEntity>(); ;
                return Utility.ConvertToList<GetRatingPracticeLeadWisePromotionDetails_ResultEntity, GetRatingPracticeLeadWisePromotionDetails_ResultEntity>(getratingPracticeLeadWisePromotion_Result);

            }
        }


        public List<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity> GetRatingMaleFemalePracticeLeadWisePromotionDetails(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@Practice", Practice);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);



            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity> getratingPracticeLeadWisePromotion_Result = ratingRepository.GetRatingMaleFemalePracticeLeadWisePromotionDetails("EXEC dbo.[PEP_RatingMaleFemalePracticeLeadWisePromotionDetails] @AppraisalCyleId,@LogEmpID,@Practice, @GradeId, @LocationId, @GroupAccountId, @Gender, @EmpStatus", parameters).ToList<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity>(); ;
                return Utility.ConvertToList<GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity, GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity>(getratingPracticeLeadWisePromotion_Result);

            }
        }


        public List<GetDataforPracticeLeadWisePromotionGraph_ResultEntity> GetDataforPracticeLeadWisePromotionGraph(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LogEmpID", LogEmpID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Practice", Practice);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LocationId", LocationId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@GroupAccountId", GroupAccountId);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@Gender", Gender);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);


            sqlParam = new SqlParameter("@EmpStatus", EmpStatus);
            sqlParam.SqlDbType = SqlDbType.VarChar;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetDataforPracticeLeadWisePromotionGraph_ResultEntity> getratingPracticeLeadWisePromotion_Result = ratingRepository.GetDataforPracticeLeadWisePromotionGraph("EXEC dbo.[GetDataforPracticeLeadWisePromotionGraph] @AppraisalCyleId,@LogEmpID,@Practice, @GradeId, @LocationId, @GroupAccountId, @Gender , @EmpStatus", parameters).ToList<GetDataforPracticeLeadWisePromotionGraph_ResultEntity>();
                return Utility.ConvertToList<GetDataforPracticeLeadWisePromotionGraph_ResultEntity, GetDataforPracticeLeadWisePromotionGraph_ResultEntity>(getratingPracticeLeadWisePromotion_Result);

            }
        }




        /// HRBP-Admin
        /// 

        public DataSet GetHRBPAdminEmployeeRatingDetailsYearWise(int AppraisalCycleId, int LoginEmployeeId, string GDLId, string DPId, string InputterId, int Role, string CriticalityPriorityId = null)
        {
            DataSet getRatings;
            using (var repository = new RatingRepository())
            {

                getRatings = repository.GetHRBPAdminEmployeeRatingDetailsYearWise(AppraisalCycleId, LoginEmployeeId, GDLId, DPId, InputterId, Role, CriticalityPriorityId);
            }


            return getRatings;

        }

        public DataSet GetValidRecommendedDesignations()
        {
            DataSet getData;
            using (var repository = new RatingRepository())
            {
                getData = repository.GetValidRecommendedDesignations();
            }


            return getData;

        }
        public List<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity> GetNormalisationAppraisalCycleGradeMapping()
        {
            using (var ratingRepository = new RatingRepository())
            {
                List<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity> result = ratingRepository.GetNormalisationAppraisalCycleGradeMapping("EXEC dbo.[PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping]").ToList<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity>();
                return Utility.ConvertToList<PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity, PEP_ADMIN_GetNormalisationAppraisalCycleGradeMapping_ResultEntity>(result);
            }
        }

        public int Insert(PEP_ADMIN_NormalisationAppraisalCycleGradeMappingEntity normalisationAppraisalCycleGradeMappingEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {
                NormalisationGradeAppraisalMapping normalisationGradeAppraisalMapping = new NormalisationGradeAppraisalMapping();
                normalisationGradeAppraisalMapping = (NormalisationGradeAppraisalMapping)Utility.ConvertToObject(normalisationAppraisalCycleGradeMappingEntity, normalisationGradeAppraisalMapping);
                normalisationGradeAppraisalMapping.CreatedBy = normalisationAppraisalCycleGradeMappingEntity.CreatedBy;
                normalisationGradeAppraisalMapping.IsActive = true;
                normalisationGradeAppraisalMapping.CreatedOn = DateTime.Now;
                int result = ratingRepository.Insert(normalisationGradeAppraisalMapping);
                return result;
            }
        }

        public int Update(PEP_ADMIN_NormalisationAppraisalCycleGradeMappingEntity normalisationAppraisalCycleGradeMappingEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {
                NormalisationGradeAppraisalMapping normalisationGradeAppraisalMapping = ratingRepository.GetNormalisationGradeAppraisalMapping(normalisationAppraisalCycleGradeMappingEntity.Id);
                int createdBy = normalisationGradeAppraisalMapping.CreatedBy;
                normalisationGradeAppraisalMapping = (NormalisationGradeAppraisalMapping)Utility.ConvertToObject(normalisationAppraisalCycleGradeMappingEntity, normalisationGradeAppraisalMapping);
                normalisationGradeAppraisalMapping.CreatedBy = createdBy;
                normalisationGradeAppraisalMapping.ModifiedBy = normalisationAppraisalCycleGradeMappingEntity.ModifiedBy;
                normalisationGradeAppraisalMapping.ModifiedOn = DateTime.Now;

                if (normalisationGradeAppraisalMapping.Id != 0)
                {
                    result = ratingRepository.Update(normalisationGradeAppraisalMapping);
                }
                return result;
            }
        }


        public List<GetAdminRatingVisibility_ResultEntity> GetAdminRatingVisibility(int AppraisalCycleId)
        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<GetAdminRatingVisibility_ResultEntity> result = ratingRepository.GetAdminRatingVisibility("EXEC dbo.[GetAdminRatingVisibility] @AppraisalCycleId", parameters).ToList<GetAdminRatingVisibility_ResultEntity>();

                return Utility.ConvertToList<GetAdminRatingVisibility_ResultEntity, GetAdminRatingVisibility_ResultEntity>(result);

            }

        }


        public int Insert(GetAdminRatingVisibilityEntity adminRatingVisibilityEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {
                NormalisationRatingVisibilityConfig normalisationRatingVisibilityConfig = new NormalisationRatingVisibilityConfig();
                normalisationRatingVisibilityConfig = (NormalisationRatingVisibilityConfig)Utility.ConvertToObject(adminRatingVisibilityEntity, normalisationRatingVisibilityConfig);
                normalisationRatingVisibilityConfig.CreatedBy = adminRatingVisibilityEntity.CreatedBy;
                normalisationRatingVisibilityConfig.IsActive = true;
                normalisationRatingVisibilityConfig.CreatedOn = DateTime.Now;
                normalisationRatingVisibilityConfig.ModifiedBy = null;
                normalisationRatingVisibilityConfig.ModifiedOn = null;
                int result = ratingRepository.Insert(normalisationRatingVisibilityConfig);
                return result;
            }
        }

        public int Update(GetAdminRatingVisibilityEntity adminRatingVisibilityEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {
                NormalisationRatingVisibilityConfig normalisationRatingVisibilityConfig = ratingRepository.GetNormalisationRatingVisibility(adminRatingVisibilityEntity.Id);
                int createdBy = normalisationRatingVisibilityConfig.CreatedBy;
                DateTime createdOn = normalisationRatingVisibilityConfig.CreatedOn;
                normalisationRatingVisibilityConfig = (NormalisationRatingVisibilityConfig)Utility.ConvertToObject(adminRatingVisibilityEntity, normalisationRatingVisibilityConfig);
                normalisationRatingVisibilityConfig.CreatedBy = createdBy;
                normalisationRatingVisibilityConfig.CreatedOn = createdOn;
                normalisationRatingVisibilityConfig.ModifiedBy = adminRatingVisibilityEntity.ModifiedBy;
                normalisationRatingVisibilityConfig.ModifiedOn = DateTime.Now;

                if (normalisationRatingVisibilityConfig.Id != 0)
                {
                    result = ratingRepository.Update(normalisationRatingVisibilityConfig);
                }
                return result;
            }
        }

        public List<GetPromotionGradeConfig_ResultEntity> GetPromotionGradeConfiguration(int AppraisalCycleId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            #endregion

            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();
                List<GetPromotionGradeConfig_ResultEntity> result = ratingRepository.GetPromotionGradeConfiguration("EXEC dbo.[GetPromotionGradeConfig] @AppraisalCycleId", parameters).ToList<GetPromotionGradeConfig_ResultEntity>();
                return Utility.ConvertToList<GetPromotionGradeConfig_ResultEntity, GetPromotionGradeConfig_ResultEntity>(result);
            }
        }

        public int Insert(PromotionPercentageYearGenderWiseEntity promotionPercentageYearGenderWiseEntity)
        {
            using (var ratingRepository = new RatingRepository())
            {
                PromotionPercentageYearGenderWise promotionPercentageYearGenderWise = new PromotionPercentageYearGenderWise();
                promotionPercentageYearGenderWise = (PromotionPercentageYearGenderWise)Utility.ConvertToObject(promotionPercentageYearGenderWiseEntity, promotionPercentageYearGenderWise);
                promotionPercentageYearGenderWise.CreatedBy = promotionPercentageYearGenderWiseEntity.CreatedBy;
                promotionPercentageYearGenderWise.IsActive = true;
                promotionPercentageYearGenderWise.CreatedOn = DateTime.Now;
                int result = ratingRepository.Insert(promotionPercentageYearGenderWise);
                return result;
            }
        }

        public int Update(PromotionPercentageYearGenderWiseEntity promotionPercentageYearGenderWiseEntity)
        {
            int result = 0;
            using (var ratingRepository = new RatingRepository())
            {
                PromotionPercentageYearGenderWise promotionPercentageYearGenderWise = ratingRepository.GetPromotionPercentageYearGenderWise(promotionPercentageYearGenderWiseEntity.Id);
                int createdBy = promotionPercentageYearGenderWise.CreatedBy;
                DateTime createdOn = promotionPercentageYearGenderWise.CreatedOn;
                promotionPercentageYearGenderWise = (PromotionPercentageYearGenderWise)Utility.ConvertToObject(promotionPercentageYearGenderWiseEntity, promotionPercentageYearGenderWise);
                promotionPercentageYearGenderWise.CreatedBy = createdBy;
                promotionPercentageYearGenderWise.CreatedOn = createdOn;
                promotionPercentageYearGenderWise.ModifiedBy = promotionPercentageYearGenderWiseEntity.ModifiedBy;
                promotionPercentageYearGenderWise.ModifiedOn = DateTime.Now;

                if (promotionPercentageYearGenderWise.Id != 0)
                {
                    result = ratingRepository.Update(promotionPercentageYearGenderWise);
                }
                return result;
            }
        }

        public List<GetConfirmationRatingGiventoEmployees_ResultEntity> GetConfirmationRatingGivenCount(int AppraisalCycleId, int LoginEmployeeId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@LoginEmployeeId", LoginEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion

            using (var repository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetConfirmationRatingGiventoEmployees_Result> empCount = repository.GetConfirmationRatingGiventoEmployees("EXEC dbo.[GetConfirmationRatingGiventoEmployees] @AppraisalCyleId,@LoginEmployeeId", parameters).ToList<GetConfirmationRatingGiventoEmployees_Result>(); ;

                if (empCount.Any())
                {
                    return Utility.ConvertToList<GetConfirmationRatingGiventoEmployees_Result, GetConfirmationRatingGiventoEmployees_ResultEntity>(empCount);
                }
                return null;
            }

        }


        public int InsertUpdateRating(List<EmployeeRatingNormailizationDetailsEntity> employeeRatingsArray)
        {
            int returnresult;
            using (var repository = new RatingRepository())
            {

                returnresult = repository.InsertUpdateRating(employeeRatingsArray);
            }


            return returnresult;

        }

        public int UpdateConsent(int AppraisalCycleId, int LogEmpId, int SelectEmpId, int action, int RoleId)
        {
            int returnresult;
            using (var repository = new RatingRepository())
            {

                returnresult = repository.UpdateConsent(AppraisalCycleId, LogEmpId, SelectEmpId, action, RoleId);
            }


            return returnresult;

        }
        public int ReferbackRating(List<EmployeeRatingNormailizationDetailsEntity> employeeRatingsArray)
        {
            int returnresult;
            using (var repository = new RatingRepository())
            {

                returnresult = repository.ReferbackRating(employeeRatingsArray);
            }


            return returnresult;

        }
        public List<BindDropdown_ResultEntity> BindRolesByApprCycle(int AppraisalCycleId)
        {

            #region "Parameter"

            List<SqlParameter> parameterList = new List<SqlParameter>();

            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);

            sqlParam.SqlDbType = SqlDbType.Int;

            sqlParam.Direction = ParameterDirection.Input;

            parameterList.Add(sqlParam);

            #endregion

            using (var ratingRepository = new RatingRepository())

            {

                SqlParameter[] parameters = parameterList.ToArray();

                List<BindDropdown_Result> result = ratingRepository.BindRolesByApprCycle("EXEC dbo.[BindRolesByApprCycle] @AppraisalCycleId", parameters).ToList<BindDropdown_Result>();

                return Utility.ConvertToList<BindDropdown_Result, BindDropdown_ResultEntity>(result);

            }

        }

        public (DateTime? StartDate, DateTime? EndDate) BindStartDateByRole(int AppraisalCycleId, int Role)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();

            parameterList.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = AppraisalCycleId });
            parameterList.Add(new SqlParameter("@Role", SqlDbType.Int) { Value = Role });

            using (var ratingRepository = new RatingRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                var result = ratingRepository.BindStartDateByRole("EXEC dbo.[BindStartDateByRole] @AppraisalCycleId, @Role", parameters);
                return result;
            }
        }


        public DataSet GetAppraisalCycleRoleMapping()
        {
            DataSet getRoles;
            using (var repository = new RatingRepository())
            {

                getRoles = repository.GetAppraisalCycleRoleMapping();
            }


            return getRoles;

        }


        public int SaveNormalisationRoleMapping(PEP_ADMIN_GetAppraisalCycleRoleMapping_ResultEntity roleMappingEntity)
        {
            try
            {
                #region "Parameter"
                List<SqlParameter> parameterList = new List<SqlParameter>();
                SqlParameter sqlParam;


                sqlParam = new SqlParameter("@Id", roleMappingEntity.Id);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@AppraisalCycleId", roleMappingEntity.AppraisalCycleId);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@RoleId", roleMappingEntity.RoleId);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@NormalisationEndDate", roleMappingEntity.NormalisationEndDate);
                sqlParam.SqlDbType = SqlDbType.DateTime;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@NormalisationStartDate", roleMappingEntity.NormalisationStartDate);
                sqlParam.SqlDbType = SqlDbType.DateTime;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@Actionby", roleMappingEntity.Actionby);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                sqlParam = new SqlParameter("@IsActive", roleMappingEntity.IsActive);
                sqlParam.SqlDbType = SqlDbType.Int;
                sqlParam.Direction = ParameterDirection.Input;
                parameterList.Add(sqlParam);
                #endregion
                SqlParameter[] parameters = parameterList.ToArray();
                var ratingrepository = new RatingRepository();
                return ratingrepository.SaveNormalisationRoleMapping("EXEC dbo.[SaveNormalisationRoleMapping] @Id,@AppraisalCycleId,@RoleId,@NormalisationEndDate,@NormalisationStartDate,@Actionby,@IsActive", parameters);
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

        public int UploadDataFromExcel(List<EmployeeRatingDetails_Entity> details)
        {
            try
            {
                var ratingrepository = new RatingRepository();
                // Convert the list of details into a DataTable
                DataTable dt = ConvertToDataTable(details);

                // Create a SQL parameter for the TVP
                SqlParameter tvpParam = new SqlParameter("@EmployeeRatings", SqlDbType.Structured)
                {
                    Value = dt,           // Set the value to the DataTable
                    TypeName = "dbo.EmployeeRatingTableType" // Name of the TVP defined in the database
                };

                // Execute the stored procedure to insert the data
                return ratingrepository.ExecuteNonQuery("EXEC dbo.SaveEmployeeRatings @EmployeeRatings", tvpParam);
            }
            catch (Exception ex)
            {
                // Log exception or rethrow it
                throw new Exception("Error while uploading data from Excel: " + ex.Message, ex);
            }
        }

        private DataTable ConvertToDataTable(List<EmployeeRatingDetails_Entity> details)
        {
            DataTable dt = new DataTable();

            dt.Columns.Add("Id", typeof(int));
            dt.Columns.Add("RowNo", typeof(int));
            dt.Columns.Add("AppraisalCycleId", typeof(int));
            dt.Columns.Add("RatingGivenBy", typeof(int));
            dt.Columns.Add("PEPEmployeeId", typeof(int));
            dt.Columns.Add("Rating", typeof(string));
            dt.Columns.Add("RecoForpromotion", typeof(int));
            dt.Columns.Add("RecommendedDesignation", typeof(int));
            dt.Columns.Add("IsDesignationUpdate", typeof(int));
            dt.Columns.Add("Comments", typeof(string));

            foreach (var detail in details)
            {
                dt.Rows.Add(detail.Id, detail.RowNo, detail.AppraisalCycleId, detail.RatingGivenBy, detail.PEPEmployeeId,
                            detail.Rating, detail.RecoForpromotion, detail.RecommendedDesignation, detail.IsDesignationUpdate, detail.Comments);
            }

            return dt;
        }

        #region Criticality Details Methods

        /// <summary>
        /// Get criticality details for an employee
        /// </summary>
        public EmployeeRatingNormailizationDetailsEntity GetCriticalityDetails(int pepEmployeeId, int appraisalCycleId)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCriticalityDetails(pepEmployeeId, appraisalCycleId);
            }
        }

        /// <summary>
        /// Get complete hierarchical span count for an employee
        /// </summary>
        public int GetCompleteSpanCount(int employeeId, int appraisalCycleId, int? roleId = null)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCompleteSpanCount(employeeId, appraisalCycleId, roleId);
            }
        }

        /// <summary>
        /// Get count of employees marked with Criticality Priority by a specific user in their span
        /// </summary>
        public int GetCriticalityMarkedCount(int employeeId, int appraisalCycleId, int? roleId = null)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCriticalityMarkedCount(employeeId, appraisalCycleId, roleId);
            }
        }

        /// <summary>
        /// Get count of employees marked with specific Criticality Priority (P1, P2, or P3) by a specific user in their span
        /// </summary>
        public int GetCriticalityPriorityMarkedCount(int employeeId, int appraisalCycleId, string priorityCode, int? roleId = null)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCriticalityPriorityMarkedCount(employeeId, appraisalCycleId, priorityCode, roleId);
            }
        }

        /// <summary>
        /// Validate criticality marking limit (25% of span, minimum 1)
        /// Returns: (isValid, maxAllowed, currentCount, spanCount, errorMessage)
        /// For small teams, rounds up to next higher number if percentage is in decimal
        /// </summary>
        public Tuple<bool, int, int, int, string> ValidateCriticalityMarkingLimit(int employeeId, int appraisalCycleId, int? roleId = null)
        {
            using (var repository = new RatingRepository())
            {
                // Get complete span count
                int spanCount = repository.GetCompleteSpanCount(employeeId, appraisalCycleId, roleId);
                
                // Get current marked count
                int currentMarkedCount = repository.GetCriticalityMarkedCount(employeeId, appraisalCycleId, roleId);
                
                // Calculate 25% of span count
                double maxAllowedDouble = spanCount * 0.25;
                // Round up to next higher number for small teams (e.g., 1.2% or 1.7% becomes 2)
                int maxAllowed = (int)Math.Ceiling(maxAllowedDouble);
                
                // For small teams, allow minimum 1 person if desired % is < 1 headcount
                if (maxAllowed < 1)
                {
                    maxAllowed = 1;
                }
                
                // Check if adding one more would exceed the limit
                bool isValid = (currentMarkedCount < maxAllowed);
                
                string errorMessage = string.Empty;
                if (!isValid)
                {
                    errorMessage = string.Format(
                        "Criticality marking limit reached. You can mark a maximum of {0} employee(s) out of your span of {1} employee(s) (25% limit). Currently {2} employee(s) are marked.",
                        maxAllowed, spanCount, currentMarkedCount);
                }
                
                return new Tuple<bool, int, int, int, string>(isValid, maxAllowed, currentMarkedCount, spanCount, errorMessage);
            }
        }

        /// <summary>
        /// Validate specific priority marking limit (P1: 5%, P2: 5%, P3: 15%)
        /// Returns: (isValid, maxAllowed, currentCount, spanCount, errorMessage)
        /// For small teams, rounds up to next higher number if percentage is in decimal
        /// </summary>
        public Tuple<bool, int, int, int, string> ValidatePriorityMarkingLimit(int employeeId, int appraisalCycleId, string priorityCode, decimal percentageLimit, int? roleId = null)
        {
            using (var repository = new RatingRepository())
            {
                // Get complete span count
                int spanCount = repository.GetCompleteSpanCount(employeeId, appraisalCycleId, roleId);
                
                // Get current marked count for this specific priority
                int currentMarkedCount = repository.GetCriticalityPriorityMarkedCount(employeeId, appraisalCycleId, priorityCode, roleId);
                
                // Calculate percentage of span count
                double maxAllowedDouble = spanCount * ((double)percentageLimit / 100.0);
                // Round up to next higher number for small teams (e.g., 1.2% or 1.7% becomes 2)
                int maxAllowed = (int)Math.Ceiling(maxAllowedDouble);
                
                // For small teams, allow minimum 1 person if desired % is < 1 headcount
                if (maxAllowed < 1)
                {
                    maxAllowed = 1;
                }
                
                // Check if adding one more would exceed the limit
                bool isValid = (currentMarkedCount < maxAllowed);
                
                string errorMessage = string.Empty;
                if (!isValid)
                {
                    errorMessage = string.Format(
                        "{0} marking limit reached. You can mark a maximum of {1} employee(s) out of your span of {2} employee(s) ({3}% limit). Currently {4} employee(s) are marked.",
                        priorityCode, maxAllowed, spanCount, percentageLimit, currentMarkedCount);
                }
                
                return new Tuple<bool, int, int, int, string>(isValid, maxAllowed, currentMarkedCount, spanCount, errorMessage);
            }
        }

        /// <summary>
        /// Maps stored CriticalityPriority (CriticalityMaster.Id as string, or legacy P1/P2/P3 text) to normalized P1/P2/P3 for validation and SP counts.
        /// </summary>
        private static string NormalizeCriticalityPriorityCode(string raw, IList<CriticalityMasterEntity> priorities)
        {
            if (string.IsNullOrWhiteSpace(raw) || priorities == null)
            {
                return null;
            }
            var t = raw.Trim();
            var upper = t.ToUpperInvariant();
            if (upper == "P1" || upper == "P2" || upper == "P3")
            {
                return upper;
            }
            if (int.TryParse(t, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out int id))
            {
                var row = priorities.FirstOrDefault(p => p.Id == id);
                if (row != null && !string.IsNullOrWhiteSpace(row.Value))
                {
                    var v = row.Value.Trim().ToUpperInvariant();
                    if (v == "P1" || v == "P2" || v == "P3")
                    {
                        return v;
                    }
                }
            }
            return null;
        }

        /// <summary>
        /// Save criticality details for an employee
        /// Applies role-based restrictions:
        /// - Overall 25%: Restricted at Inputter (1), Reviewer (2), Approver (3) level
        /// - P1 (5%), P2 (5%), P3 (15%): Restricted for Reviewer (2), Approver (3) only
        /// </summary>
        public int SaveCriticalityDetails(EmployeeRatingNormailizationDetailsEntity criticalityData)
        {
            using (var repository = new RatingRepository())
            {
                // Validate Criticality Priority if priority is selected
                if (!string.IsNullOrEmpty(criticalityData.CriticalityPriority))
                {
                    // Get the user who is saving (RatingGivenBy or current user)
                    int userId = criticalityData.RatingGivenBy ?? 0;
                    if (userId == 0)
                    {
                        throw new Exception("Unable to determine user for validation.");
                    }
                    
                    // Check if this employee already has criticality priority marked
                    int pepEmployeeId = criticalityData.PEPEmployeeId ?? 0;
                    int appraisalCycleId = criticalityData.AppraisalCycleId ?? 0;
                    
                    if (pepEmployeeId == 0 || appraisalCycleId == 0)
                    {
                        throw new Exception("Invalid employee or appraisal cycle information.");
                    }
                    
                    var priorities = repository.GetCriticalityPriorities();
                    var existingDetails = repository.GetCriticalityDetails(pepEmployeeId, appraisalCycleId);
                    string newNormCode = NormalizeCriticalityPriorityCode(criticalityData.CriticalityPriority, priorities);
                    string oldNormCode = existingDetails == null ? null : NormalizeCriticalityPriorityCode(existingDetails.CriticalityPriority, priorities);

                    bool hadPriority = existingDetails != null && !string.IsNullOrWhiteSpace(existingDetails.CriticalityPriority);
                    // Overall 25% cap counts employees newly given any priority — not edits to an already-prioritised employee (including P1↔P2↔P3 changes).
                    bool isNewOverallCriticalitySlot = !hadPriority;
                    // Per-bucket (P1/P2/P3) limits apply on first assignment or when moving to a different bucket; same-bucket edits (e.g. reasons only) skip.
                    bool samePriorityBucket = hadPriority && string.Equals(oldNormCode, newNormCode, StringComparison.Ordinal);
                    bool needPriorityBucketValidation = !samePriorityBucket;
                    
                    // Get role ID for validation
                    int? roleId = criticalityData.RoleId;
                    
                    // Determine priority code (P1, P2, P3) for bucket rules — use normalized code, not raw Id
                    string priorityCode = newNormCode ?? string.Empty;
                    
                    if (isNewOverallCriticalitySlot)
                    {
                        // Overall 25% validation - applies to Inputter (1), Reviewer (2), Approver (3)
                        if (roleId.HasValue && (roleId.Value == 1 || roleId.Value == 2 || roleId.Value == 3))
                        {
                            var overallValidation = ValidateCriticalityMarkingLimit(userId, appraisalCycleId, roleId);
                            if (!overallValidation.Item1)
                            {
                                throw new Exception(overallValidation.Item5);
                            }
                        }
                    }

                    if (needPriorityBucketValidation && roleId.HasValue && (roleId.Value == 2 || roleId.Value == 3))
                    {
                        decimal percentageLimit = 0;
                        if (priorityCode == "P1")
                        {
                            percentageLimit = 5;
                        }
                        else if (priorityCode == "P2")
                        {
                            percentageLimit = 5;
                        }
                        else if (priorityCode == "P3")
                        {
                            percentageLimit = 15;
                        }

                        if (percentageLimit > 0)
                        {
                            var priorityValidation = ValidatePriorityMarkingLimit(userId, appraisalCycleId, priorityCode, percentageLimit, roleId);
                            if (!priorityValidation.Item1)
                            {
                                throw new Exception(priorityValidation.Item5);
                            }
                        }
                    }
                }

                return repository.SaveCriticalityDetails(criticalityData);
            }
        }

        /// <summary>
        /// Remove all criticality fields for an employee/cycle (uses sp_RemoveCriticalityDetails).
        /// </summary>
        public int RemoveCriticalityDetails(int pepEmployeeId, int appraisalCycleId, int ratingGivenBy, int? roleId)
        {
            using (var repository = new RatingRepository())
            {
                var existing = repository.GetCriticalityDetails(pepEmployeeId, appraisalCycleId);
                if (existing == null)
                {
                    return 0;
                }
                bool hadCriticality =
                    !string.IsNullOrWhiteSpace(existing.CriticalityReasons) ||
                    !string.IsNullOrWhiteSpace(existing.CriticalityPriority) ||
                    !string.IsNullOrWhiteSpace(existing.AttritionRisk) ||
                    !string.IsNullOrWhiteSpace(existing.AttritionRiskReason) ||
                    !string.IsNullOrWhiteSpace(existing.ImmediateBackup) ||
                    !string.IsNullOrWhiteSpace(existing.SuccessorName);
                if (!hadCriticality)
                {
                    return 0;
                }

                return repository.RemoveCriticalityDetails(pepEmployeeId, appraisalCycleId, ratingGivenBy, roleId);
            }
        }

        /// <summary>
        /// Get Criticality Reasons master data from database
        /// </summary>
        public List<CriticalityMasterEntity> GetCriticalityReasons()
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCriticalityReasons();
            }
        }

        /// <summary>
        /// Get Criticality Priority master data from database
        /// </summary>
        public List<CriticalityMasterEntity> GetCriticalityPriorities()
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetCriticalityPriorities();
            }
        }

        /// <summary>
        /// Get Attrition Risk master data from database
        /// </summary>
        public List<CriticalityMasterEntity> GetAttritionRisks()
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetAttritionRisks();
            }
        }

        /// <summary>
        /// Get active employees in manager's span
        /// Excludes the employee for whom criticality details are being filled
        /// </summary>
        public List<EmployeeDropdownEntity> GetEmployeesInSpan(int managerId, int appraisalCycleId, int excludeEmployeeId = 0)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetEmployeesInSpan(managerId, appraisalCycleId, excludeEmployeeId);
            }
        }


        /// <summary>
        /// Get employee recognitions (awards) from Aspire database
        /// Accepts NewEmployeeCode, repository will look up OldEmployeeCode internally
        /// </summary>
        public List<EmployeeAspireAwardEntity> GetEmployeeAspireAwards(string newEmployeeCode, int appraisalCycleId)
        {
            using (var repository = new RatingRepository())
            {
                return repository.GetEmployeeAspireAwards(newEmployeeCode, appraisalCycleId);
            }
        }
        public DataSet GetCriticalityPriorityForDropdown()
        {
            try
            {
                using (var repository = new RatingRepository())
                {
                    return repository.GetCriticalityPriorityForDropdown();

                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

    }
}