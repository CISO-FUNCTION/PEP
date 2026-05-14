using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeRoleMasterRepository : IBaseRepository<EmployeeRoleMaster>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public EmployeeRoleMasterRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        #region "Public Methods"
        public List<EmployeeRoleMaster> Get()
        {
            IQueryable<EmployeeRoleMaster> query = context.Set<EmployeeRoleMaster>();
            return query.ToList();
        }

        public EmployeeRoleMaster Get(int id)
        {
            return context.EmployeeRoleMasters.FirstOrDefault(x => x.EmployeeRoleId == id);
        }

        public List<GetEmployeeRoles_Result> Get(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetEmployeeRoles_Result>(query, parameters).ToList();
        }

        public int Insert(EmployeeRoleMaster obj)
        {
            context.Set<EmployeeRoleMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(EmployeeRoleMaster obj)
        {
            context.Set<EmployeeRoleMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(EmployeeRoleMaster obj)
        {
            EmployeeRoleMaster employeeRoleMaster = context.Set<EmployeeRoleMaster>().Find(obj.EmployeeRoleId);
            if (context.Entry(employeeRoleMaster).State == EntityState.Detached)
                context.Set<EmployeeRoleMaster>().Attach(employeeRoleMaster);
            context.Set<EmployeeRoleMaster>().Remove(employeeRoleMaster);
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
