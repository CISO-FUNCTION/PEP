using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using EmpPEP.BusinessEntities;

using EmpPEP.Repository.UnitOfWorks;
using System.Data.SqlClient;
using System.Linq;
using EmpPEP.Framework.Helper;

namespace EmpPEP.BusinessLayer
{
    public class ErrorLogBL
    {
        public bool Insert(ErrorLogEntity objErrorLogEntity)
        {
            using (var repository = new ErrorLogRepository())
            {
                var LogDetails = true;
                using (var employeeLoginDetailRepository = new ErrorLogRepository())
                {

                    LogDetails = employeeLoginDetailRepository.Insert((pep_error_log)Utility.ConvertToObject(objErrorLogEntity, new pep_error_log())) > 0 ? true : false;
                }
                return LogDetails;

            }
        }
    }
}
