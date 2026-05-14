using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class AreaRepository : IBaseRepository<AreaMaster>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public AreaRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        #region Public Methods
        public List<AreaMaster> Get()
        {
            IQueryable<AreaMaster> query = context.Set<AreaMaster>().Where(x=>x.IsActive==1);
            return query.ToList();
        }

        public AreaMaster Get(int id)
        {
            AreaMaster master = context.AreaMasters.Where(x => x.AreaID == id).FirstOrDefault();
            return master;
        }

        public int Insert(AreaMaster obj)
        {
            context.AreaMasters.Add(obj);
            return context.SaveChanges() ;
        }

        public bool Update(AreaMaster obj)
        {
            context.Set<AreaMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(AreaMaster obj)
        {
            AreaMaster master = context.Set<AreaMaster>().Find(obj.AreaID);

            if (context.Entry(master).State == EntityState.Detached)
                context.Set<AreaMaster>().Attach(master);

            context.Set<AreaMaster>().Remove(master);
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
