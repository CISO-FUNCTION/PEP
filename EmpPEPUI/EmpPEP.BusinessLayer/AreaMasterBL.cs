using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class AreaMasterBL
    {
        public List<AreaMasterEntity> Get()
        {
            using (var repository = new AreaRepository())
            {
                var areaMaster = repository.Get();

                if (areaMaster.Any())
                {
                    return Utility.ConvertToList<AreaMaster, AreaMasterEntity>(areaMaster);
                }
                return null;
            }
        }
    }
}
