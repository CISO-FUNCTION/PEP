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
    public class EmployeeLoginDetailsBL
    {
        public bool IsValidToken(string tokenString, string empIdHeader)
        {

            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {
                var employeeDetails = employeeLoginDetailRepository.Get(Convert.ToInt32(empIdHeader), tokenString);

                if (employeeDetails != null)
                {
                    if (employeeDetails.Token == tokenString)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
        }
        public bool Insert(EmpLoginDetailsEntity empLoginDetails)
        {
            var employeeDetails = true;
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {
                //var isEmpExist = employeeLoginDetailRepository.Get(empLoginDetails.EmployeeId);
                //if (isEmpExist.EmployeeId==0)
                //{
                //    employeeDetails = employeeLoginDetailRepository.Insert((EmployeeLoginDetail)Utility.ConvertToObject(empLoginDetails, new EmployeeLoginDetail()));
                //}
                //else
                //{
                //    employeeDetails = employeeLoginDetailRepository.Delete((EmployeeLoginDetail)Utility.ConvertToObject(empLoginDetails, new EmployeeLoginDetail()));
                employeeDetails = employeeLoginDetailRepository.Insert((EmployeeLoginDetail)Utility.ConvertToObject(empLoginDetails, new EmployeeLoginDetail())) > 0 ? true : false;
            }
            return employeeDetails;
        }
        public bool InsertLog(EmployeePEPLoginLogEntity empLoginDetailsLog)
        {
            var employeeDetailsLog = true;
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {
                employeeDetailsLog = employeeLoginDetailRepository.InsertLog((EmployeePEPLoginLog)Utility.ConvertToObject(empLoginDetailsLog, new EmployeePEPLoginLog())) > 0 ? true : false;
            }
            return employeeDetailsLog;
        }
        public bool Delete(EmpLoginDetailsEntity empLoginDetails)
        {
            var employeeDetails = true;
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {
                employeeDetails = employeeLoginDetailRepository.Delete((EmployeeLoginDetail)Utility.ConvertToObject(empLoginDetails, new EmployeeLoginDetail()));
            }
            return employeeDetails;
        }


        public bool hasTokenExpired(string empIdHeader, string tokenString)
        {
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {
                var expired = employeeLoginDetailRepository.hasTokenExpired(Convert.ToInt32(empIdHeader), tokenString);
                return expired;
            }
        }
        public int SendExcepToDB(string GenerateToken, string methodName, string code, Exception exdb)
        {
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {

                tblExceptionLogging tblExceptionLoggingOBJ = new tblExceptionLogging();
                tblExceptionLoggingOBJ.sectionName = GenerateToken;
                tblExceptionLoggingOBJ.controllerName = methodName;
                tblExceptionLoggingOBJ.exceptionMsg = exdb == null ? "" : exdb.Message.ToString();
                tblExceptionLoggingOBJ.exceptionType = exdb == null ? null : exdb.GetType().Name.ToString();
                tblExceptionLoggingOBJ.exceptionSource = "Application";
                tblExceptionLoggingOBJ.createdBy = "";
                tblExceptionLoggingOBJ.createdOn = DateTime.Now;

                int result = employeeLoginDetailRepository.InsertException(tblExceptionLoggingOBJ);

                return result;
            }
        }

        public bool UpdateLogin(EmpLoginDetailsEntity empLoginDetails)
        {
            var employeeDetails = true;
            using (var employeeLoginDetailRepository = new EmployeeLoginDetailRepository())
            {

                employeeDetails = employeeLoginDetailRepository.UpdateLogin((EmployeeLoginDetail)Utility.ConvertToObject(empLoginDetails, new EmployeeLoginDetail()));
            }
            return employeeDetails;
        }


        public EmpLoginDetailsEntity Get(int EmployeeId)
        {

            using (var employeeLoginDetailRepository = new EmployeeMasterRepository())
            {

                var employeeDetails = employeeLoginDetailRepository.Get(EmployeeId);
                if (employeeDetails != null)
                {
                    return (EmpLoginDetailsEntity)Utility.ConvertToObject(employeeDetails, new EmpLoginDetailsEntity());
                }
            }
            return null;


        }
    }
}
