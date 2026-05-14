using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using System;
using System.Data;
using System.Data.SqlClient;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class GlobalAppConfigRepository : BaseDispose
    {
        SqlCommand cmdObj;
        string sectionName = "GlobalAppConfigRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public GlobalAppConfigRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }
        #endregion

        public DataSet GetGlobalAppConfig(string configKey = null)
        {
            DataSet ds = null;
            try
            {
                OpeneConnection();
                string _sql = "GetGlobalAppConfig";
                cmdObj = new SqlCommand(_sql, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                if (!string.IsNullOrEmpty(configKey))
                {
                    cmdObj.Parameters
                        .Add(new SqlParameter("@ConfigKey", SqlDbType.NVarChar, 100))
                        .Value = configKey;
                }

                ds = du.GetDataSetWithProc(cmdObj);
                ds.Tables[0].TableName = "data";
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetGlobalAppConfig");
            }

            return ds;
        }

        #region IDiosposable
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