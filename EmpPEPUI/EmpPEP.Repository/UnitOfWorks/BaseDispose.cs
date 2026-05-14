using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using EmpPEP.Repository.common;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class BaseDispose :  Connection, IDisposable
    {
        private readonly PEPEntities1 context = null;

        #region private variable
        private bool disposed = false;
        #endregion

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                if (context != null)
                {
                    context.Dispose();
                }                    
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
