using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class DeliveryUnitRepository : IDisposable
    {

        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        public DeliveryUnitRepository()
        {
            context = new PEPEntities1();
        }

        #region Public Methods
        public IEnumerable<GetAllDeliveryUnitFromAspire_Result> GetAllDeliveryUnitFromAspire(string query)
        {
            return context.Database.SqlQuery<GetAllDeliveryUnitFromAspire_Result>(query).ToList<GetAllDeliveryUnitFromAspire_Result>();
        }

        public DUwiseHRMapping GetHRDUMapping(int Id)
        {
            DUwiseHRMapping query = context.Set<DUwiseHRMapping>().SingleOrDefault(x => x.EmployeeId == Id);
            return query != null ? query : null;
        }
        public List<DUwiseHRMapping> GetListHRDUMapping(int Id)
        {
            List<DUwiseHRMapping> query = context.DUwiseHRMappings.Where(x => x.EmployeeId == Id).ToList();
          
            return query;
        }

        public bool Update(DUwiseHRMapping obj)
        {
            context.Set<DUwiseHRMapping>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public int Insert(DUwiseHRMapping obj)
        {
            DUwiseHRMapping dUwiseHRMapping = context.Set<DUwiseHRMapping>().Add(obj);
            int result = context.SaveChanges();
            if (result > 0) 
                return dUwiseHRMapping.Id;
            else
                return 0;
        }
        //public void Delete(DUwiseHRMapping obj)
        //{
        //    DUwiseHRMapping dUwiseHRMapping = context.Set<DUwiseHRMapping>().Remove(obj);
        //     context.SaveChanges();
           
        //}

        public bool Delete(DUwiseHRMapping obj)
        {
            DUwiseHRMapping dUwiseHRMapping = context.Set<DUwiseHRMapping>().Find(obj.Id);
           
            if (context.Entry(dUwiseHRMapping).State == EntityState.Detached)
                context.Set<DUwiseHRMapping>().Attach(dUwiseHRMapping);

            context.Set<DUwiseHRMapping>().Remove(dUwiseHRMapping);
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
