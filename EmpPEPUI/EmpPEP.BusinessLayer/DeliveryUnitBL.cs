using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class DeliveryUnitBL
    {
        public List<GetAllDeliveryUnitFromAspire_ResultEntity> GetDeliveryUnits()
        {
            using (var duRepository = new DeliveryUnitRepository())
            {
                List<GetAllDeliveryUnitFromAspire_Result> Result = duRepository.GetAllDeliveryUnitFromAspire("EXEC dbo.[GetAllDeliveryUnitFromAspire]").ToList<GetAllDeliveryUnitFromAspire_Result>(); ;
                return Utility.ConvertToList<GetAllDeliveryUnitFromAspire_Result, GetAllDeliveryUnitFromAspire_ResultEntity>(Result);
            }
        }

        public DUwiseHRMapping_ResultEntity GetDUHRMapping(int id)
        {
            using (var duRepository = new DeliveryUnitRepository())
            {
                DUwiseHRMapping Result = duRepository.GetHRDUMapping(id);
                return (DUwiseHRMapping_ResultEntity)Utility.ConvertToObject(Result, new DUwiseHRMapping_ResultEntity());
            }
        }
        public List<DUwiseHRMapping_ResultEntity> GetListDUHRMapping(int id)
        {
            using (var duRepository = new DeliveryUnitRepository())
            {
                List<DUwiseHRMapping> Result = duRepository.GetListHRDUMapping(id);
                return Utility.ConvertToList<DUwiseHRMapping, DUwiseHRMapping_ResultEntity>(Result);
               // return (List<DUwiseHRMapping_ResultEntity>)Utility.ConvertToObject(Result, new List<DUwiseHRMapping_ResultEntity>());
              
            }
        }
    }
}
