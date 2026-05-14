using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class EmployeeAwardsBL 
    {
        #region "Public Methods"

        public List<EmployeeAwardsEntity> Get()
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                var employeeAwards = employeeAwardsRepository.Get();

                if (employeeAwards.Any())
                {
                    return Utility.ConvertToList<EmployeeAward, EmployeeAwardsEntity>(employeeAwards);
                    
                }
                return null;
            }
        }

        public EmployeeAwardsEntity Get(int id)
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                EmployeeAwardsEntity employeeAwardsEntity=(EmployeeAwardsEntity)Utility.ConvertToObject(employeeAwardsRepository.Get(id),new EmployeeAwardsEntity());
                return employeeAwardsEntity;
            }
        }

        public EmployeeAwardsEntity GetByEmployeeId(int EmployeeId)
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                EmployeeAwardsEntity employeeAwardsEntity= new  EmployeeAwardsEntity();
                var employeeAwards = employeeAwardsRepository.GetAwardByEmployeeId(EmployeeId);
                if (employeeAwards!=null)
                {
                    return (EmployeeAwardsEntity)Utility.ConvertToObject(employeeAwards, employeeAwardsEntity);

                }
            }
            return null;
        }

        public List<GetEmployeeAwards_ResultEntity> Get(string filtertype, int id, string procedure)
        {
            List<SqlParameter> parameterList = new List<SqlParameter>();
            SqlParameter sqlParam;
            sqlParam = new SqlParameter("@FilterType", filtertype);
            parameterList.Add(sqlParam);
            sqlParam = new SqlParameter("@Id", id);
            parameterList.Add(sqlParam);
            sqlParam.SqlDbType = SqlDbType.Int;
            sqlParam.Direction = ParameterDirection.Input;
            
            using (EmployeeAwardsRepository employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                SqlParameter[] parameters = parameterList.ToArray();
                var employeeAwards = employeeAwardsRepository.Get("EXEC dbo.[GetEmployeeAwards] @FilterType, @Id", parameters);
                if (employeeAwards.Any())
                {
                    return Utility.ConvertToList<GetEmployeeAwards_Result, GetEmployeeAwards_ResultEntity>(employeeAwards);
                }
                return null;
            }
        }

        public bool Put(EmployeeAwardsEntity employeeAwardsEntity)
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                EmployeeAward employeeAwards = employeeAwardsRepository.Get(employeeAwardsEntity.AwardId);
                if (employeeAwards != null)
                {
                    employeeAwards.EmployeeId = employeeAwardsEntity.EmployeeId;
                    employeeAwards.Heading = employeeAwardsEntity.Heading;
                    employeeAwards.Description = employeeAwardsEntity.Description;
                    employeeAwards.AwardDate = employeeAwardsEntity.AwardDate;
                    return employeeAwardsRepository.Update(employeeAwards);
                }
                return false;
            }
        }

        public int Post(EmployeeAwardsEntity employeeAwardsEntity)
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                EmployeeAward employeeAwardsMaster = new EmployeeAward();
                employeeAwardsMaster = (EmployeeAward)Utility.ConvertToObject(employeeAwardsEntity, employeeAwardsMaster);
                
                return employeeAwardsRepository.Insert(employeeAwardsMaster);
            }
        }

        public bool Delete(int id)
        {
            using (var employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                EmployeeAward employeeAward = new EmployeeAward();
                employeeAward.AwardId = id;
                return employeeAwardsRepository.Delete(employeeAward);
            }
        }

        public ValidationsEntity Validations(EmployeeAwardsEntity employeeAwardsEntity)
        {
            ValidationHelper helper = new ValidationHelper();
            using (EmployeeAwardsRepository employeeAwardsRepository = new EmployeeAwardsRepository())
            {
                if (employeeAwardsEntity.EmployeeId == null || employeeAwardsEntity.EmployeeId == 0 || employeeAwardsEntity.Heading == "" || employeeAwardsEntity.Description == "")
                {
                    return helper.CreateValidation("Empty Fields", employeeAwardsEntity.Heading.ToString(), "All fields need to be filled.");
                }
                AppraisalCycleBL appraisalCycle = new AppraisalCycleBL();
                AppraisalCycleEntity appraisalCycleEntity=appraisalCycle.GetCurrent(0);
                if (employeeAwardsEntity.AwardDate < appraisalCycleEntity.StartDate || appraisalCycleEntity.EndDate > appraisalCycleEntity.EndDate)
                {
                    return helper.CreateValidation("AwardDate", appraisalCycleEntity.EndDate.ToString(), "AwardDate date should be within the current Appraisal Cycle.");
                }
            }
            return null;
        }

        #endregion  
    
        
    }
}
