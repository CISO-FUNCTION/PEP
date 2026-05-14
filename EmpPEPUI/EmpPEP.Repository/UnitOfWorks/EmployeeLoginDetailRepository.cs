using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeLoginDetailRepository: BaseDispose, IBaseRepository<EmployeeLoginDetail>
    {
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

        public EmployeeLoginDetailRepository()
        {
            context = new PEPEntities1();
        }

        #region Public Methods

        public List<EmployeeLoginDetail> Get()
        {
            IQueryable<EmployeeLoginDetail> query = context.Set<EmployeeLoginDetail>();
            return query.ToList();
        }
        public EmployeeLoginDetail Get(int Id)
        {
            EmployeeLoginDetail query = context.Set<EmployeeLoginDetail>().SingleOrDefault(x => x.EmployeeId == Id );
            return query != null ? query : new EmployeeLoginDetail();
        }

        public EmployeeLoginDetail Get(int Id,string Token)
        {
            //EmployeeLoginDetail query = context.Set<EmployeeLoginDetail>().SingleOrDefault(x => x.EmployeeId == Id && x.Token==Token);
            //return query != null? query : new EmployeeLoginDetail();

            DateTime oneHourAgo = DateTime.Now.AddHours(-1); // Calculate the timestamp for 1 hour ago

            EmployeeLoginDetail query = context.Set<EmployeeLoginDetail>()
                .SingleOrDefault(x =>
                    x.EmployeeId == Id &&
                    x.Token == Token &&
                    x.IsActive == 1 &&
                    x.CreatedOn >= oneHourAgo // Compare CreatedOn within the last 1 hour
                );

            return query != null ? query : new EmployeeLoginDetail();
        }

        public bool hasTokenExpired(int Id, string Token)
        {
            EmployeeLoginDetail query = context.Set<EmployeeLoginDetail>().SingleOrDefault(x => x.EmployeeId == Id && x.Token == Token);
            if (query != null)
            {
                TimeSpan diff = DateTime.Now - query.LoginDate.Value;
                int sessiontimeout_min = Convert.ToInt32(ConfigurationManager.AppSettings["UserSessionTimeoutMinutes"].ToString());
                if (diff.Minutes <= sessiontimeout_min)
                {
                    return false;
                }
            }
            return true;
        }

        public int Insert(EmployeeLoginDetail obj)
        {
            context.Set<EmployeeLoginDetail>().Add(obj);
            return context.SaveChanges() ;
        }
        public int InsertLog(EmployeePEPLoginLog obj1)
        {
            context.Set<EmployeePEPLoginLog>().Add(obj1);
            return context.SaveChanges();
        }


        public int InsertException(tblExceptionLogging obj)
        {
            context.Set<tblExceptionLogging>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(EmployeeLoginDetail obj)
        {
            context.Set<EmployeeLoginDetail>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool UpdateLogin(EmployeeLoginDetail obj)
        {
            EmployeeLoginDetail objpep_employeelogindetails = context.EmployeeLoginDetails.Where(x => x.EmployeeId == obj.EmployeeId).OrderByDescending(x => x.LoginDate).Take(1).Select(x => x).FirstOrDefault();
            objpep_employeelogindetails.IsActive = obj.IsActive;
            objpep_employeelogindetails.LoginDate = obj.LoginDate;
            context.Set<EmployeeLoginDetail>().Attach(objpep_employeelogindetails);
            context.Entry(objpep_employeelogindetails).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(EmployeeLoginDetail obj)
        {
            EmployeeLoginDetail mdEmployee = context.Set<EmployeeLoginDetail>().SingleOrDefault(x => x.EmployeeId == obj.EmployeeId && x.Token==obj.Token);
            if (context.Entry(mdEmployee).State == EntityState.Detached)
                context.Set<EmployeeLoginDetail>().Attach(mdEmployee);

            context.Set<EmployeeLoginDetail>().Remove(mdEmployee);
            return context.SaveChanges() > 0 ? true : false;
        }

        #endregion
    }
}
