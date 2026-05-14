using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;
using System;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class QuestionariesMasterRepository :  IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region MyRegion
       public QuestionariesMasterRepository()
        {
            context = new PEPEntities1();
        }
       public List<QuestionairesMaster> Get()
        {
            IQueryable<QuestionairesMaster> query = context.Set<QuestionairesMaster>();
            return query.ToList();
        }
        public QuestionairesMaster Get(int id)
        {
            QuestionairesMaster query = context.Set<QuestionairesMaster>().SingleOrDefault(x => x.QuestionaireId == id);
            return query != null ? query : new QuestionairesMaster();
        }
        public List<QuestionairesMaster> Get(int id, string type)
        {
            IQueryable<QuestionairesMaster> query = context.Set<QuestionairesMaster>().Where(x=>x.AreaID==id);
            return query.ToList();
        }
        public int Insert(QuestionairesMaster obj)
        {
            context.Set<QuestionairesMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(QuestionairesMaster obj)
        {
            context.Set<QuestionairesMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(QuestionairesMaster obj)
        {
            QuestionairesMaster questionMaster = context.Set<QuestionairesMaster>().Single(x=>x.QuestionaireId==obj.QuestionaireId);

            if (context.Entry(questionMaster).State == EntityState.Detached)
                context.Set<QuestionairesMaster>().Attach(questionMaster);

            context.Set<QuestionairesMaster>().Remove(questionMaster);
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
