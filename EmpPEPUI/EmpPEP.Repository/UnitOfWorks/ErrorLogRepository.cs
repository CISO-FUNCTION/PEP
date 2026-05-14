using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using EmpPEP.Framework.Helper;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class ErrorLogRepository : BaseDispose, IBaseRepository<pep_error_log>, IDisposable
    {
        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region Dispose Pattern
        void IDisposable.Dispose()
        {
            context.Dispose();
        }
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
        public ErrorLogRepository()
        {
            context = new PEPEntities1();
        }
        public pep_error_log Get(int id)
        {
            throw new NotImplementedException();
        }

        //public int Insert(pri_employeelogindetails obj)
        //{
        //    throw new NotImplementedException();
        //}
        public int Insert(pep_error_log obj)
        {
            context.Set<pep_error_log>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(pep_error_log obj)
        {
            context.Set<pep_error_log>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(pep_error_log obj)
        {
            throw new NotImplementedException();
        }

        public List<pep_error_log> Get()
        {
            throw new NotImplementedException();
        }

    }
}
