using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class CompanyMasterRepository: IBaseRepository<CompanyMaster>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public CompanyMasterRepository()
        {
            context = new PEPEntities1();
        }
        #endregion
        
        #region "Public Methods"
        public List<CompanyMaster> Get()
        {
            IQueryable<CompanyMaster> query = context.Set<CompanyMaster>();
            return query.ToList();
        }

        public CompanyMaster Get(int id)
        {
            return context.CompanyMasters.FirstOrDefault(x => x.CompanyId == id) ;
        }

        public int Insert(CompanyMaster obj)
        {
            context.Set<CompanyMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(CompanyMaster obj)
        {
            context.Set<CompanyMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(CompanyMaster obj)
        {
            CompanyMaster mdAppraisalCycle = context.Set<CompanyMaster>().Find(obj.CompanyId);

            if (context.Entry(mdAppraisalCycle).State == EntityState.Detached)
                context.Set<CompanyMaster>().Attach(mdAppraisalCycle);

            context.Set<CompanyMaster>().Remove(mdAppraisalCycle);
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
