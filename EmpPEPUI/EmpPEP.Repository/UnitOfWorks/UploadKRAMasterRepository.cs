using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;


namespace EmpPEP.Repository.UnitOfWorks
{
    public class UploadKRAMasterRepository : IBaseRepository<UploadKRAMaster>, IDisposable
    {
         #region "Private variables"
        private readonly PEPEntities1  context = null;        
        #endregion
     
        #region "Constructor"
        public UploadKRAMasterRepository()
        {
            context = new PEPEntities1();
        }
        #endregion
        
        #region "Public Methods"
        
    
        public List<UploadKRAMaster> Get()
        {
            IQueryable<UploadKRAMaster> query = context.Set<UploadKRAMaster>();
            return query.ToList();
        }

        public List<UploadKRAMaster> Get(int SetId, string IsSet="Y")
        {
            IQueryable<UploadKRAMaster> query = context.Set<UploadKRAMaster>().Where(x=>x.UploadKRASetID==SetId);
            return query.ToList();
        }

        public UploadKRAMaster Get(int id)
        {
            return context.UploadKRAMasters.FirstOrDefault(x => x.UploadKRAId == id);
        }

        public int Insert(UploadKRAMaster obj)
        {
            context.Set<UploadKRAMaster>().Add(obj);
            return context.SaveChanges();
        }

        public bool Update(UploadKRAMaster obj)
        {
            context.Set<UploadKRAMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false; throw new NotImplementedException();
        }

        public bool Delete(UploadKRAMaster obj)
        {
            UploadKRAMaster uploadKRAMaster = context.Set<UploadKRAMaster>().Find(obj.UploadKRAId);

            if (context.Entry(uploadKRAMaster).State == EntityState.Detached)
                context.Set<UploadKRAMaster>().Attach(uploadKRAMaster);

            context.Set<UploadKRAMaster>().Remove(uploadKRAMaster);
            return context.SaveChanges() > 0 ? true : false;
        }

        public List<GetProjects_Result> GetProjects(int AppraisalCycleId, string ProjectName)
        {
            return context.Database.SqlQuery<GetProjects_Result>("exec [dbo].[GetProjects]  @AppraisalCycleId,@ProjectName", new SqlParameter("AppraisalCycleId", AppraisalCycleId), new SqlParameter("ProjectName", ProjectName)).ToList<GetProjects_Result>();
        }

        public List<UploadKRASetMaster> GetKRASet()
        {
            IQueryable<UploadKRASetMaster> query = context.Set<UploadKRASetMaster>();
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
