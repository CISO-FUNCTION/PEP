using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
    public class TrainingMasterBL
    {
        public List<TrainingItemMasterEntity> GetTrainingTypeList(int id)
        {
            using (var repository = new TrainingRepository())
            {
                var trainingMaster = repository.GetTrainingTypeList(id);

                if (trainingMaster.Any())
                {
                    return Utility.ConvertToList<TrainingItemMaster, TrainingItemMasterEntity>(trainingMaster);
                }
                return null;
            }
        }

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

        public List<spGetMyTrainings_ResultEntity> GetRequestedTrainingsList(int empId, int appraisalCycleId)
        {
            using (var trainingRepository = new TrainingRepository())
            {
                List<SqlParameter> paramCollection = new List<SqlParameter>();
                paramCollection.Add(new SqlParameter("@EmpId", empId));
                paramCollection.Add(new SqlParameter("@AppraisalCycleId", appraisalCycleId));
                SqlParameter[] parameters = paramCollection.ToArray();

                List<spGetTrainingsRequested_Result> trainingList = trainingRepository.GetTrainingsRequested("EXEC spGetTrainingsRequested @EmpId, @AppraisalCycleId", parameters).ToList();
                if (trainingList.Any())
                {
                    return Utility.ConvertToList<spGetTrainingsRequested_Result, spGetMyTrainings_ResultEntity>(trainingList);
                }
                return null;
            }
        }

        public Dictionary<int, string> GetTrainingTypes()
        {
            var dict = Enum.GetValues(typeof(EnumCollection.TRAININGTYPE)).Cast<EnumCollection.TRAININGTYPE>().ToDictionary(d => (int)d, d => d.ToString());
            return dict;
        }

        /// <summary>
        /// Get all trainings from IPE_Training_List table using stored procedure
        /// </summary>
        public List<IPETrainingListEntity> GetIPETrainingList()
        {
            using (var repository = new TrainingRepository())
            {
                var repositoryList = repository.GetIPETrainingList("EXEC [dbo].[sp_GetIPETrainingList]").ToList();
                if (repositoryList.Any())
                {
                    // Convert from Repository entity to BusinessLayer entity
                    return repositoryList.Select(r => new IPETrainingListEntity
                    {
                        TrainingId = r.TrainingId,
                        TrainingName = r.TrainingName,
                        TrainingType = r.TrainingType
                    }).ToList();
                }
                return new List<IPETrainingListEntity>();
            }
        }

        /// <summary>
        /// Get Training Request Report for Admin by Appraisal Cycle
        /// Returns DataSet for better maintainability
        /// </summary>
        public DataSet GetTrainingRequestReport(int appraisalCycleId)
        {
            using (var repository = new TrainingRepository())
            {
                return repository.GetTrainingRequestReport(appraisalCycleId);
            }
        }

        /// <summary>
        /// Get Training Request Report for Manager by Appraisal Cycle and Manager ID
        /// Returns DataSet for better maintainability
        /// </summary>
        public DataSet GetTrainingRequestReportForManager(int appraisalCycleId, int managerId)
        {
            using (var repository = new TrainingRepository())
            {
                return repository.GetTrainingRequestReportForManager(appraisalCycleId, managerId);
            }
        }

        /// <summary>
        /// Get Training Status from bsc.dbo.DailyTrainingsData for Feedback screen
        /// Returns DataSet for better maintainability
        /// </summary>
        public DataSet GetTrainingStatusFromDailyTrainingsData(int appraisalCycleId, string newEmployeeCode)
        {
            using (var repository = new TrainingRepository())
            {
                return repository.GetTrainingStatusFromDailyTrainingsData(appraisalCycleId, newEmployeeCode);
            }
        }
    }

    /// <summary>
    /// Entity class for IPE_Training_List table
    /// </summary>
    public class IPETrainingListEntity
    {
        public int TrainingId { get; set; }
        public string TrainingName { get; set; }
        public string TrainingType { get; set; }
    }
}
