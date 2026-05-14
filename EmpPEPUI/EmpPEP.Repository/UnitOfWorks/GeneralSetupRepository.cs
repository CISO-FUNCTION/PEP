using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class GeneralSetupRepository : IDisposable
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public GeneralSetupRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        #region "public Methods"
        public bool Update_PieChartParameter(PieChartParameter obj)
        {
            context.Set<PieChartParameter>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public bool Update_FeedbackLimitMaster(FeedbackLimitsMaster obj)
        {
            context.Set<FeedbackLimitsMaster>().Attach(obj);
            context.Entry(obj).State = EntityState.Modified;
            return context.SaveChanges() > 0 ? true : false;
        }

        public PieChartParameter GetPieChartParameter(int id)
        {
            return context.PieChartParameters.FirstOrDefault(x => x.Id== id);
        }

        public FeedbackLimitsMaster GetFeedbackLimitsMaster(int id)
        {
            return context.FeedbackLimitsMasters.FirstOrDefault(x => x.FeedbackLimitID == id);
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