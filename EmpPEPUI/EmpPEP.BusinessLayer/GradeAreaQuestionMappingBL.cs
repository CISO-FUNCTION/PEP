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
   public class GradeAreaQuestionMappingBL
   {
       public List<GetBCForFeedback_ResultEntity> GetBCForManagerFeedback(int AppraisalCycleId, int EmployeeGradeID, int EmployeeId, int AreaID)
       {
           List<SqlParameter> parameterList = new List<SqlParameter>();
           SqlParameter sqlParam;
           sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@EmployeeGradeID", EmployeeGradeID > 0 ? EmployeeGradeID : (object)DBNull.Value);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@EmployeeId", EmployeeId > 0 ? EmployeeId : (object)DBNull.Value);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@AreaId", AreaID);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           using (var gradeAreaQuestionMappingRepository = new GradeAreaQuestionMappingRepository())
           {
               SqlParameter[] parameters = parameterList.ToArray();

               List<GetBCForFeedback_Result> getEmployeeFeedback_Result = gradeAreaQuestionMappingRepository.GetBCForManagerFeedback("EXEC dbo.[GetBCForFeedback] @AppraisalCycleId, @EmployeeGradeID,@EmployeeId,@AreaId", parameters).ToList<GetBCForFeedback_Result>(); ;
               return Utility.ConvertToList<GetBCForFeedback_Result, GetBCForFeedback_ResultEntity>(getEmployeeFeedback_Result);
           }

       }

       public List<GetGradeAreaQuestionMapping_ResultEntity> GetGetGradeAreaQuestionMapping(int AppraisalCycleId, int AreaId, int QuestionId)
       {
           List<SqlParameter> parameterList = new List<SqlParameter>();
           SqlParameter sqlParam;
           sqlParam = new SqlParameter("@AppraisalCycleId", AppraisalCycleId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@AreaId", AreaId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           sqlParam = new SqlParameter("@QuestionId", QuestionId);
           sqlParam.SqlDbType = SqlDbType.Int;
           sqlParam.Direction = ParameterDirection.Input;
           parameterList.Add(sqlParam);

           using (var gradeAreaQuestionMappingRepository = new GradeAreaQuestionMappingRepository())
           {
               SqlParameter[] parameters = parameterList.ToArray();

               List<GetGradeAreaQuestionMapping_Result> getEmployeeFeedback_Result = gradeAreaQuestionMappingRepository.GetGetGradeAreaQuestionMapping("EXEC dbo.[GetGradeAreaQuestionMapping] @AppraisalCycleId, @AreaId, @QuestionId", parameters).ToList<GetGradeAreaQuestionMapping_Result>(); ;
               return Utility.ConvertToList<GetGradeAreaQuestionMapping_Result, GetGradeAreaQuestionMapping_ResultEntity>(getEmployeeFeedback_Result);
           }

       }

       public bool Insert(List<GradeAreaQuestionMappingEntity> lstgradeAreaQuestionMappingEntity)
       {
           bool result = false;
           int Id = 0;
           foreach (var gradeAreaQuestionMappingEntity in lstgradeAreaQuestionMappingEntity)
           {
               if (gradeAreaQuestionMappingEntity.GradeAreaQuestionMappingID > 0)
               {
                  result=  Update(gradeAreaQuestionMappingEntity);
               }
               else
               {
                   Id = Insert(gradeAreaQuestionMappingEntity);
                   if (Id > 0)
                   { result = true; }
               }
           }
           return result;
       }

       public int Insert(GradeAreaQuestionMappingEntity gradeAreaQuestionMappingEntity)
       {
           using (var gradeAreaQuestionMappingRepository = new GradeAreaQuestionMappingRepository())
           {
               int result;
               GradeAreaQuestionMapping gradeAreaQuestionMapping = new GradeAreaQuestionMapping();
               gradeAreaQuestionMapping = (GradeAreaQuestionMapping)Utility.ConvertToObject(gradeAreaQuestionMappingEntity, gradeAreaQuestionMapping);
               if (gradeAreaQuestionMappingEntity.ExpectedPoint == "-1")
               {
                   result = 1;
               }
               else
               {
                    result = gradeAreaQuestionMappingRepository.Insert(gradeAreaQuestionMapping);
               }
               return result;
           }
       }

       public bool Update(GradeAreaQuestionMappingEntity gradeAreaQuestionMappingEntity)
       {
           using (var gradeAreaQuestionMappingRepository = new GradeAreaQuestionMappingRepository())
           {
               GradeAreaQuestionMapping gradeAreaQuestionMapping = new GradeAreaQuestionMapping();
               gradeAreaQuestionMapping = gradeAreaQuestionMappingRepository.Get(gradeAreaQuestionMappingEntity.GradeAreaQuestionMappingID);
               gradeAreaQuestionMapping.ExpectedPoint = gradeAreaQuestionMappingEntity.ExpectedPoint=="-1"?"0": gradeAreaQuestionMappingEntity.ExpectedPoint;
               return gradeAreaQuestionMappingRepository.Update(gradeAreaQuestionMapping);
               
           }
       }
   }
}
