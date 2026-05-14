using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class GradeAreaQuestionMappingRepository : IBaseRepository<GradeAreaQuestionMapping>, IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public GradeAreaQuestionMappingRepository()
        {
            context = new PEPEntities1();
        }
        #endregion
        #region "Public Methods"

        public List<GradeAreaQuestionMapping> Get()
        {
            throw new NotImplementedException();
        }

        public GradeAreaQuestionMapping Get(int id)
        {
            return context.GradeAreaQuestionMappings.FirstOrDefault(x => x.GradeAreaQuestionMappingID == id);
        }

        public int Insert(GradeAreaQuestionMapping obj)
        {
            context.Set<GradeAreaQuestionMapping>().Add(obj);
            context.SaveChanges();
            return obj.GradeAreaQuestionMappingID;
        }

        public bool Update(GradeAreaQuestionMapping obj)
        {
            context.Set<GradeAreaQuestionMapping>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Delete(GradeAreaQuestionMapping obj)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<GetBCForFeedback_Result> GetBCForManagerFeedback(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetBCForFeedback_Result>(query, parameters).ToList<GetBCForFeedback_Result>();
        }
        public IEnumerable<GetGradeAreaQuestionMapping_Result> GetGetGradeAreaQuestionMapping(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<GetGradeAreaQuestionMapping_Result>(query, parameters).ToList<GetGradeAreaQuestionMapping_Result>();
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
