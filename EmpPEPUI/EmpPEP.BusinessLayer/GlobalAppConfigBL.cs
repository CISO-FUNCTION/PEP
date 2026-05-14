using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Data;

namespace EmpPEP.BusinessLayer
{
    public class GlobalAppConfigBL
    {
        public DataSet GetGlobalAppConfig(string configKey = null)
        {
            DataSet ds = null;
            try
            {
                using (GlobalAppConfigRepository repository = new GlobalAppConfigRepository())
                {
                    ds = repository.GetGlobalAppConfig(configKey);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return ds;
        }

        public string GetConfigValue(string configKey)
        {
            try
            {
                DataSet ds = GetGlobalAppConfig(configKey);
                if (ds != null && ds.Tables["data"].Rows.Count > 0)
                {
                    return ds.Tables["data"].Rows[0]["ConfigValue"].ToString();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return string.Empty;
        }
    }
}