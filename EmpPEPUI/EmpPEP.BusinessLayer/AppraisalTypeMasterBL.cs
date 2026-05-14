using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class AppraisalTypeMasterBL
    {
        #region "Public Methods"

        public List<AppraisalTypeMasterEntity> Get()
        {
            using (var appraisalTypeMasterRepository = new AppraisalTypeMasterRepository())
            {
                var appraisalTypeMaster = appraisalTypeMasterRepository.Get();

                if (appraisalTypeMaster.Any())
                {
                    return Utility.ConvertToList<AppraisalTypeMaster, AppraisalTypeMasterEntity>(appraisalTypeMaster);

                }
                return null;
            }
        }

        public AppraisalTypeMasterEntity Get(int id)
        {
            using (var appraisalTypeMasterRepository = new AppraisalTypeMasterRepository())
            {
                AppraisalTypeMaster appraisalTypeMaster = appraisalTypeMasterRepository.Get(id);

                if (appraisalTypeMaster != null)
                {
                    return (AppraisalTypeMasterEntity)Utility.ConvertToObject(appraisalTypeMasterRepository.Get(id), new AppraisalTypeMasterEntity());
                }
                return null;
            }
        }

        public bool Put(AppraisalTypeMasterEntity appraisalTypeMasterEntity)
        {
            using (var appraisalTypeMasterRepository = new AppraisalTypeMasterRepository())
            {
                AppraisalTypeMaster appraisalTypeMaster = appraisalTypeMasterRepository.Get(appraisalTypeMasterEntity.AppraisalTypeId);
                if ((appraisalTypeMaster != null) && (appraisalTypeMaster.AppraisalTypeId > 0))
                {
                    appraisalTypeMaster.AppraisalTypeDesc = appraisalTypeMasterEntity.AppraisalTypeDesc;
                    appraisalTypeMaster.AppraisalTypeName = appraisalTypeMasterEntity.AppraisalTypeName;
                    appraisalTypeMaster.CompanyId = appraisalTypeMasterEntity.CompanyId;
                    appraisalTypeMaster.ModifiedBy = appraisalTypeMasterEntity.ModifiedBy;
                    appraisalTypeMaster.ModifiedOn = DateTime.Now;
                    return appraisalTypeMasterRepository.Update(appraisalTypeMaster);
                }
                return false;
            }
        }

        public int Post(AppraisalTypeMasterEntity appraisalTypeMasterEntity)
        {
            using (var appraisalTypeMasterRepository = new AppraisalTypeMasterRepository())
            {
                AppraisalTypeMaster appraisalTypeMaster = new AppraisalTypeMaster();
                appraisalTypeMaster = (AppraisalTypeMaster)Utility.ConvertToObject(appraisalTypeMasterEntity, appraisalTypeMaster);
                appraisalTypeMaster.CreatedBy = appraisalTypeMaster.CreatedBy;
                appraisalTypeMaster.CreatedOn = DateTime.Now;
                return appraisalTypeMasterRepository.Insert(appraisalTypeMaster);
            }
        }

        public bool Delete(int id)
        {
            using (var appraisalTypeMasterRepository = new AppraisalTypeMasterRepository())
            {
                AppraisalTypeMaster appraisalTypeMaster = new AppraisalTypeMaster();
                appraisalTypeMaster.AppraisalTypeId = id;
                return appraisalTypeMasterRepository.Delete(appraisalTypeMaster);
            }
        }

        
        #endregion

    }
}
