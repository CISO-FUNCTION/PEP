using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace EmpPEP.Repository.UnitOfWorks
{
    public class ReportsRepository : IDisposable
    {

        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        public ReportsRepository()
        {
            context = new PEPEntities1();
            context.Database.CommandTimeout = 6000;
        }

        #region Public Methods
        public IEnumerable<GetManagerFeedbackStatusReport_Result> GetManagerFeedbackStatusReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetManagerFeedbackStatusReport_Result>(query, parameters).ToList<GetManagerFeedbackStatusReport_Result>();
        }

        public IEnumerable<GetStrengthWeaknessForManager_Result> GetStrengthWeaknessForManagerReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetStrengthWeaknessForManager_Result>(query, parameters).ToList<GetStrengthWeaknessForManager_Result>();
        }

        public IEnumerable<GetStrengthWeaknessForEmployee_Result> GetStrengthWeaknessForEmployeeReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetStrengthWeaknessForEmployee_Result>(query, parameters).ToList<GetStrengthWeaknessForEmployee_Result>();
        }

        //public IEnumerable<GetCompetenciesAvgRatingsForGraph_Result> GetCompetenciesAvgRatingsForGraph(string query, params object[] parameters)
        //{
        //    context.Database.CommandTimeout = 360;
        //    return context.Database.SqlQuery<GetCompetenciesAvgRatingsForGraph_Result>(query, parameters).ToList<GetCompetenciesAvgRatingsForGraph_Result>();
        //}

        public IEnumerable<GODefaultNewReport> GetKRADefaulterEmployeeReport1(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GODefaultNewReport>(query, parameters).ToList<GODefaultNewReport>();
        }
        public IEnumerable<GOFeedbackAssessmentTrackerReport> GetGOSelfAssessmentFeedbackTrackerReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GOFeedbackAssessmentTrackerReport>(query, parameters).ToList<GOFeedbackAssessmentTrackerReport>();
        }
        public IEnumerable<GetKRADefaulterEmployee_Result> GetKRADefaulterEmployeeReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetKRADefaulterEmployee_Result>(query, parameters).ToList<GetKRADefaulterEmployee_Result>();
        }

        public IEnumerable<GetWeightedScoreCalculationReport_Result> GetWeightedScoreCalculationReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetWeightedScoreCalculationReport_Result>(query, parameters).ToList<GetWeightedScoreCalculationReport_Result>();
        }

        public IEnumerable<GetBreakDownOfWeightedScoreCalculationReport_Result> GetBreakDownOfWeightedScoreCalculationReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetBreakDownOfWeightedScoreCalculationReport_Result>(query, parameters).ToList<GetBreakDownOfWeightedScoreCalculationReport_Result>();
        }

        public IEnumerable<GetManagerFeedbackStatusReportForGraph_Result> GetManagerFeedbackStatusReportForGraph(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetManagerFeedbackStatusReportForGraph_Result>(query, parameters).ToList<GetManagerFeedbackStatusReportForGraph_Result>();
        }
        public IEnumerable<GetFeedbackRport_Result> GetFeedbackReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetFeedbackRport_Result>(query, parameters).ToList<GetFeedbackRport_Result>();
        }

        public IEnumerable<GetSelectedEmpFeedbackRport_Result> GetSelectEmpFeedbackReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetSelectedEmpFeedbackRport_Result>(query, parameters).ToList<GetSelectedEmpFeedbackRport_Result>();
        }
        public IEnumerable<GetDUWiseManagerFeedbackReport_Result> GetDUWiseManagerFeedbackReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetDUWiseManagerFeedbackReport_Result>(query, parameters).ToList<GetDUWiseManagerFeedbackReport_Result>();
        }
        public IEnumerable<GetDUWiseSubordinateReport_Result> GetDUWiseSubordinateReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetDUWiseSubordinateReport_Result>(query, parameters).ToList<GetDUWiseSubordinateReport_Result>();
        }

        public IEnumerable<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result> GetFeedbackSelfAssessmentStatusReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result>(query, parameters).ToList<PEP_GivenPendingFeedbackSelfAssesmentstatus_Result>();
        }

        public IEnumerable<GetGoalModificationSummaryReport_Result> GetGoalModificationSummaryReport(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetGoalModificationSummaryReport_Result>(query, parameters).ToList<GetGoalModificationSummaryReport_Result>();
        }

        public IEnumerable<GetGoalModificationSummaryReport_Result> GetGoalModificationSummaryReportForManager(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            return context.Database.SqlQuery<GetGoalModificationSummaryReport_Result>(query, parameters).ToList<GetGoalModificationSummaryReport_Result>();
        }

        public DataSet GetEmployeeTalentManagementData(string query, params object[] parameters)
        {
            context.Database.CommandTimeout = 360;
            
            DataSet dataSet = new DataSet();
            using (var connection = context.Database.Connection)
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = query;
                    command.CommandType = CommandType.Text;
                    command.CommandTimeout = 360;
                    
                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            if (param is SqlParameter)
                            {
                                command.Parameters.Add(param);
                            }
                        }
                    }
                    
                    using (var adapter = new SqlDataAdapter((SqlCommand)command))
                    {
                        adapter.Fill(dataSet);
                    }
                }
            }
            
            return dataSet;
        }



        #endregion
        #region  IDiosposable

        #region private variable
        private bool disposed = false;
        #endregion

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
}
