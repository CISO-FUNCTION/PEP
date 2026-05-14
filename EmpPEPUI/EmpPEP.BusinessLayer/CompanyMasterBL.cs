using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class CompanyMasterBL
    {
        #region "Public Methods"

        public List<CompanyMasterEntity> Get()
        {
            using (var companyMasterRepository = new CompanyMasterRepository())
            {
                var companyMaster = companyMasterRepository.Get();

                if (companyMaster.Any())
                {
                    return Utility.ConvertToList<CompanyMaster, CompanyMasterEntity>(companyMaster);

                }
                return null;
            }
        }

        public CompanyMasterEntity Get(int id)
        {
            using (var CompanyMasterRepository = new CompanyMasterRepository())
            {
                CompanyMaster companyMaster = CompanyMasterRepository.Get(id);

                if (companyMaster != null)
                {
                    return (CompanyMasterEntity)Utility.ConvertToObject(CompanyMasterRepository.Get(id), new CompanyMasterEntity());
                }
                return null;
            }
        }
        #endregion  
    }
}
