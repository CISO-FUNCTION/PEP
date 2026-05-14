using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeAwardsRepository : IBaseRepository<EmployeeAward>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public EmployeeAwardsRepository()
        {
            context = new PEPEntities1();
        }
        #endregion
        
        #region "Public Methods"
        public List<EmployeeAward> Get()
        {
            IQueryable<EmployeeAward> query = context.Set<EmployeeAward>();
            return query.ToList();
        }

        public EmployeeAward Get(int id)
        {
            return context.EmployeeAwards.FirstOrDefault(x => x.AwardId == id);
        }

        public List<EmployeeAward> GetAwardByEmployeeId(int EmployeeId)
        {
            List<EmployeeAward> lstEmployeeAward = (from b in context.EmployeeAwards.Where(x => x.EmployeeId == EmployeeId) select b).ToList();
            return lstEmployeeAward;
        }

        public List<GetEmployeeAwards_Result> Get(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeeAwards_Result>(query, parameters).ToList();
        }

        public int Insert(EmployeeAward obj)
        {
            context.Set<EmployeeAward>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(EmployeeAward obj)
        {
            context.Set<EmployeeAward>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(EmployeeAward obj)
        {
            EmployeeAward employeeAward = context.Set<EmployeeAward>().Find(obj.AwardId);
            if (context.Entry(employeeAward).State == EntityState.Detached)
                context.Set<EmployeeAward>().Attach(employeeAward);
            context.Set<EmployeeAward>().Remove(employeeAward);
            return context.SaveChanges() > 0 ? true : false;
        }

        #endregion  

        #region  IDiosposable

        #region private variable
        private bool disposed = false;
        #endregion

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
}
