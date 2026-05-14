using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class EmployeeGradeMasterBL
    {
        #region "Public Methods"

        public List<EmployeeGradeMasterEntity> Get()
        {
            using (var employeeGradeMasterRepository = new EmployeeGradeMasterRepository())
            {
                var employeeGrade = employeeGradeMasterRepository.Get();

                if (employeeGrade.Any())
                {
                    return Utility.ConvertToList<EmployeeGradeMaster, EmployeeGradeMasterEntity>(employeeGrade);

                }
                return null;
            }
        }

        public EmployeeGradeMasterEntity Get(int gradeid)
        {
            using (var employeeGradeMasterRepository = new EmployeeGradeMasterRepository())
            {
                var employeeGrade = employeeGradeMasterRepository.Get(gradeid);

                if (employeeGrade != null)
                {
                    EmployeeGradeMasterEntity employeeGradeMasterEntity = new EmployeeGradeMasterEntity();
                    return (EmployeeGradeMasterEntity)Utility.ConvertToObject(employeeGrade, employeeGradeMasterEntity);

                }
                return null;
            }
        }
        #endregion  
    }
}
