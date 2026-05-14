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
    public class EmployeeMasterBL
    {
        //private readonly PEPEntities context = null;
        //public EmployeeMasterBL()
        //{
        //    context = new PEPEntities();
        //}f
        public List<EmployeeMasterEntity> GetEmployeeByName(string name, int? LocationId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeByName(name, LocationId);

                if (empList.Any())
                {
                    return Utility.ConvertToList<EmployeeMaster, EmployeeMasterEntity>(empList);
                }
                return null;
            }
        }

        //   create by kaushal saini -- date:6 august 



        public List<Employee> GetEmployeeByNames(string name, int? LocationId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empListnew = repository.GetEmployeeByNames(name, LocationId);

                if (empListnew.Any())
                {
                    return Utility.ConvertToList<Employee, Employee>(empListnew);
                }
                return null;
            }
        }

        public List<Employee> GetEmployeeByNamesByLocationAdmin(string name, int? LocationId, int EmpLoginId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empListnew = repository.GetEmployeeByNamesbyLocationAdmin(name, EmpLoginId, LocationId);

                if (empListnew.Any())
                {
                    return Utility.ConvertToList<Employee, Employee>(empListnew);
                }
                return null;
            }
        }

        //kinjal to get employee details
        /// <summary>
        /// Maps <see cref="EmployeeMasterRepository.GetEmployeeDetails"/> DataSet row to entity.
        /// Note: Do not use Utility.ConvertToObject on a DataSet — column values are not copied and mail/recipient logic would see empty emails.
        /// </summary>
        public GetEmpDetailsByEmpId_ResultEntity GetEmployeeDetails(int empNo)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeDetails(empNo);
                return MapGetEmpDetailsFromDataSet(empList);
            }
        }

        public GetEmpDetailsByEmpId_ResultEntity GetEmployeeDetailsForEmail(int empNo)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeDetails(empNo);
                return MapGetEmpDetailsFromDataSet(empList);
            }
        }

        private static string RowString(DataRow row, string columnName)
        {
            if (row == null || row.Table == null || !row.Table.Columns.Contains(columnName) || row.IsNull(columnName))
                return string.Empty;
            return Convert.ToString(row[columnName]);
        }

        private static int RowInt(DataRow row, string columnName)
        {
            if (row == null || row.Table == null || !row.Table.Columns.Contains(columnName) || row.IsNull(columnName))
                return 0;
            return Convert.ToInt32(row[columnName]);
        }

        private static DateTime RowDate(DataRow row, string columnName)
        {
            if (row == null || row.Table == null || !row.Table.Columns.Contains(columnName) || row.IsNull(columnName))
                return DateTime.MinValue;
            return Convert.ToDateTime(row[columnName]);
        }

        private static GetEmpDetailsByEmpId_ResultEntity MapGetEmpDetailsFromDataSet(DataSet empList)
        {
            if (empList == null || empList.Tables.Count == 0 || empList.Tables[0].Rows.Count == 0)
                return null;
            try
            {
                var row = empList.Tables[0].Rows[0];
                return new GetEmpDetailsByEmpId_ResultEntity
                {
                    EmployeeId = RowInt(row, "EmployeeId"),
                    NewEmployeeCode = RowString(row, "NewEmployeeCode"),
                    OldEmployeeCode = RowString(row, "OldEmployeeCode"),
                    EmployeeRoleId = RowInt(row, "EmployeeRoleId"),
                    DomainId = RowString(row, "DomainId"),
                    FirstName = RowString(row, "FirstName"),
                    MiddleName = RowString(row, "MiddleName"),
                    LastName = RowString(row, "LastName"),
                    DateOfBirth = RowDate(row, "DateOfBirth"),
                    JoiningDate = RowDate(row, "JoiningDate"),
                    EmailAddress = RowString(row, "EmailAddress"),
                    IsActive = RowInt(row, "IsActive"),
                    LocationId = RowInt(row, "LocationId"),
                    EmployeeType = RowString(row, "EmployeeType"),
                };
            }
            catch
            {
                return null;
            }
        }





        public GetEmpDetailsByEmpId_ResultEntity GetEmployeeManagerDetail(int empNo)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeManagerDetail(empNo);

                if (empList != null)
                {
                    return (GetEmpDetailsByEmpId_ResultEntity)Utility.ConvertToObject(empList, new GetEmpDetailsByEmpId_ResultEntity());
                }
                return null;
            }

        }
        public string GetEmployeeNumber(string empNo)
        {
            if (string.IsNullOrWhiteSpace(empNo))
            {
                return null;
            }

            using (var repository = new EmployeeMasterRepository())
            {
                string empnumber = repository.GetEmployeeNumber(empNo.Trim());

                if (!string.IsNullOrEmpty(empnumber))
                {
                    return empnumber;
                }
                return null;
            }

        }

        public DataSet GetEmployeeDetailsByDomainId(string doaminId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeDetailsByDomainId(doaminId);

                //if (empList.Any())
                //{
                //    return (GetEmpDetails_ResultEntity)Utility.ConvertToObject(empList[0], new GetEmpDetails_ResultEntity());
                //}
                return empList;
            }
        }
        public List<GetEmpDetailsByEmpId_ResultEntity> GetEmployeeDetailsById(int empId, int AppraisalCycleId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeeDetailsById(empId, AppraisalCycleId);

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmpDetailsByEmpId_Result, GetEmpDetailsByEmpId_ResultEntity>(empList);
                }
                return null;
            }
        }
        //public List<GetFeedbackCountForManagerDashboard_ResultEntity> GetEmployeeDetailsSkipLevel (int ManagerId, int AppraisalCycleId)
        //{
        //    using (var repository = new EmployeeMasterRepository())
        //    {
        //        var empList = repository.GetEmployeeDetailsSkipLevelById(ManagerId , AppraisalCycleId);

        //        if (empList.Any())
        //        {
        //            return Utility.ConvertToList<GetFeedbackCountForManagerDashboard_Result, GetFeedbackCountForManagerDashboard_ResultEntity>(empList);
        //        }
        //        return null;
        //    }
        //}
        //changed by kinjal added Appraisal cycle id
        public List<GetSubordinatesByManagerId_ResultEntity> GetSubordinatesByManagerId(int ManagerEmployeeId, int AppraisalCyleId, string report="")
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@ManagerEmployeeId", ManagerEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCyleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            using (var employeeMasterRepository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();
                List<GetSubordinatesByManagerId_Result> Employees = new List<GetSubordinatesByManagerId_Result>();
                if (report=="GOFS")
                     Employees = employeeMasterRepository.GetSubordinatesByMgrId("EXEC dbo.[GetGOSubordinatesByManagerId] @ManagerEmployeeId,@AppraisalCyleId", parameters);
                else
                     Employees = employeeMasterRepository.GetSubordinatesByMgrId("EXEC dbo.[GetSubordinatesByManagerId] @ManagerEmployeeId,@AppraisalCyleId", parameters);
                if (Employees.Any())
                {
                    return Utility.ConvertToList<GetSubordinatesByManagerId_Result, GetSubordinatesByManagerId_ResultEntity>(Employees);
                }
            }
            return null;
        }

        public List<GetSubordinatesByManagerId_ResultEntity> GetSubordinatesByManagerIdForDelegator(int ManagerEmployeeId, int AppraisalCyleId)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;

            sqlParam = new SqlParameter("@ManagerEmployeeId", ManagerEmployeeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@AppraisalCyleId", AppraisalCyleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            using (var employeeMasterRepository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                var Employees = employeeMasterRepository.GetAllSubordinatesByMgrId("EXEC dbo.[GetAllSubordinatesByManagerId] @ManagerEmployeeId,@AppraisalCyleId", parameters);
                if (Employees.Any())
                {
                    return Utility.ConvertToList<GetSubordinatesByManagerId_Result, GetSubordinatesByManagerId_ResultEntity>(Employees);
                }
            }
            return null;

        }
        public List<GetSubordinatesByManagerId_ResultEntity> GetSubordinatesNameByManagerId(int ManagerEmployeeId, string Name, int AppraisalCyleId)
        {
            List<GetSubordinatesByManagerId_ResultEntity> empList = new List<GetSubordinatesByManagerId_ResultEntity>();
            empList = GetSubordinatesByManagerId(ManagerEmployeeId, AppraisalCyleId);

            if (empList != null)
            {

                var empMgrWise = empList.Where(x => x.FirstName.ToLower().Contains(Name.ToLower()) || x.LastName.ToLower().Contains(Name.ToLower())).ToList();
                return empMgrWise;
            }
            return null;
        }
        public List<string> GetPreviousManager(int Empno)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetPreviousManager(Empno);

                if (empList.Any())
                {
                    return empList;
                }
                return null;
            }
        }
        //changed by kinjal to handle locationadmin and superadmin
        public bool IsManager(int EmployeeId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                int RoleId = repository.GetRole(EmployeeId);
                if ((RoleId == Convert.ToInt32(EnumCollection.Role.Manager))
                    || (RoleId == Convert.ToInt32(EnumCollection.Role.LOBHead))
                    || (RoleId == Convert.ToInt32(EnumCollection.Role.SuperAdmin))
                    || (RoleId == Convert.ToInt32(EnumCollection.Role.LocationAdmin)
                    || (RoleId == Convert.ToInt32(EnumCollection.Role.DUwiseHR)))
                    )
                    return true;
                else
                    return false;
            }
        }

        public bool IsSuperAdmin(int EmployeeId, int AppraisalCycleId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                return repository.IsSuperAdmin(EmployeeId);
            }
        }


        public bool IsMyManager(int EmployeeId, int ManagerEmployeeId, int ApprisalCycleId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                return repository.IsMyManager(EmployeeId, ManagerEmployeeId, ApprisalCycleId);
            }
        }

        public ViewModelAppraisalCycleEntity GetAppraisalCycleCompanyWise(int ComapanyId, int Status)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var appList = repository.GetAppraisalCycleCompanyWise(ComapanyId, Status);

                if (appList != null)
                {
                    ViewModelAppraisalCycleEntity empApp = new ViewModelAppraisalCycleEntity();
                    return (ViewModelAppraisalCycleEntity)Utility.ConvertToObject(appList, empApp);
                }
                return null;
            }



        }
        public bool Put(int ToEmployeeId, int ByEmployeeId, int? RoleId)
        {
            try
            {

                //using (var appraisalcycle = new EmployeeMasterRepository())
                //{
                //    EmployeeMasterBL empmasterBL = new EmployeeMasterBL();

                //    using (var empMasterRepository = new EmployeeMasterRepository())
                //    {
                //        EmployeeMaster empMaster = empMasterRepository.GetEmployeeDetails(ToEmployeeId);
                //        if (empMaster != null)
                //        {

                //            empMaster.EmployeeRoleId = Convert.ToInt32(RoleId);
                //            empMaster.ModifiedBy = ByEmployeeId;
                //            empMaster.ModifiedOn = DateTime.Now;
                //            empMasterRepository.Update(empMaster);

                //        }
                //        using (var deliveryUnitRepository = new DeliveryUnitRepository())
                //        {
                //            DUwiseHRMapping duhr = deliveryUnitRepository.GetHRDUMapping(ToEmployeeId);
                //            if (duhr != null && RoleId != Convert.ToInt32(EnumCollection.Role.DUwiseHR))
                //            {
                //                deliveryUnitRepository.Delete(duhr);
                //            }

                //        }
                //    }
                return false;
                // }

            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public List<ManagerEntity> GetManager(int AppraisalCycleId, int LocationId)
        {
            DateTime FromDate;
            DateTime ToDate = DateTime.Today;
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
                using (var repository = new EmployeeMasterRepository())
                {

                    var mgrList = repository.GetManager(ToDate, LocationId);
                    if (mgrList.Any())
                    {
                        return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.EmployeeMasterRepository.Manager, ManagerEntity>(mgrList);
                    }
                    return null;
                }

            }

        }
        public List<ManagerEntity> GetAllManager( int LocationId)
        {
            //using (var appraisalcycle = new AppraisalCycleRepository())
            //{
               
                using (var repository = new EmployeeMasterRepository())
                {

                    var mgrList = repository.GetAllManager(LocationId);
                    if (mgrList.Any())
                    {
                        return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.EmployeeMasterRepository.Manager, ManagerEntity>(mgrList);
                    }
                    return null;
                }

            //}

        }

        public List<ManagerEntity> GetAllEmpList()
        {
            using (var repository = new EmployeeMasterRepository())
            {

                var mgrList = repository.GetEmployees();
                if (mgrList.Any())
                {
                    return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.EmployeeMasterRepository.Employees, ManagerEntity>(mgrList);
                }
                return null;
            }

        }


        public List<ManagerEntity> GetManagenyLocationAdmin(int AppraisalCycleId, int EmploginId)
        {
            DateTime FromDate;
            DateTime ToDate = DateTime.Today;
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
                using (var repository = new EmployeeMasterRepository())
                {

                    var mgrList = repository.GetManagerByLocationadmin(ToDate, EmploginId);
                    if (mgrList.Any())
                    {
                        return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.EmployeeMasterRepository.Manager, ManagerEntity>(mgrList);
                    }
                    return null;
                }

            }

        }

        public List<GetEmployeesByProjectIdEntity> GetEmployeeByProjectId(int AppraisalCycleId, int projectId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeesByProjectId(AppraisalCycleId, projectId);

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeesByProjectId_Result, GetEmployeesByProjectIdEntity>(empList);
                }
                return null;
            }
        }
        public DataSet GetEmployeesByKRAStatusId(int KRAStatusId, int AppraisalCycleId, int ManagerId)
        {
            DataSet getData;
            using (var repository = new EmployeeMasterRepository())
            {
                getData = repository.GetEmployeesByKRAStatusId(KRAStatusId, AppraisalCycleId, ManagerId);
            }
            return getData;
        }
        //public List<GetSubordinateByManagerIdForDashboardEntity> GetSubordinatesByManagerIdForDashboard(int ManagerId, int AppraisalCycleId, string SelectSubcycle)
        //{
        //    using (var repository = new EmployeeMasterRepository())
        //    {
        //        var empList = repository.GetSubordinatesByManagerIdForDashboard(ManagerId, AppraisalCycleId, SelectSubcycle);

        //        return Utility.ConvertToList<GetSubordinatesByManagerIdForDashboard_Result, GetSubordinateByManagerIdForDashboardEntity>(empList);

        //    }
        //}
        public DataSet GetSubordinatesByManagerIdForDashboard(int ManagerId, int AppraisalCycleId, string SelectSubcycle)
        {
            DataSet getData;
            using (var repository = new EmployeeMasterRepository())
            {

                getData = repository.GetSubordinatesByManagerIdForDashboard(ManagerId, AppraisalCycleId, SelectSubcycle);
            }


            return getData;

        }


        public List<GetEmployeeRoles_ResultEntity> GetEmployeesByGradeId(int GradeId, int AppraisalCycleId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                var empList = repository.GetEmployeesByGradeIdForKRAUpload(GradeId, AppraisalCycleId);
                List<GetEmployeeRoles_ResultEntity> getEmployees = new List<GetEmployeeRoles_ResultEntity>();
                if (empList.Any())
                {
                    foreach (var emp in empList)
                    {
                        GetEmployeeRoles_ResultEntity employee = new GetEmployeeRoles_ResultEntity();
                        employee.EmployeeId = emp.EmployeeId;
                        employee.EmployeeName = emp.FirstName + ' ' + emp.LastName;
                        employee.NewEmployeeCode = emp.NewEmployeeCode;
                        getEmployees.Add(employee);
                    }
                    getEmployees = getEmployees.OrderBy(x => x.EmployeeName).ToList();
                    return getEmployees;
                }
                return null;
            }
        }


        public bool IsActiveByDomainId(string DomainId)
        {
            using (var repository = new EmployeeMasterRepository())
            {
                return repository.IsActive(DomainId);
            }
        }

        public bool Put(int ToEmployeeId, int ByEmployeeId, int? RoleId, int DUId)
        {
            try
            {

                //using (var appraisalcycle = new EmployeeMasterRepository())
                //{
                //    EmployeeMasterBL empmasterBL = new EmployeeMasterBL();

                //    using (var empMasterRepository = new EmployeeMasterRepository())
                //    {
                //        EmployeeMaster empMaster = empMasterRepository.GetEmployeeDetails(ToEmployeeId);
                //        if (empMaster != null)
                //        {

                //            empMaster.EmployeeRoleId = Convert.ToInt32(RoleId);
                //            empMaster.ModifiedBy = ByEmployeeId;
                //            empMaster.ModifiedOn = DateTime.Now;
                //            empMasterRepository.Update(empMaster);

                //        }

                //    }
                //    using (var deliveryUnitRepository = new DeliveryUnitRepository())
                //    {
                //        DUwiseHRMapping duhr = deliveryUnitRepository.GetHRDUMapping(ToEmployeeId);
                //        if (duhr == null)
                //        {
                //            duhr = new DUwiseHRMapping();
                //            duhr.EmployeeId = ToEmployeeId;
                //            duhr.DUId = DUId;
                //            deliveryUnitRepository.Insert(duhr);
                //        }
                //        else
                //        {
                //            duhr.EmployeeId = ToEmployeeId;
                //            duhr.DUId = DUId;
                //            deliveryUnitRepository.Update(duhr);
                //        }
                //    }
                //    return true;
                //}
                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public bool Put(List<Tuple<int, int, int, string>> mylist)
        {
            try
            {

                //using (var appraisalcycle = new EmployeeMasterRepository())
                //{
                //    EmployeeMasterBL empmasterBL = new EmployeeMasterBL();

                //    using (var empMasterRepository = new EmployeeMasterRepository())
                //    {
                //        EmployeeMaster empMaster = empMasterRepository.GetEmployeeDetails(mylist[0].Item1);
                //        if (empMaster != null)
                //        {

                //            empMaster.EmployeeRoleId = Convert.ToInt32(mylist[0].Item3);
                //            empMaster.ModifiedBy = mylist[0].Item2;
                //            empMaster.ModifiedOn = DateTime.Now;
                //            empMasterRepository.Update(empMaster);

                //        }

                //    }
                //    using (var deliveryUnitRepository = new DeliveryUnitRepository())
                //    {
                //        List<DUwiseHRMapping> duhr = deliveryUnitRepository.GetListHRDUMapping(mylist[0].Item1);
                //        DUwiseHRMapping objDUwiseHRMapping = new DUwiseHRMapping();
                //        //if (duhr == null)
                //        //{
                //        //    duhr = new DUwiseHRMapping();
                //        //    duhr.EmployeeId = mylist[0].Item1;
                //        //    duhr.DUId = DUId;
                //        //    deliveryUnitRepository.Insert(duhr);
                //        //}
                //        //else
                //        //{
                //        //duhr.EmployeeId = ToEmployeeId;
                //        if (duhr != null)
                //        {
                //            foreach (var item in duhr)
                //            {
                //                deliveryUnitRepository.Delete(item);
                //            }
                //            foreach (Tuple<int, int, int, string> tuple in mylist)
                //            {

                //                objDUwiseHRMapping.EmployeeId = mylist[0].Item1;
                //                objDUwiseHRMapping.DUId = Convert.ToInt32(tuple.Item4);
                //                deliveryUnitRepository.Insert(objDUwiseHRMapping);

                //            }
                //        }
                //        if (duhr == null)
                //        {
                //            foreach (Tuple<int, int, int, string> tuple in mylist)
                //            {
                //                objDUwiseHRMapping.EmployeeId = mylist[0].Item1;
                //                objDUwiseHRMapping.DUId = Convert.ToInt32(tuple.Item4);
                //                deliveryUnitRepository.Insert(objDUwiseHRMapping);

                //            }
                //        }

                //        //}
                //    }
                //    return true;
                //}
                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }



        public List<GetEmployeeDUWise_ResultEntity> GetEmployeesLocationWise(string name, int EmpLoginID)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@SEARCH", name);
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@EMPID", EmpLoginID);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var repository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeeDUWise_Result> empList = repository.GetEmployeeByNameDUId("EXEC dbo.[GetEmployeeLocationWise] @SEARCH,@EMPID", parameters).ToList<GetEmployeeDUWise_Result>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeeDUWise_Result, GetEmployeeDUWise_ResultEntity>(empList);
                }
                return null;
            }
        }
        public List<GetEmployeeDUWise_ResultEntity> GetEmployeeByNameDUId(string name, int DUId)
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@SEARCH", name);
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DUID", DUId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            #endregion
            using (var repository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeeDUWise_Result> empList = repository.GetEmployeeByNameDUId("EXEC dbo.[GetEmployeeDUWise] @SEARCH,@DUID", parameters).ToList<GetEmployeeDUWise_Result>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeeDUWise_Result, GetEmployeeDUWise_ResultEntity>(empList);
                }
                return null;
            }
        }

        public List<GetManagerListByDUId_ResultEntity> GetManagerListByDUId(int AppraisalCycleId, int DUId) //added for duhrbp
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@DUID", DUId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            #endregion

            using (var repository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetManagerListByDUId_Result> empList = repository.GetManagerListByDUId("EXEC dbo.[GetManagerListByDUId] @DUId", parameters).ToList<GetManagerListByDUId_Result>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetManagerListByDUId_Result, GetManagerListByDUId_ResultEntity>(empList);
                }
                return null;
            }

        }

        public List<GetEmployeesByGradeIdDUIdForKRAUpload_ResultEntity> GetEmployeesByGradeId_DU(int GradeId, int AppraisalCycleId, int DUId) //added for duhrbp
        {
            #region "Parameter"
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@GradeId", GradeId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);

            sqlParam = new SqlParameter("@DUID", DUId);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            parameterList.Add(sqlParam);
            #endregion

            using (var repository = new EmployeeMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();

                List<GetEmployeesByGradeIdDUIdForKRAUpload_Result> empList = repository.GetEmployeesByGradeIdForKRAUpload_DU("EXEC dbo.[GetEmployeesByGradeIdDUIdForKRAUpload] @GradeId,@AppraisalCycleId,@DUId", parameters).ToList<GetEmployeesByGradeIdDUIdForKRAUpload_Result>(); ;

                if (empList.Any())
                {
                    return Utility.ConvertToList<GetEmployeesByGradeIdDUIdForKRAUpload_Result, GetEmployeesByGradeIdDUIdForKRAUpload_ResultEntity>(empList);
                }
                return null;
            }

        }
        public int BulkUploadEmpRating(List<PEPEmployeeRatingEntity> objRatingEntity)
        {
            //List<PEPEmployeeRatingEntity> data;
            int i = 0;
            using (var repository = new EmployeeMasterRepository())
            {

                List<PEPEmployeeRating> PEPrating = new List<PEPEmployeeRating>();


                foreach (var item in objRatingEntity)
                {

                    PEPEmployeeRating RatingObj = new PEPEmployeeRating();

                    RatingObj.EmployeeId = item.EmployeeId;
                    RatingObj.AppraisalCycleName = item.AppraisalCycleName;
                    RatingObj.Rating = item.Rating;
                    RatingObj.RatingDesc = repository.GetRatingDesciption(item.Rating);
                    RatingObj.CreatedBy = item.CreatedBy;
                    RatingObj.ModifiedBy = item.ModifiedBy;


                    if (repository.GetRatingDesciption(item.Rating) != "")
                    {

                        if (repository.GetAppraisalCycleId(item.AppraisalCycleName) != 0)
                        {
                            RatingObj.AppraisalCycleId = repository.GetAppraisalCycleId(item.AppraisalCycleName);
                            PEPrating.Add(RatingObj);
                        }
                        else
                        {

                            return 5;
                        }

                    }
                    else
                    {
                        return 0;

                    }
                }


                i = repository.BulkUpload(PEPrating);
            }
            return i;
        }

        public List<PEPEmployeeRatingEntity> GetAnnualrating(int EmpLogInId, int AppraisalCycleId)
        {
            List<PEPEmployeeRating> getAnnualsRating;
            // var getAnnualsRating = new List<PEPEmployeeRating>();
            using (var repository = new EmployeeMasterRepository())
            {

                getAnnualsRating = repository.GetAnnualrating(EmpLogInId, AppraisalCycleId);
            }


            return Utility.ConvertToList<PEPEmployeeRating, PEPEmployeeRatingEntity>(getAnnualsRating);

        }

    }
}
