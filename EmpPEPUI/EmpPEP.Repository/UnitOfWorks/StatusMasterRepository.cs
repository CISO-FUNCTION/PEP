using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class StatusMasterRepository : IDisposable, IBaseRepository<StatusMaster>
    {

         #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        public StatusMasterRepository()
        {
            context = new PEPEntities1();
        }

        #region Public Methods
        public List<StatusMaster> Get(string StatusType)
        {
            var query = (from b
                             in context.StatusMasters.Where(x => x.StatusFor == StatusType && 
                                                                 x.IsActive==1)  select b).ToList();
                //context.EmployeeKRAs.Where(x => x.EmployeeId==EmployeeId && x.KRAFromDate==fromDate && x.KRAToDate==toDate);
            return query != null ? query.ToList() : new List<StatusMaster>();
        }

        public StatusMaster Get(int statusMasterId)
        {
            StatusMaster query = context.Set<StatusMaster>().SingleOrDefault(x => x.StatusId == statusMasterId &&
                                                                                  x.IsActive == 1);
            return query != null ? query : new StatusMaster();
        }

        public int Insert(StatusMaster obj)
        {
            context.Set<StatusMaster>().Add(obj);
            return context.SaveChanges() ;
        }

        public bool Update(StatusMaster obj)
        {
            context.Set<StatusMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(StatusMaster obj)
        {
            StatusMaster mdStatusMaster = context.Set<StatusMaster>().Find(obj.StatusId);

            if (context.Entry(mdStatusMaster).State == EntityState.Detached)
                context.Set<StatusMaster>().Attach(mdStatusMaster);

            context.Set<StatusMaster>().Remove(mdStatusMaster);
            return context.SaveChanges() > 0 ? true : false;
        }

        public List<StatusMaster> Get()
        {
            IQueryable<StatusMaster> query = context.Set<StatusMaster>();
            return query.ToList();
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
