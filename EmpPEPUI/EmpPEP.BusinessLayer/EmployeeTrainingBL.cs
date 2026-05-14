using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
    public class EmployeeTrainingBL
    {
        public List<spGetMyTrainings_ResultEntity> GetMyTrainingList(int empId, int appraisalCycleId)
        {
            using (var trainingRepository = new TrainingRepository())
            {
                List<SqlParameter> paramCollection = new List<SqlParameter>();
                paramCollection.Add(new SqlParameter("@EmpId", empId));
                paramCollection.Add(new SqlParameter("@AppraisalCycleId", appraisalCycleId));
                SqlParameter[] parameters = paramCollection.ToArray();

                List<spGetMyTrainings_Result> trainingList = trainingRepository.GetMyTrainingList("EXEC spGetMyTrainings @EmpId, @AppraisalCycleId", parameters).ToList();
                if (trainingList.Any())
                {
                    return Utility.ConvertToList<spGetMyTrainings_Result, spGetMyTrainings_ResultEntity>(trainingList);
                }
                return null;
            }
        }

        public bool Delete(int trainingId)
        {
            using (var reposotiry = new EmployeeTrainingRepository())
            {
                EmployeeTraining emptraining = new EmployeeTraining();
                emptraining.TrainingId = trainingId;
                return reposotiry.Delete(emptraining);
            }
        }

        public List<spGetTrainingsSuggetsted_ResultEntity> GetTrainingsSuggested(int managerId, int appraisalCycleId)
        {
            using (var repository = new EmployeeTrainingRepository())
            {
                List<SqlParameter> paramCollection = new List<SqlParameter>();
                paramCollection.Add(new SqlParameter("@ManagerId", managerId));
                paramCollection.Add(new SqlParameter("@AppraisalCycleId", appraisalCycleId));
                SqlParameter[] parameters = paramCollection.ToArray();

                List<spGetTrainingsSuggetsted_Result> trainingList = repository.GetTrainingsSuggested("EXEC spGetTrainingsSuggetsted @ManagerId, @AppraisalCycleId", parameters).ToList();
                if (trainingList.Any())
                {
                    return Utility.ConvertToList<spGetTrainingsSuggetsted_Result, spGetTrainingsSuggetsted_ResultEntity>(trainingList);
                }
                return null;
            }
        }

        public bool Insert(EmployeeTrainingEntity empTrainingEntity)
        {
            using (var repository = new EmployeeTrainingRepository())
            {
                EmployeeTraining employeeTraining = new EmployeeTraining();
                employeeTraining = (EmployeeTraining)Utility.ConvertToObject(empTrainingEntity, employeeTraining);
                employeeTraining.CreatedOn = DateTime.Now;
                employeeTraining.ModifiedOn = DateTime.Now;
                if (employeeTraining.ActionTypeId == (int)EnumCollection.ACTIONTYPE.Request)
                {
                    return repository.SaveTrainingRequest(employeeTraining);
                }
                else if (employeeTraining.ActionTypeId == (int)EnumCollection.ACTIONTYPE.Suggest)
                {
                    return repository.SaveTrainingSuggested(employeeTraining, empTrainingEntity.EmployeeIds);
                }
                else
                {
                    return false;
                }
            }
        }
    }
}
