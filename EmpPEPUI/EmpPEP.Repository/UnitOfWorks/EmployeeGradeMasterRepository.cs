using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeGradeMasterRepository : IBaseRepository<EmployeeGradeMaster>, IDisposable
    {
         #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region MyRegion
        public EmployeeGradeMasterRepository()
        {
            context = new PEPEntities1();
        }
        public List<EmployeeGradeMaster> Get()
        {
            return context.EmployeeGradeMasters.Where(x => x.IsActive==1).ToList(); 
        }

        public EmployeeGradeMaster Get(int id)
        {
            EmployeeGradeMaster query = context.Set <EmployeeGradeMaster>().SingleOrDefault(x => x.EmployeeGradeId == id);
            return query != null ? query : new EmployeeGradeMaster();
        }


        public int Insert(EmployeeGradeMaster obj)
        {
            throw new NotImplementedException();
        }

        public bool Update(EmployeeGradeMaster obj)
        {
            throw new NotImplementedException();
        }

        public bool Delete(EmployeeGradeMaster obj)
        {
            throw new NotImplementedException();
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
