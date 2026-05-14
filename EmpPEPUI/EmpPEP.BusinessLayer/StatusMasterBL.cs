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
    public class StatusMasterBL
    {
        #region "Public Methods"

        public List<StatusMasterEntity> Get(string StatusType) //picks status of a type
        {
            try
            {
                using (var statusMasterRepository = new StatusMasterRepository())
                {
                    StatusMaster statusMaster = new StatusMaster();
                    List<StatusMaster> getStatus = statusMasterRepository.Get(StatusType);
                    if (getStatus != null)
                        return Utility.ConvertToList<StatusMaster, StatusMasterEntity>(getStatus);
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public StatusMasterEntity Get(int id) //picks status of a type of Id
        {
            using (var statusMasterRepository = new StatusMasterRepository())
            {
                StatusMaster statusMaster = new StatusMaster();
                var getStatus = statusMasterRepository.Get(id);

                if (getStatus != null)
                {
                    StatusMasterEntity statusMasterEntity_result = new StatusMasterEntity();
                    return (StatusMasterEntity)Utility.ConvertToObject(getStatus, statusMasterEntity_result);
                }
                return null;
            }
        }

        #endregion
    }
}
