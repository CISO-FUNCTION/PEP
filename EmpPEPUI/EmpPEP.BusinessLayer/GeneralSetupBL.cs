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
    public class GeneralSetupBL
    {
        public FeedbackLimitMasterEntity GetFeedbackLimitsMaster(int Id)
        {
            using (var generalSetupRepository = new GeneralSetupRepository())
            {
                var feedbackLimitMaster = generalSetupRepository.GetFeedbackLimitsMaster(Id);
                FeedbackLimitMasterEntity obj= new FeedbackLimitMasterEntity();

                if (feedbackLimitMaster != null)
                {

                    return (FeedbackLimitMasterEntity) Utility.ConvertToObject(feedbackLimitMaster, obj);

                }
                return null;
            }
        }

        public PieChartParameterEntity GetPieChartParameter(int Id)
        {
            using (var generalSetupRepository = new GeneralSetupRepository())
            {
                var pieChartParameter = generalSetupRepository.GetPieChartParameter(Id);
                PieChartParameterEntity obj = new PieChartParameterEntity();

                if (pieChartParameter != null)
                {

                    return (PieChartParameterEntity)Utility.ConvertToObject(pieChartParameter, obj);

                }
                return null;
            }
        }

        public bool UpdateGeneralSetUp(int FeedbackLimitId,int FeedbackLimitValue, int   PieChartParameterId, int  PieChartParameterValue, int EmployeeId )
        {
            FeedbackLimitsMaster feedbackLimitMaster = new FeedbackLimitsMaster();
            PieChartParameter pieChartParameter = new PieChartParameter();
            bool result = false;
                using (var generalSetupRepository = new GeneralSetupRepository())
                {
                    feedbackLimitMaster = generalSetupRepository.GetFeedbackLimitsMaster(FeedbackLimitId);
                    if (feedbackLimitMaster != null)
                    {
                        feedbackLimitMaster.FeedbackFlowLimit = FeedbackLimitValue;
                        result= generalSetupRepository.Update_FeedbackLimitMaster(feedbackLimitMaster);
                    }

                    pieChartParameter = generalSetupRepository.GetPieChartParameter(PieChartParameterId);
                    if(pieChartParameter!=null)
                    {
                        pieChartParameter.Number = PieChartParameterValue;
                        result=generalSetupRepository.Update_PieChartParameter(pieChartParameter);

                    }
                    return result;
                }
        }
    }
}
