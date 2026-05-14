using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class AppraisalTypeMasterRepository : IBaseRepository<AppraisalTypeMaster>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public AppraisalTypeMasterRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        #region "Public Methods"
        public List<AppraisalTypeMaster> Get()
        {
            IQueryable<AppraisalTypeMaster> query = context.Set<AppraisalTypeMaster>();
            return query.ToList();
        }

        public AppraisalTypeMaster Get(int id)
        {
            return context.AppraisalTypeMasters.FirstOrDefault(x => x.AppraisalTypeId == id);
        }

        public int Insert(AppraisalTypeMaster obj)
        {
            context.Set<AppraisalTypeMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(AppraisalTypeMaster obj)
        {
            context.Set<AppraisalTypeMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(AppraisalTypeMaster obj)
        {
            AppraisalTypeMaster mdAppraisalCycle = context.Set<AppraisalTypeMaster>().Find(obj.CompanyId);

            if (context.Entry(mdAppraisalCycle).State == EntityState.Detached)
                context.Set<AppraisalTypeMaster>().Attach(mdAppraisalCycle);

            context.Set<AppraisalTypeMaster>().Remove(mdAppraisalCycle);
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
