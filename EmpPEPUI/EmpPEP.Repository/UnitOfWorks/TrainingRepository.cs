using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Data;
using EmpPEP.Framework.Helper;
using EmpPEP.BusinessEntities;
using EmpPEP.Repository.common;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class TrainingRepository : BaseDispose, IBaseRepository<TrainingItemMaster>
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public TrainingRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        public List<TrainingItemMaster> GetTrainingTypeList(int id)
        {
            IQueryable<TrainingItemMaster> query;
            if (id > 0)
            {
                query = context.TrainingItemMasters.Where(x => x.TrainingTypeId == id);
            }
            else
            {
                query = context.Set<TrainingItemMaster>();
            }

            return query.ToList();
        }

        public List<TrainingItemMaster> Get()
        {
            throw new NotImplementedException();
        }

        public TrainingItemMaster Get(int id)
        {
            throw new NotImplementedException();
        }

        public int Insert(TrainingItemMaster obj)
        {
            throw new NotImplementedException();
        }        

        public bool Update(TrainingItemMaster obj)
        {
            throw new NotImplementedException();
        }

        public bool Delete(TrainingItemMaster obj)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<spGetMyTrainings_Result> GetMyTrainingList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<spGetMyTrainings_Result>(query, parameters).ToList<spGetMyTrainings_Result>();
        }

        public IEnumerable<spGetTrainingsRequested_Result> GetTrainingsRequested(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<spGetTrainingsRequested_Result>(query, parameters).ToList<spGetTrainingsRequested_Result>();
        }

        /// <summary>
        /// Get all trainings from IPE_Training_List table using stored procedure
        /// </summary>
        public IEnumerable<IPETrainingListEntity> GetIPETrainingList(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<IPETrainingListEntity>(query, parameters).ToList<IPETrainingListEntity>();
        }

        /// <summary>
        /// Get training type from IPE_Training_List by TrainingId using stored procedure
        /// </summary>
        public string GetTrainingTypeByTrainingId(int trainingId)
        {
            try
            {
                var query = "EXEC [dbo].[sp_GetTrainingTypeByTrainingId] @TrainingId";
                var result = context.Database.SqlQuery<string>(query, new SqlParameter("@TrainingId", trainingId)).FirstOrDefault();
                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        /// <summary>
        /// Get Training Request Report for Admin by Appraisal Cycle
        /// Uses stored procedure with DataSet/DataTable for better maintainability
        /// </summary>
        public DataSet GetTrainingRequestReport(int appraisalCycleId)
        {
            DataSet ds = new DataSet();
            string sectionName = "TrainingRepository";
            SqlCommand cmdObj = null;
            
            try
            {
                OpeneConnection();
                
                // Create the SqlCommand object to call the stored procedure
                cmdObj = new SqlCommand("sp_GetTrainingRequestReport", ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                // Add parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                
                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);  // Fill the DataSet with the result of the stored procedure
                
                // Optionally name the table inside the DataSet for clarity
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "TrainingRequestReport";  // Name the table
                }
                
                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetTrainingRequestReport");
            }
            finally
            {
                if (ConCampus != null && ConCampus.State == System.Data.ConnectionState.Open)
                {
                    CloseConnection();
                }
            }
            
            return ds;
        }

        /// <summary>
        /// Get Training Request Report for Manager by Appraisal Cycle and Manager ID
        /// Uses stored procedure with DataSet/DataTable for better maintainability
        /// </summary>
        public DataSet GetTrainingRequestReportForManager(int appraisalCycleId, int managerId)
        {
            DataSet ds = new DataSet();
            string sectionName = "TrainingRepository";
            SqlCommand cmdObj = null;
            
            try
            {
                OpeneConnection();
                
                // Create the SqlCommand object to call the stored procedure
                cmdObj = new SqlCommand("sp_GetTrainingRequestReportForManager", ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                // Add parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                cmdObj.Parameters.Add(new SqlParameter("@ManagerId", SqlDbType.Int)).Value = managerId;
                
                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);
                
                // Optionally name the table inside the DataSet for clarity
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "TrainingRequestReportForManager";
                }
                
                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetTrainingRequestReportForManager");
            }
            finally
            {
                if (ConCampus != null && ConCampus.State == System.Data.ConnectionState.Open)
                {
                    CloseConnection();
                }
            }
            
            return ds;
        }

        /// <summary>
        /// Get Training Status from bsc.dbo.DailyTrainingsData for Feedback screen
        /// Uses stored procedure with DataSet/DataTable
        /// </summary>
        public DataSet GetTrainingStatusFromDailyTrainingsData(int appraisalCycleId, string newEmployeeCode)
        {
            DataSet ds = new DataSet();
            string sectionName = "TrainingRepository";
            SqlCommand cmdObj = null;
            
            try
            {
                OpeneConnection();
                
                // Create the SqlCommand object to call the stored procedure
                cmdObj = new SqlCommand("sp_GetTrainingStatusFromDailyTrainingsData", ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;
                
                // Add parameters to the stored procedure
                cmdObj.Parameters.Add(new SqlParameter("@AppraisalCycleId", SqlDbType.Int)).Value = appraisalCycleId;
                cmdObj.Parameters.Add(new SqlParameter("@NewEmployeeCode", SqlDbType.NVarChar, 20)).Value = newEmployeeCode ?? string.Empty;
                
                // Execute the stored procedure and fill the DataSet
                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmdObj);
                dataAdapter.Fill(ds);
                
                // Optionally name the table inside the DataSet for clarity
                if (ds.Tables.Count > 0)
                {
                    ds.Tables[0].TableName = "TrainingStatusFromDailyTrainingsData";
                }
                
                // Close connection
                CloseConnection();
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetTrainingStatusFromDailyTrainingsData");
            }
            finally
            {
                if (ConCampus != null && ConCampus.State == System.Data.ConnectionState.Open)
                {
                    CloseConnection();
                }
            }
            
            return ds;
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
