using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;

namespace EmpPEP.BusinessLayer
{
    public class DelegatorBL
    {

        public bool Put(int AppraisalCycleId, int FromEmployeeId, int EmpMgrMapId, int ToEmployeeId, string Action)
        {
            try
            {
                DateTime FromDate;
                DateTime ToDate = DateTime.Today;
                int PreviousDelegator = 0;
                using (var appraisalcycle = new AppraisalCycleRepository())
                {
                    AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                    AppraisalCycleMaster appraisalMaster = appraisalcycle.Get(AppraisalCycleId);
                    if (appraisalMaster != null)
                    {
                        FromDate = appraisalMaster.StartDate;
                        ToDate = appraisalMaster.EndDate;
                    }
                    else
                    {

                    }
                    // EmployeeManagerMappingEntity employeeMgrMappingEntity = new EmployeeManagerMappingEntity();
                    DelegatorBL dlegatorBL = new DelegatorBL();
                    using (var empManagerMappingRepository = new DelegatorRepository())
                    {
                        EmployeeManagerMapping employeeMgrMapping = empManagerMappingRepository.Get(EmpMgrMapId);
                        if (employeeMgrMapping != null)
                        {
                            PreviousDelegator = Convert.ToInt32(employeeMgrMapping.EmployeeDelegatorId);

                            if (Action == "U")
                            {
                                employeeMgrMapping.EmployeeDelegatorId = ToEmployeeId;
                            }
                            else
                            {
                                // ToEmployeeId = Convert.ToInt32(employeeMgrMapping.EmployeeDelegatorId);
                                employeeMgrMapping.EmployeeDelegatorId = null;

                            }
                            employeeMgrMapping.ModifiedBy = FromEmployeeId;
                            employeeMgrMapping.ModifiedOn = DateTime.Now;
                            empManagerMappingRepository.Update(employeeMgrMapping);
                            EmployeeMasterBL empMasterBL = new EmployeeMasterBL();

                            EmployeeMasterBL empmasterBL = new EmployeeMasterBL();

                            using (var empMasterRepository = new EmployeeMasterRepository())
                            {
                                DataSet empMaster;
                                var lstSubordinates = empmasterBL.GetSubordinatesByManagerId(ToEmployeeId, AppraisalCycleId);
                                if (Action == "U")
                                {
                                    empMaster = empMasterRepository.GetEmployeeDetails(ToEmployeeId);
                                }
                                else
                                {
                                    empMaster = empMasterRepository.GetEmployeeDetails(PreviousDelegator);
                                }

                                if (Action == "U")
                                {
                                    lstSubordinates = empmasterBL.GetSubordinatesByManagerId(ToEmployeeId, AppraisalCycleId);
                                }
                                else
                                {
                                    lstSubordinates = empmasterBL.GetSubordinatesByManagerId(PreviousDelegator, AppraisalCycleId);
                                }

                                if (Action == "U")
                                {
                                    if (Convert.ToInt32(empMaster.Tables[0].Rows[0]["EmployeeRoleId"]) == Convert.ToInt32(EnumCollection.Role.User))
                                    {
                                        bool updateRole = empMasterBL.Put(ToEmployeeId, FromEmployeeId, Convert.ToInt32(EnumCollection.Role.Manager));
                                        if (updateRole == true)
                                        {
                                            return true;
                                        }
                                    }
                                }

                                if (Action == "D")
                                {
                                    if (lstSubordinates == null)
                                    {
                                        bool updateRole = empMasterBL.Put(PreviousDelegator, FromEmployeeId, Convert.ToInt32(EnumCollection.Role.User));
                                        if (updateRole == true)
                                        {
                                            return true;
                                        }
                                    }
                                }


                            }


                        }

                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }


        }

        public List<ValidationsEntity> Validations(int AppraisalCycleId, int FromEmployeeId, int EmpMgrMapId, int ToEmployeeId, string Action)
        {
            List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();



            //Date Validations
            ValidationHelper helper = new ValidationHelper();
            using (var empManagerMappingRepository = new DelegatorRepository())
            {
                var MappingDetails = empManagerMappingRepository.Get(EmpMgrMapId);

                using (var obj = new EmployeeMasterRepository())
                {
                    DataSet empdetails = obj.GetEmployeeDetails(MappingDetails.EmployeeId);


                    if (MappingDetails.EmployeeManagerId == ToEmployeeId)
                    {
                        validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Delegator you have selected is already a manager."));
                    }
                    if (MappingDetails.EmployeeId == ToEmployeeId)
                    {
                        validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Employee can not be delegator for him/her self"));
                    }
                    if (Action == "U")
                    {
                        EmployeeGradeMaster delegatorGrade = obj.GetEmployeesGrade(ToEmployeeId);
                        EmployeeGradeMaster employeeGrade = obj.GetEmployeesGrade(MappingDetails.EmployeeId);

                        //by garima for delegator grade check
                        if (delegatorGrade.GradeLevelForRM <= 3 && delegatorGrade.EmployeeGradeName != "C")
                        {
                            validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Delegator Grade should be greater than G3-B"));

                        }
                        if (delegatorGrade.GradeLevelForRM <= employeeGrade.GradeLevelForRM && delegatorGrade.EmployeeGradeName != "C")
                        {
                            validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Delegator's Grade should not be below or equal level of employee"));
                        }
                    }
                    EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();
                    bool IsCurrentManager = employeeMasterBL.IsMyManager(MappingDetails.EmployeeId, ToEmployeeId, AppraisalCycleId);
                    if (IsCurrentManager)
                    {
                        validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Delegator you have selected is already a manager."));
                    }
                    int PreviousDelegator = 0;
                    EmployeeManagerMapping employeeMgrMapping = empManagerMappingRepository.Get(EmpMgrMapId);
                    PreviousDelegator = Convert.ToInt32(employeeMgrMapping.EmployeeDelegatorId);
                    if (Action == "D" && PreviousDelegator == 0)
                    {
                        validationsEntity.Add(helper.CreateValidation("To Employee", empdetails.Tables[0].Rows[0]["FirstName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["LastName"].ToString() + ' ' + empdetails.Tables[0].Rows[0]["NewEmployeeCode"].ToString(), "Employee doesn't have a delegator to delete"));
                    }
                }
            }

            return validationsEntity;
        }

        public EmployeeManagerMappingEntity GetEmployeeMappingDetails(int MappingId)
        {
            EmployeeManagerMapping obj = new EmployeeManagerMapping();
            using (var empManagerMappingRepository = new DelegatorRepository())
            {

                EmployeeManagerMappingEntity employeeManagerMappingEntity = (EmployeeManagerMappingEntity)Utility.ConvertToObject(empManagerMappingRepository.Get(MappingId), new EmployeeManagerMappingEntity());
                return employeeManagerMappingEntity;
            }
        }
    }

}
