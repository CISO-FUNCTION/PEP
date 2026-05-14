using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework;
using AttributeRouting.Web.Http;
using EmpPEP.Framework.Log4Net;
using Newtonsoft.Json;
using EmpPEP.WebApi.Common;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class GradeAreaQuestionMappingController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(GradeAreaQuestionMappingController));

       // [Route("api/GAQMapping/GetBCForManagerFeedback")]
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int EmployeeGradeID, int EmployeeId, int AreaID)
        {
            try
            {
                EmployeeMasterBL objBl = new EmployeeMasterBL();
                var empdetails=objBl.GetEmployeeDetails(EmployeeId);

                    GradeAreaQuestionMappingBL gradeAreaQuestionMappingBL = new GradeAreaQuestionMappingBL();
                    var result = gradeAreaQuestionMappingBL.GetBCForManagerFeedback(AppraisalCycleId, empdetails.EmployeeGradeId, EmployeeId, AreaID);

                    if (result.Count > 0)
                    {
                        return ResponseMessages.CreateResponseMessage(true, result);
                    }
                    else
                    {
                        return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                    }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int AreaID, int QuestionId)
        {
            try
            {
                GradeAreaQuestionMappingBL gradeAreaQuestionMappingBL = new GradeAreaQuestionMappingBL();
                var result = gradeAreaQuestionMappingBL.GetGetGradeAreaQuestionMapping(AppraisalCycleId,AreaID,QuestionId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

  
        public HttpResponseMessage Post([FromBody] List<GradeAreaQuestionMappingEntity> gradeAreaQuestionMappingEntity)
        {
            try
            {

                GradeAreaQuestionMappingBL gradeAreaQuestionMappingBL = new GradeAreaQuestionMappingBL();
                bool result = gradeAreaQuestionMappingBL.Insert(gradeAreaQuestionMappingEntity);
                    if (result)
                        return ResponseMessages.CreateResponseMessage(true, "Competencies and Grade mapping done successfully.");
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while Competencies and Grade mapping.");
                

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
