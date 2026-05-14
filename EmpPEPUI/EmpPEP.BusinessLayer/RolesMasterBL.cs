using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class RoleMasterBL
    {
        #region "Public Methods"

        public List<AppraisalCycleEntity> Get()
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                var md_AppraisalCycle = appraisalCycleRepository.Get();

                if (md_AppraisalCycle.Any())
                {
                    return Utility.ConvertToList<AppraisalCycleMaster, AppraisalCycleEntity>(md_AppraisalCycle);

                }
                return null;
            }
        }
        public List<AppraisalCycleYearbreakupDetailEntity> GetDetail(DateTime performCycleCheck, string Type)
        {

            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                var md_AppraisalCycles = appraisalCycleRepository.GetDetail(performCycleCheck, Type);

                if (md_AppraisalCycles.Any())
                {
                    return Utility.ConvertToList<AppraisalCycleYearbreakupDetail, AppraisalCycleYearbreakupDetailEntity>(md_AppraisalCycles);

                }
                return null;
            }
        }
        public DataSet GetAllDetail(DateTime performCycleCheck, string Type, string DropDownCheck)
        {
            DataSet dataDs=null;
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                dataDs = appraisalCycleRepository.GetAllDetail(performCycleCheck, Type, DropDownCheck);
            }

            return dataDs;
        }
        public AppraisalCycleEntity Get(int id)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                AppraisalCycleEntity appraisalCycleEntity = (AppraisalCycleEntity)Utility.ConvertToObject(appraisalCycleRepository.Get(id), new AppraisalCycleEntity());
                return appraisalCycleEntity;
            }
        }

        public List<GetAllAppraisalCycles_ResultEntity> Get(int id, string something)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@AppraisalCycleId", id);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();
                var AppCycle = appraisalCycleRepository.Get("EXEC dbo.[GetAllAppraisalCycles] @AppraisalCycleId", parameters);
                if (AppCycle.Any())
                {
                    return Utility.ConvertToList<GetAllAppraisalCycles_Result, GetAllAppraisalCycles_ResultEntity>(AppCycle);
                }
                return null;
            }
        }

        public List<AppraisalCycleEntity> GetByCompanyId(int CompanyId, int StatusId)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                var md_AppraisalCycle = appraisalCycleRepository.GetByCompanyId(CompanyId);
                if (md_AppraisalCycle.Any())
                {
                    return Utility.ConvertToList<AppraisalCycleMaster, AppraisalCycleEntity>(md_AppraisalCycle);

                }
            }
            return null;
        }


        public DataSet GetAllActiveCycle()
        {
           
            DataSet dataDs;
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                dataDs = appraisalCycleRepository.GetActiveCycle();
            }


            return dataDs;
        }


        
        public DataSet GetSelfAssesmentCycle(int AppCycleId)
        {
            DataSet dataDs;
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                dataDs = appraisalCycleRepository.GetSelectSelfAssesmentCycle(AppCycleId);
            }


            return dataDs;

        }




        public AppraisalCycleEntity GetCurrent(int CompanyId)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleEntity appraisalCycleEntity = new AppraisalCycleEntity();
                var md_AppraisalCycle = appraisalCycleRepository.GetCurrent(CompanyId);
                if (md_AppraisalCycle != null)
                {
                    return (AppraisalCycleEntity)Utility.ConvertToObject(md_AppraisalCycle, appraisalCycleEntity);

                }
            }
            return null;
        }

        public bool Put(AppraisalCycleEntity appraisalCycleEntity)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleMaster appraisalCycle = appraisalCycleRepository.Get(appraisalCycleEntity.AppraisalCycleId);
                if (appraisalCycle != null)
                {
                    appraisalCycle.AppraisalCycleName = appraisalCycleEntity.AppraisalCycleName;
                    appraisalCycle.AppraisalCycleDesc = appraisalCycleEntity.AppraisalCycleDesc;
                    appraisalCycle.EndDate = appraisalCycleEntity.EndDate;
                    appraisalCycle.StartDate = appraisalCycleEntity.StartDate;
                    appraisalCycle.StatusId = appraisalCycleEntity.StatusId;
                    appraisalCycle.AppraisalTypeId = appraisalCycleEntity.AppraisalTypeId;
                    appraisalCycle.IsActive = appraisalCycleEntity.IsActive;
                    appraisalCycle.ModifiedBy = appraisalCycleEntity.ModifiedBy;
                    appraisalCycle.ModifiedOn = DateTime.Now;
                    return appraisalCycleRepository.Update(appraisalCycle);
                }
                return false;
            }
        }

        public int Post(AppraisalCycleEntity appraisalCycleEntity)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleMaster appraisalCycleMaster = new AppraisalCycleMaster();
                appraisalCycleMaster = (AppraisalCycleMaster)Utility.ConvertToObject(appraisalCycleEntity, appraisalCycleMaster);
                appraisalCycleMaster.CreatedOn = DateTime.Now;
                return appraisalCycleRepository.Insert(appraisalCycleMaster);
            }
        }

        public ValidationsEntity Validations(AppraisalCycleEntity appraisalCycleEntity)
        {
            ValidationHelper helper = new ValidationHelper();
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                if (appraisalCycleEntity.EndDate == null || appraisalCycleEntity.StartDate == null || appraisalCycleEntity.AppraisalCycleName == "" || appraisalCycleEntity.AppraisalCycleDesc == "")
                {
                    return helper.CreateValidation("Empty Fields", appraisalCycleEntity.EndDate.ToString(), "All fields need to be filled.");
                }
                //if (appraisalCycleEntity.CompanyId == 0)
                //{
                //    return helper.CreateValidation("Company", appraisalCycleEntity.CompanyId.ToString(), "Please select a company.");
                //}

                if (appraisalCycleEntity.AppraisalCycleName.Contains("<") || appraisalCycleEntity.AppraisalCycleName.Contains(">") || appraisalCycleEntity.AppraisalCycleName.Contains("'") || appraisalCycleEntity.AppraisalCycleName.Contains("="))
                {
                    return helper.CreateValidation("AppraisalCycleName", appraisalCycleEntity.AppraisalCycleName.ToString(), "Please enter valid text. < , > ,',= are not allowed");
                }
                if (appraisalCycleEntity.AppraisalCycleDesc.Contains("<") || appraisalCycleEntity.AppraisalCycleDesc.Contains(">") || appraisalCycleEntity.AppraisalCycleDesc.Contains("'") || appraisalCycleEntity.AppraisalCycleName.Contains("="))
                {
                    return helper.CreateValidation("AppraisalCycleDesc", appraisalCycleEntity.AppraisalCycleDesc.ToString(), "Please enter valid text.< , > ,',= are not allowed");
                }
                if (appraisalCycleEntity.AppraisalTypeId == 0)
                {
                    return helper.CreateValidation("AppraisalType", appraisalCycleEntity.AppraisalTypeId.ToString(), "Please select an appraisal type.");
                }
                if (appraisalCycleEntity.EndDate < appraisalCycleEntity.StartDate)
                {
                    return helper.CreateValidation("EndDate", appraisalCycleEntity.EndDate.ToString(), "End date should be greater than Start date.");
                }
                if (appraisalCycleEntity.EndDate == appraisalCycleEntity.StartDate)
                {
                    return helper.CreateValidation("EndDate", appraisalCycleEntity.EndDate.ToString(), "Please enter a vaild period.");
                }
                AppraisalCycleMaster appraisalCycleMaster = appraisalCycleRepository.GetCurrent(0);
                if ((appraisalCycleEntity.StatusId == Convert.ToInt64(EnumCollection.APPRAISALCYCLE.Started)) || (appraisalCycleEntity.StatusId == Convert.ToInt64(EnumCollection.APPRAISALCYCLE.Initialised)))
                {
                    if (appraisalCycleMaster != null)
                    {
                        if (appraisalCycleMaster.AppraisalCycleId != appraisalCycleEntity.AppraisalCycleId)
                        {
                            if (appraisalCycleEntity.StartDate > appraisalCycleMaster.StartDate && appraisalCycleEntity.StartDate < appraisalCycleMaster.EndDate)
                            {
                                return helper.CreateValidation("Date", appraisalCycleEntity.StartDate.ToString(), "The start date is overlapping the current appraisal cycle.");
                            }
                            else
                            {
                                if (appraisalCycleEntity.StatusId == Convert.ToInt64(EnumCollection.APPRAISALCYCLE.Initialised))
                                {
                                    if (appraisalCycleEntity.StartDate <= appraisalCycleMaster.EndDate)
                                        return helper.CreateValidation("Date", appraisalCycleEntity.StartDate.ToString(), "The new appraisal cycle must have a start date greater than current cycle.");
                                }
                                // else

                                //return helper.CreateValidation("Date", appraisalCycleEntity.StartDate.ToString(), "To insert a new active cycle please ensure the previous active cycle is complete.");
                            }
                        }
                    }
                    else
                    {
                        var allappraisals = appraisalCycleRepository.Get();
                        var completedAppraisals = allappraisals.Where(x => x.StatusId == Convert.ToInt64(EnumCollection.APPRAISALCYCLE.Completed)).ToList();
                        if (completedAppraisals != null)
                            if (completedAppraisals.Count > 0)
                            {
                                foreach (var appraisal in completedAppraisals)
                                {
                                    if (appraisalCycleEntity.StartDate < appraisal.StartDate && appraisalCycleEntity.StartDate < appraisal.EndDate)
                                        return helper.CreateValidation("Date", appraisalCycleEntity.StartDate.ToString(), "Please check the date.");
                                }
                                var MaxEndDate = completedAppraisals.OrderByDescending(t => t.EndDate).First().EndDate.AddDays(1);
                                if (appraisalCycleEntity.StartDate != MaxEndDate)
                                {
                                    return helper.CreateValidation("StartDate", appraisalCycleEntity.StartDate.ToString(), "The next appraisal cycle should begin on the " + MaxEndDate.ToString("dd-MM-yyyy"));
                                }
                            }
                    }
                }
                if (appraisalCycleEntity.StatusId == Convert.ToInt64(EnumCollection.APPRAISALCYCLE.Completed))
                {
                    if (appraisalCycleEntity.StartDate > appraisalCycleMaster.EndDate && appraisalCycleEntity.AppraisalCycleId != appraisalCycleMaster.AppraisalCycleId)
                    {
                        return helper.CreateValidation("Status", appraisalCycleEntity.StatusId.ToString(), "Cannot mark this cycle as Completed.");
                    }
                }
            }
            return null;
        }

        public bool Delete(int id)
        {
            using (var appraisalCycleRepository = new AppraisalCycleRepository())
            {
                AppraisalCycleMaster appraisalCycleMaster = new AppraisalCycleMaster();
                appraisalCycleMaster.AppraisalCycleId = id;
                return appraisalCycleRepository.Delete(appraisalCycleMaster);
            }
        }

        #endregion  
    }
}
