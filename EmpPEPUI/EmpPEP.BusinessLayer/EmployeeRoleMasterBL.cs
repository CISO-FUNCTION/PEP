using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class EmployeeRoleMasterBL
    {
        #region "Public Methods"

        public List<EmployeeRoleMasterEntity> Get()
        {
            using (var employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                var employeeRoleMaster = employeeRoleMasterRepository.Get();

                if (employeeRoleMaster.Any())
                {
                    return Utility.ConvertToList<EmployeeRoleMaster, EmployeeRoleMasterEntity>(employeeRoleMaster);

                }
                return null;
            }
        }

        public EmployeeRoleMasterEntity Get(int id)
        {
            using (var employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                EmployeeRoleMasterEntity employeeRoleMasterEntity = (EmployeeRoleMasterEntity)Utility.ConvertToObject(employeeRoleMasterRepository.Get(id), new EmployeeAwardsEntity());
                return employeeRoleMasterEntity;
            }
        }

        public List<GetEmployeeRoles_ResultEntity> Get(string filtertype, int id)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@FilterType", filtertype);
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@Id", id);
            parameterList.Add(sqlParam);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;

            using (EmployeeRoleMasterRepository employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();
                var employeeRoleMaster = employeeRoleMasterRepository.Get("EXEC dbo.[GetEmployeeRoles] @FilterType, @Id", parameters);
                if (employeeRoleMaster.Any())
                {
                    return Utility.ConvertToList<GetEmployeeRoles_Result, GetEmployeeRoles_ResultEntity>(employeeRoleMaster);
                }
                return null;
            }
        }

        public bool Put(EmployeeRoleMasterEntity employeeRoleMasterEntity)
        {
            using (var employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                EmployeeRoleMaster employeeRoleMaster = employeeRoleMasterRepository.Get(employeeRoleMasterEntity.EmployeeRoleId);
                if (employeeRoleMaster != null)
                {
                    employeeRoleMaster.EmployeeRoleName = employeeRoleMasterEntity.EmployeeRoleName;
                    employeeRoleMaster.EmployeeRoleDesc = employeeRoleMasterEntity.EmployeeRoleDesc;
                    employeeRoleMaster.ModifiedBy = employeeRoleMasterEntity.ModifiedBy;
                    employeeRoleMaster.ModifiedOn = DateTime.Now;
                    return employeeRoleMasterRepository.Update(employeeRoleMaster);
                }
                return false;
            }
        }

        public int Post(EmployeeRoleMasterEntity employeeRoleMasterEntity)
        {
            using (var employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                EmployeeRoleMaster employeeRoleMaster = new EmployeeRoleMaster();
                employeeRoleMaster = (EmployeeRoleMaster)Utility.ConvertToObject(employeeRoleMasterEntity, employeeRoleMaster);

                return employeeRoleMasterRepository.Insert(employeeRoleMaster);
            }
        }

        public bool Delete(int id)
        {
            using (var employeeRoleMasterRepository = new EmployeeRoleMasterRepository())
            {
                EmployeeRoleMaster employeeRoleMaster = new EmployeeRoleMaster();
                employeeRoleMaster.EmployeeRoleId= id;
                return employeeRoleMasterRepository.Delete(employeeRoleMaster);
            }
        }

        #endregion  
    }
}
