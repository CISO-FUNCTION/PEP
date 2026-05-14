using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Framework.Helper;
using EmpPEP.BusinessEntities;
using EmpPEP.Repository.UnitOfWorks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.SqlClient;
using System.Data;
using EmpPEP.Framework.Log4Net.Helper;

namespace EmpPEP.BusinessLayer
{
   public class NotificationsBL
    {
       public List<GetNotifications_ResultEntity> GetNotifications(int AppraisalCycleId, int ToEmployeeId)
       {
           #region "Parameter"
           List<SqlParameter> parameterList = new List<SqlParameter>();
           SqlParameter sqlParam;
           sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           #endregion
           using (var employeeFeedBackRepository = new EmployeeFeedBackRepository())
           {
               SqlParameter[] parameters = parameterList.ToArray();

               List<GetNotifications_Result> getNotifications_Result = employeeFeedBackRepository.GetNotifications("EXEC [dbo].[GetNotifications]  @AppraisalCycleId, @ToEmployeeId", parameters).ToList<GetNotifications_Result>(); ;
               return Utility.ConvertToList<GetNotifications_Result, GetNotifications_ResultEntity>(getNotifications_Result);
           }
       }

       public List<GETKRANotifications_ResultEntity> GetNotificationsForKRA(int AppraisalCycleId, int ToEmployeeId)
       {
           #region "Parameter"
           List<SqlParameter> parameterList = new List<SqlParameter>();
           SqlParameter sqlParam;
           sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@ToEmployeeId", ToEmployeeId > 0 ? ToEmployeeId : (object)DBNull.Value);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           #endregion
           using (var employeeKRARepository = new EmployeeKRARepository())
           {
               SqlParameter[] parameters = parameterList.ToArray();

               List<GetKRANotifications_Result> getNotifications_Result = employeeKRARepository.GetNotifications("EXEC [dbo].[GetKRANotifications]  @AppraisalCycleId, @ToEmployeeId", parameters).ToList<GetKRANotifications_Result>(); ;
               return Utility.ConvertToList<GetKRANotifications_Result, GETKRANotifications_ResultEntity>(getNotifications_Result);
           }
       }
    }
}
