using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmailTemplateRepository : IBaseRepository<EmailTemplateMaster>, IDisposable
    {
         #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public EmailTemplateRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        #region "Public function"
        
        public List<EmailTemplateMaster> Get()
        {
            throw new NotImplementedException();
        }

        public EmailTemplateMaster Get(int id)
        {
            return context.EmailTemplateMasters.FirstOrDefault(x => x.EmailTemplateId == id);
        }

        public EmailTemplateMaster GetByEventId(int eventId)
        {
            return context.EmailTemplateMasters.FirstOrDefault(x => x.EventId == eventId);
        }

        public int Insert(EmailTemplateMaster obj)
        {
            throw new NotImplementedException();
        }

        public bool Update(EmailTemplateMaster obj)
        {
            context.Set<EmailTemplateMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }


        public bool Delete(EmailTemplateMaster obj)
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
