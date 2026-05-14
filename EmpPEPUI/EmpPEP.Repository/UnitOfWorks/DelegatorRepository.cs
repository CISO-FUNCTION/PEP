using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository
{
    public class DelegatorRepository : BaseDispose
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

        public DelegatorRepository()
        {
            context = new PEPEntities1();
        }
       public bool Update(EmployeeManagerMapping obj)
       {
           context.Set<EmployeeManagerMapping>().Attach(obj);
           context.Entry(obj).State = EntityState.Modified;
           return context.SaveChanges() > 0 ? true : false;
       }
       public EmployeeManagerMapping Get(int EmpMgrMapId )
       {
           EmployeeManagerMapping query = context.EmployeeManagerMappings.SingleOrDefault(x => x.Id == EmpMgrMapId);

           return query;
       }
       
    }
}
