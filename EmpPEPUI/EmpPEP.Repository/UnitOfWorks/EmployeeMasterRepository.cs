using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using EmpPEP.Framework.Helper;
using System.Security.Cryptography;
using System.Text;
using System.IO;
using System.Data;
using EmpPEP.Repository.common;
using EmpPEP.BusinessEntities;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeMasterRepository : BaseDispose
    {
        SqlCommand cmdObj;
        string sectionName = "EmployeeMasterRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region Dispose Pattern
        protected override void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;

            // Call base class implementation.
            base.Dispose(disposing);
        }
        #endregion

        public EmployeeMasterRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #region Public Methods


        public List<Employees> GetEmployeesByRM(int RMID)
        {

            var getReporteeName = (from u in context.EmployeeMasters
                                   join empp in context.EmployeeManagerMappings on u.EmployeeId equals (empp.EmployeeDelegatorId != null ? empp.EmployeeDelegatorId : empp.EmployeeManagerId)
                                   join em in context.EmployeeMasters on empp.EmployeeId equals em.EmployeeId
                                   where em.IsActive == 1 && u.EmployeeId == RMID

                                   select new Employees
                                   {
                                       FirstName = em.FirstName,
                                       LastName = em.LastName,
                                       NewEmployeCode = em.NewEmployeeCode,
                                       EmployeeId = em.EmployeeId
                                   }).Distinct().OrderBy(a => a.FirstName).ToList();
            return getReporteeName != null ? getReporteeName : new List<Employees>();
        }


        public List<EmployeeMaster> GetEmployeeByName(string name, int? LocationId)
        {
            IQueryable<EmployeeMaster> query;
            if (LocationId == 0 || LocationId == null)
                query = context.EmployeeMasters.Where(x => (x.FirstName + " " + (x.LastName == null ? "" : x.LastName)).ToLower().Contains(name.ToLower()) && x.IsActive == 1);

            else
                query = context.EmployeeMasters.Where(x => ((x.FirstName + " " + (x.LastName == null ? "" : x.LastName)).Contains(name.ToLower())) && x.LocationId == LocationId && x.IsActive == 1);


            return query != null ? query.ToList() : new List<EmployeeMaster>();
        }

        public List<Employee> GetEmployeeByNames(string name, int? LocationId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new List<Employee>();

            string nameLower = name.Trim().ToLower();
            int? employeeIdFilter = null;
            int parsedId;
            if (int.TryParse(name.Trim(), out parsedId))
                employeeIdFilter = parsedId;

            List<Employee> query;
            if (LocationId == 0 || LocationId == null)
            {
                query = (from t1 in context.EmployeeMasters
                         join t2 in context.EmployeeManagerMappings on t1.EmployeeId equals t2.EmployeeId
                         where t1.IsActive == 1
                           && ((t1.FirstName + " " + (t1.LastName == null ? "" : t1.LastName)).ToLower().Contains(nameLower)
                              || (employeeIdFilter != null && t1.EmployeeId == employeeIdFilter.Value)
                              || (employeeIdFilter != null && t1.NewEmployeeCode != null && t1.NewEmployeeCode.Trim() == name.Trim()))
                         select new
                         {
                             EmployeeId = t1.EmployeeId,
                             EmployeeManagerId = t2.EmployeeDelegatorId == null ? t2.EmployeeManagerId : t2.EmployeeDelegatorId,
                             FirstName = t1.FirstName,
                             LastName = t1.LastName,
                             NewEmployeeCode = t1.NewEmployeeCode
                         }).ToList()
                         .Select(x => new Employee()
                         {
                             EmployeeId = x.EmployeeId,
                             EmployeeManagerId = x.EmployeeManagerId ?? 0,
                             FirstName = x.FirstName,
                             LastName = x.LastName,
                             NewEmployeeCode = x.NewEmployeeCode
                         }).ToList();
            }
            else
            {
                query = (from t1 in context.EmployeeMasters
                         join t2 in context.EmployeeManagerMappings on t1.EmployeeId equals t2.EmployeeId
                         where t1.LocationId == LocationId && t1.IsActive == 1
                           && ((t1.FirstName + " " + (t1.LastName == null ? "" : t1.LastName)).ToLower().Contains(nameLower)
                              || (employeeIdFilter != null && t1.EmployeeId == employeeIdFilter.Value)
                              || (employeeIdFilter != null && t1.NewEmployeeCode != null && t1.NewEmployeeCode.Trim() == name.Trim()))
                         select new Employee
                         {
                             EmployeeId = t1.EmployeeId,
                             EmployeeManagerId = t2.EmployeeManagerId,
                             FirstName = t1.FirstName,
                             LastName = t1.LastName,
                             NewEmployeeCode = t1.NewEmployeeCode
                         }).ToList()
                     .Select(x => new Employee()
                     {
                         EmployeeId = x.EmployeeId,
                         EmployeeManagerId = x.EmployeeManagerId,
                         FirstName = x.FirstName,
                         LastName = x.LastName,
                         NewEmployeeCode = x.NewEmployeeCode
                     }).ToList();
            }

            return query != null ? query : new List<Employee>();
        }


        public List<Employee> GetEmployeeByNamesbyLocationAdmin(string name, int EmpLoginId, int? LocationId)
        {
            List<Employee> query;
            query = (from t1 in context.EmployeeMasters
                     join t2 in context.EmployeeManagerMappings on t1.EmployeeId equals t2.EmployeeId

                     join t3 in context.PEPLocationWiseRights on EmpLoginId equals t3.empid
                     //on t1.EmployeeId equals t3.empid
                     //&& t1.LocationId == t3.locationId

                     where (t1.FirstName + " " + (t1.LastName == null ? "" : t1.LastName)).ToLower().Contains(name.ToLower()) && t3.locationId == t1.LocationId && t1.IsActive == 1
                     select new Employee
                     {
                         EmployeeId = t1.EmployeeId,
                         EmployeeManagerId = t2.EmployeeManagerId,
                         FirstName = t1.FirstName,
                         LastName = t1.LastName,
                         NewEmployeeCode = t1.NewEmployeeCode
                     }).ToList()
                 .Select(x => new Employee()
                 {

                     EmployeeId = x.EmployeeId,
                     EmployeeManagerId = x.EmployeeManagerId,
                     FirstName = x.FirstName,
                     LastName = x.LastName,
                     NewEmployeeCode = x.NewEmployeeCode
                 }).ToList();


            return query != null ? query : new List<Employee>();
        }


        public EmployeeMaster GetEmployeeManagerDetail(int EmployeeId)
        {
            EmployeeMaster query;

            query = (from t1 in context.EmployeeMasters
                     join t2 in context.EmployeeManagerMappings on t1.EmployeeId equals t2.EmployeeId
                     where (t1.EmployeeId == EmployeeId) && t1.IsActive == 1
                     select
                     new
                     {
                         EmployeeId = t2.EmployeeDelegatorId ?? t2.EmployeeManagerId
                     }).ToList().Select(x => new EmployeeMaster { EmployeeId = x.EmployeeId }).FirstOrDefault();

            return query;
        }

        public DataSet GetEmployeeDetails(int empNo)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeeDetails";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@empNo", SqlDbType.Int))
                .Value = empNo;
                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeeDetails");
            }

            return ds;
            // return context.Database.SqlQuery<EmployeeMaster>("exec GetEmpDetailsByEmpId @EmployeeId", new SqlParameter("EmployeeId", empNo));
            //EmployeeMaster query = context.EmployeeMasters.SingleOrDefault(x => x.EmployeeId == empNo);
            //return query;
        }
        public string GetEmployeeNumber(string empno)
        {
            string result = context.Database.SqlQuery<string>(
                "EXEC [dbo].[usp_GetEmployeeNumberFromAspire] @EmployeeNo", 
                new SqlParameter("@EmployeeNo", empno)).FirstOrDefault();
            return result;
        }

        public List<GetEmpDetailsByEmpId_Result> GetEmployeeDetailsById(int empId, int AppraisalCycleId)
        {
            return context.Database.SqlQuery<GetEmpDetailsByEmpId_Result>("exec GetEmpDetailsByEmpId @EmployeeId,@AppraisalCycleId", new SqlParameter("EmployeeId", empId), new SqlParameter("AppraisalCycleId", AppraisalCycleId)).ToList<GetEmpDetailsByEmpId_Result>();
        }
        public List<GetFeedbackCountForManagerDashboard_ResultEntity> GetEmployeeDetailsSkipLevelById(int ManagerId, int AppraisalCycleId)
        {
            return context.Database.SqlQuery<GetFeedbackCountForManagerDashboard_ResultEntity>("exec GetFeedbackCountForManagerDashboardSkipLevel @EmployeeId,@AppraisalCycleId", new SqlParameter("EmployeeId", ManagerId), new SqlParameter("AppraisalCycleId", AppraisalCycleId)).ToList<GetFeedbackCountForManagerDashboard_ResultEntity>();
        }

        public List<GetEmployeesByProjectId_Result> GetEmployeesByProjectId(int AppraisalCycleId, int ProjectId)
        {
            return context.Database.SqlQuery<GetEmployeesByProjectId_Result>("exec [dbo].[GetEmployeesByProjectId]  @AppraisalCycleId,@projectID", new SqlParameter("AppraisalCycleId", AppraisalCycleId), new SqlParameter("projectID", ProjectId)).ToList<GetEmployeesByProjectId_Result>();

        }

        public DataSet GetEmployeesByKRAStatusId(int KRAStatusId, int AppraisalCycleId, int ManagerId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmployeesByKRAStatusId";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@KRAStatusId", SqlDbType.Int))
                .Value = KRAStatusId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int))
                 .Value = AppraisalCycleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@ManagerId", SqlDbType.NVarChar))
             .Value = ManagerId;



                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetEmployeesByKRAStatusId");
            }

            return ds;
        }



        public DataSet GetEmployeeDetailsByDomainId(string domainId)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetEmpDetails";
                //string _sql = "GetEmpDetails_DEVTEST";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@EmpDomainId", SqlDbType.VarChar))
                .Value = domainId;

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSubordinatesByManagerIdForDashboard");
            }

            return ds;
            //GetEmpDetails_TEST3
            //GetEmpDetails_DEVTEST
            // return context.Database.SqlQuery<GetEmpDetails_Result>("exec GetEmpDetails @EmpDomainId", new SqlParameter("EmpDomainId", domainId)).ToList<GetEmpDetails_Result>();
        }

        //public List<GetSubordinatesByManagerIdForDashboard_Result> GetSubordinatesByManagerIdForDashboard(int ManagerEmployeeId, int AppraisalCyleId, string SelectSubcycle)
        //{
        //    return context.Database.SqlQuery<GetSubordinatesByManagerIdForDashboard_Result>("exec GetSubordinatesByManagerIdForDashboard @ManagerEmployeeId, @AppraisalCyleId,@SelectSubcycle", new SqlParameter("ManagerEmployeeId", ManagerEmployeeId), new SqlParameter("AppraisalCyleId", AppraisalCyleId), new SqlParameter("SelectSubcycle", SelectSubcycle)).ToList<GetSubordinatesByManagerIdForDashboard_Result>();
        //}

        public DataSet GetSubordinatesByManagerIdForDashboard(int ManagerEmployeeId, int AppraisalCyleId, string SelectSubcycle)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetSubordinatesByManagerIdForDashboard";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                cmdObj.Parameters
               .Add(new SqlParameter("@ManagerEmployeeId", SqlDbType.Int))
                .Value = ManagerEmployeeId;
                cmdObj.Parameters
                 .Add(new SqlParameter("@AppraisalCyleId", SqlDbType.Int))
                 .Value = AppraisalCyleId;

                cmdObj.Parameters
             .Add(new SqlParameter("@SelectSubcycle", SqlDbType.NVarChar))
             .Value = SelectSubcycle;



                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetSubordinatesByManagerIdForDashboard");
            }

            return ds;
        }



        public List<string> GetPreviousManager(int EmpNo)
        {
            return context.Database.SqlQuery<string>("exec GetPreviousManager @EmployeeId", new SqlParameter("EmployeeId", EmpNo)).ToList<string>();
        }
        //by garima to get employee grade
        public EmployeeGradeMaster GetEmployeesGrade(int employeeid)
        {
            IQueryable<EmployeeGradeMaster> query;


            query = from em in context.EmployeeMasters
                    join grade in context.EmployeeGradeMasters on em.EmployeeGradeId equals grade.EmployeeGradeId
                    where em.EmployeeId == employeeid && em.IsActive == 1
                    select grade;

            // return query.Select(x=>(int)x.GradeLevelForRM).FirstOrDefault();
            return query != null ? query.FirstOrDefault() : new EmployeeGradeMaster();

        }


        public List<EmployeeMaster> GetEmployeesByGradeId(int GradeId)
        {
            IQueryable<EmployeeMaster> query;
            query = context.EmployeeMasters.Where(x => (x.EmployeeGradeId == GradeId && x.IsActive == 1));
            return query != null ? query.ToList() : new List<EmployeeMaster>();
        }





        public List<EmployeeMaster> GetEmployeesByGradeIdForKRAUpload(int GradeId, int AppraisalCycleId)
        {
            var query = GetEmployeesByGradeId(GradeId);
            List<EmployeeMaster> grade_query = new List<EmployeeMaster>();
            foreach (var emp in query)
            {
                var KRAcheck = context.EmployeeKRAs.Where(b => b.EmployeeId == emp.EmployeeId && b.AppraisalCycleId == AppraisalCycleId).ToList();
                if (KRAcheck.Count <= 0)
                {
                    grade_query.Add(emp);
                }
            }
            return grade_query != null ? grade_query.ToList() : new List<EmployeeMaster>();
        }

        public EmployeeMaster Get(int id)
        {
            throw new NotImplementedException();
        }

        public int Insert(EmployeeMaster obj)
        {
            throw new NotImplementedException();
        }

        public bool Update(EmployeeMaster obj)
        {
            context.Set<EmployeeMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(EmployeeMaster obj)
        {
            throw new NotImplementedException();
        }

        public List<EmployeeMaster> Get()
        {
            throw new NotImplementedException();
        }

        public List<GetSubordinatesByManagerId_Result> GetSubordinatesByMgrId(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetSubordinatesByManagerId_Result>(query, parameters).ToList();
        }

        public List<GetSubordinatesByManagerId_Result> GetAllSubordinatesByMgrId(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetSubordinatesByManagerId_Result>(query, parameters).ToList();
        }

        public int GetRole(int EmployeeId)
        {
            //var Role = from E in context.EmployeeMasters
            //           where E.EmployeeId == EmployeeId
            //           select E.EmployeeRoleId
            //           ;


            var role = context.Database.SqlQuery<int>(
                "EXEC [dbo].[usp_GetEmployeeRoleId] @EmployeeId", 
                new SqlParameter("@EmployeeId", EmployeeId)).FirstOrDefault();
            return role;


        }

        public bool IsMyManager(int EmployeeId, int ManagerEmployeeId, int AppraisalCycleId)
        {
            AppraisalCycleMaster query = context.AppraisalCycleMasters
                    .SingleOrDefault(x => x.AppraisalCycleId == AppraisalCycleId);

            // Return false if AppraisalCycleMaster not found
            if (query == null)
            {
                return false;
            }

            int count = context.EmployeeManagerMappings
                .Where(x => x.EmployeeId.Equals(EmployeeId)
                     && (x.EmployeeManagerId == ManagerEmployeeId || x.EmployeeDelegatorId == ManagerEmployeeId)
                     && (
                            (x.FromDate <= query.StartDate && x.ToDate <= query.EndDate) ||
                            (x.FromDate <= query.StartDate && x.ToDate >= query.EndDate) ||
                            (x.FromDate >= query.StartDate && x.ToDate <= query.EndDate) ||
                            (x.FromDate >= query.StartDate && x.ToDate >= query.EndDate)

                         )
                 ).Count();

            return count > 0 ? true : false;
        }

        public bool IsSuperAdmin(int EmployeeId)
        {

            int Role = GetRole(EmployeeId);
            return Role == 5 ? true : false;
        }

        public bool IsActive(int EmployeeId)
        {
            var IsActive = from E in context.EmployeeMasters
                           where E.EmployeeId == EmployeeId
                           select E.IsActive;

            int flag = Convert.ToInt32(IsActive.FirstOrDefault());
            return flag == 1 ? true : false;
        }

        public bool IsActive(string DomainId)
        {
            var IsActive = context.EmployeeMasters.SingleOrDefault(x => x.DomainId == DomainId && x.IsActive == 1);
            if (IsActive == null)
                return false;
            else
                return true;
            //int flag = Convert.ToInt32(IsActive.FirstOrDefault());
            //return flag == 1 ? true : false;
        }

        public AppraisalCycleMaster GetAppraisalCycleCompanyWise(int CompanyId, int StatusId)
        {
            AppraisalCycleMaster query = context.AppraisalCycleMasters.SingleOrDefault(x => x.CompanyId == CompanyId && x.StatusId == StatusId);

            return query;
        }
        //Added by Kinjal
        //Gets manager names

        public List<Manager> GetManager(DateTime? ToDate, int LocationId)
        {
            var allowedLocation = new List<int>();
            if (LocationId == 0 || LocationId == null)
            {
                allowedLocation = (from l in context.LocationMasters
                                   select l.LocationId).ToList();
            }
            else
            {
                allowedLocation = (from x in context.LocationMasters
                                   where x.LocationId.Equals(LocationId)
                                   select x.LocationId).ToList();
            }

            var getMgrName = (from u in context.EmployeeMasters.Where(x => x.EmployeeRoleId >= 3)
                              where (allowedLocation.Contains(u.LocationId))
                              orderby u.FirstName
                              select new Manager
                              {
                                  FirstName = u.FirstName,
                                  LastName = u.LastName,
                                  NewEmployeCode = u.NewEmployeeCode,
                                  EmployeeId = u.EmployeeId
                              }).Distinct().OrderBy(a => a.FirstName).ToList();
            return getMgrName != null ? getMgrName : new List<Manager>();
        }
        public List<Manager> GetAllManager( int LocationId)
        {
            var allowedLocation = new List<int>();
            if (LocationId == 0 || LocationId == null)
            {
                allowedLocation = (from l in context.LocationMasters
                                   select l.LocationId).ToList();
            }
            else
            {
                allowedLocation = (from x in context.LocationMasters
                                   where x.LocationId.Equals(LocationId)
                                   select x.LocationId).ToList();
            }
            var getManagerList = (from empp in context.EmployeeManagerMappings
                                 join manager in context.EmployeeMasters on
                                     (empp.EmployeeDelegatorId != null ? empp.EmployeeDelegatorId : empp.EmployeeManagerId) equals manager.EmployeeId
                                 //where empp.EmployeeId == RMID && manager.IsActive == 1
                                 where (allowedLocation.Contains(manager.LocationId))
                                  select new Manager
                                 {
                                     FirstName = manager.FirstName,
                                     LastName = manager.LastName,
                                     NewEmployeCode = manager.NewEmployeeCode,
                                     EmployeeId = manager.EmployeeId
                                 }).Distinct().OrderBy(a => a.FirstName).ToList();
            return getManagerList != null ? getManagerList : new List<Manager>();
            //var getMgrName = (from u in context.EmployeeMasters.Where(x => x.EmployeeRoleId >= 3)
            //                  where (allowedLocation.Contains(u.LocationId))
            //                  orderby u.FirstName
            //                  select new Manager
            //                  {
            //                      FirstName = u.FirstName,
            //                      LastName = u.LastName,
            //                      NewEmployeCode = u.NewEmployeeCode,
            //                      EmployeeId = u.EmployeeId
            //                  }).Distinct().OrderBy(a => a.FirstName).ToList();
            //return getMgrName != null ? getMgrName : new List<Manager>();
        }

        public List<Employees> GetEmployees()
        {

            var getMgrName = (from u in context.EmployeeMasters.Where(x => x.IsActive == 1)
                              orderby u.FirstName
                              select new Employees
                              {
                                  FirstName = u.FirstName,
                                  LastName = u.LastName,
                                  NewEmployeCode = u.NewEmployeeCode,
                                  EmployeeId = u.EmployeeId
                              }).Distinct().OrderBy(a => a.FirstName).ToList();
            return getMgrName != null ? getMgrName : new List<Employees>();
        }

        public List<Manager> GetManagerByLocationadmin(DateTime? ToDate, int EmploginId)
        {
            var allowedLocation = new List<int?>();


            allowedLocation = (from x in context.PEPLocationWiseRights
                               where x.empid == EmploginId
                               select x.locationId).ToList();


            var getMgrName = (from u in context.EmployeeMasters.Where(x => x.EmployeeRoleId >= 3)
                              where (allowedLocation.Contains(u.LocationId))
                              orderby u.FirstName
                              select new Manager
                              {
                                  FirstName = u.FirstName,
                                  LastName = u.LastName,
                                  NewEmployeCode = u.NewEmployeeCode,
                                  EmployeeId = u.EmployeeId
                              }).Distinct().OrderBy(a => a.FirstName).ToList();
            return getMgrName != null ? getMgrName : new List<Manager>();
        }
        public class Manager
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string NewEmployeCode { get; set; }
            public int EmployeeId { get; set; }
        }
        public class Employees
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string NewEmployeCode { get; set; }
            public int EmployeeId { get; set; }
        }
        public List<GetEmployeeDUWise_Result> GetEmployeeByNameDUId(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeeDUWise_Result>(query, parameters).ToList();
        }
        public List<GetManagerListByDUId_Result> GetManagerListByDUId(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetManagerListByDUId_Result>(query, parameters).ToList();
        }
        public List<GetEmployeesByGradeIdDUIdForKRAUpload_Result> GetEmployeesByGradeIdForKRAUpload_DU(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeesByGradeIdDUIdForKRAUpload_Result>(query, parameters).ToList();
        }
        public string GetRatingDesciption(string Rating)
        {

            var ReturnRating = (from x in context.PEPRatingMasters
                                where x.Rating == Rating
                                select x.RatingName);
            return Convert.ToString(ReturnRating.FirstOrDefault());


        }
        public int GetAppraisalCycleId(string AppCycleName)
        {

            var AppCycleId = (from x in context.AppraisalCycleMasters
                              where x.AppraisalCycleName == AppCycleName
                              select x.AppraisalCycleId);
            return AppCycleId.FirstOrDefault();


        }
        public int BulkUpload(List<PEPEmployeeRating> obj)
        {
            List<PEPEmployeeRating> Errorlist = new List<PEPEmployeeRating>();
            PEPEmployeeRating PER = new PEPEmployeeRating();

            foreach (PEPEmployeeRating objCheck in obj)
            {
                EmployeeMaster checkdeactiveId = context.Set<EmployeeMaster>().SingleOrDefault(x => x.NewEmployeeCode.ToString() == objCheck.EmployeeId && x.IsActive == 0);

                if (checkdeactiveId != null)
                {
                    return 3;
                }

                List<PEPEmployeeRating> ratingFormatCheck1 = obj.Where((x => x.Rating != "EE" && x.Rating != "BE" && x.Rating != "ME")).ToList();

                if (ratingFormatCheck1.Count > 0)
                {
                    return 4;
                }
            }


            int Duplicatecount = obj.GroupBy(i => new { i.EmployeeId, i.AppraisalCycleName })
                   .Where(g => g.Count() > 1).ToList().Count;
            if (Duplicatecount > 0)
            {
                return 2;

            }


            foreach (PEPEmployeeRating objres in obj)
            {
                PEPEmployeeRating exsistingobj = context.PEPEmployeeRatings.Where(x => x.EmployeeId == objres.EmployeeId && x.AppraisalCycleId == objres.AppraisalCycleId).Select(x => x).FirstOrDefault();

                if (exsistingobj != null)
                {
                    exsistingobj.AppraisalCycleId = objres.AppraisalCycleId;
                    exsistingobj.Rating = EncryptString(objres.Rating);
                    exsistingobj.AppraisalCycleName = objres.AppraisalCycleName;
                    exsistingobj.RatingDesc = EncryptString(objres.RatingDesc);
                    exsistingobj.ModifiedOn = DateTime.Now;
                    exsistingobj.ModifiedBy = objres.ModifiedBy;
                    context.Set<PEPEmployeeRating>().Attach(exsistingobj);
                    context.Entry(exsistingobj).State = EntityState.Modified;

                }
                else
                {
                    context.Set<PEPEmployeeRating>().Add(new PEPEmployeeRating()
                    {
                        AppraisalCycleId = objres.AppraisalCycleId,
                        Rating = EncryptString(objres.Rating),
                        AppraisalCycleName = objres.AppraisalCycleName,
                        RatingDesc = EncryptString(objres.RatingDesc),
                        EmployeeId = objres.EmployeeId,
                        CreatedBy = objres.CreatedBy,
                        CreatedOn = DateTime.Now,
                        ModifiedBy = objres.ModifiedBy,
                        ModifiedOn = DateTime.Now,

                    });
                }
                context.SaveChanges();

            }

            return 1;

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
        public List<PEPEmployeeRating> GetAnnualrating(int EmployeeloginId, int AppraisalCycleId)
        {


            var getAnnualsRating = new List<PEPEmployeeRating>();

            if (AppraisalCycleId == 9)
            {
                getAnnualsRating = (from t1 in context.EmployeeRatingNormailizationDetails.Where(R => R.IsShowtoEmployee == true && R.IsAdminApproved == true)
                                    join t3 in context.AppraisalCycleMasters.Where(y => y.AppraisalCycleId == AppraisalCycleId) on t1.AppraisalCycleId equals t3.AppraisalCycleId
                                    join t2 in context.EmployeeMasters.Where(x => x.EmployeeId == EmployeeloginId) on t1.PEPEmployeeId equals t2.EmployeeId
                                    join t4 in context.PEPRatingNormalizationMasterEncryptions on t1.Rating equals t4.Encryptedvalue

                                    select new
                                    {
                                        AppraisalCycleId = t3.AppraisalCycleId,
                                        EmployeeId = t2.NewEmployeeCode,
                                        AppraisalCycleName = t3.AppraisalCycleName,
                                        RatingDesc = t4.RatingTextSeeToEmp
                                    }).Distinct().OrderBy(a => a.AppraisalCycleId).ToList()

               .Select(x => new PEPEmployeeRating()
               {
                   AppraisalCycleId = x.AppraisalCycleId,
                   EmployeeId = x.EmployeeId,
                   AppraisalCycleName = x.AppraisalCycleName,
                   RatingDesc = x.RatingDesc
               }).ToList();
                return getAnnualsRating != null ? getAnnualsRating : new List<PEPEmployeeRating>();

            }
            else
            {
                getAnnualsRating = (from t1 in context.PEPEmployeeRatings
                                    join t3 in context.AppraisalCycleMasters.Where(y => y.AppraisalCycleId == AppraisalCycleId) on t1.AppraisalCycleId equals t3.AppraisalCycleId
                                    join t2 in context.EmployeeMasters.Where(x => x.EmployeeId == EmployeeloginId) on t1.EmployeeId equals t2.NewEmployeeCode

                                    select new
                                    {
                                        AppraisalCycleId = t3.AppraisalCycleId,
                                        EmployeeId = t1.EmployeeId,
                                        AppraisalCycleName = t3.AppraisalCycleName,
                                        RatingDesc = t1.RatingDesc
                                    }).Distinct().OrderBy(a => a.AppraisalCycleId).ToList()

                    .Select(x => new PEPEmployeeRating()
                    {
                        AppraisalCycleId = x.AppraisalCycleId,
                        EmployeeId = x.EmployeeId,
                        AppraisalCycleName = x.AppraisalCycleName,
                        RatingDesc = DecryptString(x.RatingDesc)
                    }).ToList();
                return getAnnualsRating != null ? getAnnualsRating : new List<PEPEmployeeRating>();

            }


        }
        #endregion


    }
}
