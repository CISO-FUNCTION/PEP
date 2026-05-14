using AttributeRouting.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{


    [AuthorizeAttribute]
    [RoutePrefix("api/AppraisalCycle")]
    public class AppraisalCycleController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(AppraisalCycleController));


        [HttpGet]
        [Route("AppraisalCyclewithOutId")]
        public HttpResponseMessage AppraisalCyclewithOutId()
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycleEntity = appraisalCycleBL.Get();
                if (appraisalCycleEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycleEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycleMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get all active appraisal cycles (IsActive = 1)
        /// </summary>
        [HttpGet]
        [Route("GetActiveAppraisalCycles")]
        public HttpResponseMessage GetActiveAppraisalCycles()
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycleEntity = appraisalCycleBL.GetActive();
                if (appraisalCycleEntity == null || appraisalCycleEntity.Count == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new List<AppraisalCycleEntity>());
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycleEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetActiveAppraisalCycles", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), ex.Message);
            }
        }

       
        [HttpGet]
        [Route("AppraisalCycleWithId")]
        public HttpResponseMessage AppraisalCycleWithId(int Id)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycle = appraisalCycleBL.Get(Id);
                if (appraisalCycle == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycle);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("AppraisalCycleWithProcedure")]
        public HttpResponseMessage AppraisalCycleWithProcedure(int Id, string procedure)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycle = appraisalCycleBL.Get(Id, procedure);
                if (appraisalCycle == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycle);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        ///// <summary>
        ///// Get Apprisal Cycle by Company ID all Started and Completed
        ///// </summary>
        ///// 

        //[HttpGet]
        //public HttpResponseMessage Get(int CompanyId, int StatusId)
        //{
        //    try
        //    {
        //        AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
        //        var appraisalCycle = appraisalCycleBL.GetByCompanyId(CompanyId, StatusId);
        //        if (appraisalCycle == null)
        //        {
        //            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
        //        }
        //        return ResponseMessages.CreateResponseMessage(true, appraisalCycle);
        //    }
        //    catch (Exception ex)
        //    {
        //        logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycle", ex.Message);
        //        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        //    }
        //}

        /// <summary>
        /// Get All runnig Current AppraiSalCycle 
        /// </summary>
        /// 


        [HttpGet]
        [Route("GetAllActiveAppraisalCycle")]
        public HttpResponseMessage GetAllActiveAppraisalCycle()
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycle = appraisalCycleBL.GetAllActiveCycle();
                if (appraisalCycle == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycle);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAllActiveAppraisalCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        /// <summary>
        /// Get All runnig Current SelfAssesmentCycle 
        /// </summary>


        [HttpGet]
        [Route("GetSelfAssesmentCycle")]
        public HttpResponseMessage GetSelfAssesmentCycle(int AppCycleId)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycle = appraisalCycleBL.GetSelfAssesmentCycle(AppCycleId);
                if (appraisalCycle == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                //var data = appraisalCycle.Tables[0].AsEnumerable()
                // .Select(row => new
                // {
                //     AppraisalCycleId = row.Field<int>("Id"),
                //     AppraisalCycleName = row.Field<string>("AppraisalCycleName")
                // }).ToList();
                var data = appraisalCycle;
                return ResponseMessages.CreateResponseMessage(true, data);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetSelfAssesmentCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("GetGOSelfAssesmentCycle")]
        public HttpResponseMessage GetGOSelfAssesmentCycle(int AppCycleId)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycle = appraisalCycleBL.GetSelfAssesmentCycle(AppCycleId);
                if (appraisalCycle == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                var result = appraisalCycle.Tables[0].AsEnumerable()
                 .Select(row => new
                 {
                     AppraisalCycleId = row.Field<int>("Id"),
                     AppraisalCycleName = row.Field<string>("AppraisalCycleName")
                 }).ToList();
                return ResponseMessages.CreateResponseMessage(true, result);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetSelfAssesmentCycle1", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }






        [HttpPost]
        //[ValidateModelRegister]
        public HttpResponseMessage Post([FromBody] AppraisalCycleEntity appraisalCycleMasterEntity)
        {
            try
            {

                if (appraisalCycleMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                AppraisalCycleBL appraisalCycleMasterBL = new AppraisalCycleBL();
                var validations = appraisalCycleMasterBL.Validations(appraisalCycleMasterEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                var result = appraisalCycleMasterBL.Post(appraisalCycleMasterEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { AppraisalCycleId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "AppraisalCycleMasterPost", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]

        //[ValidateModelRegister]
        public HttpResponseMessage Put([FromBody] AppraisalCycleEntity appraisalCycleMasterEntity)
        {
            try
            {

                if (appraisalCycleMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                AppraisalCycleBL appraisalCycleMasterBL = new AppraisalCycleBL();
                var validations = appraisalCycleMasterBL.Validations(appraisalCycleMasterEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                var result = appraisalCycleMasterBL.Put(appraisalCycleMasterEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "AppraisalCyclePut", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]
        [Route("PerformCycle")]
        public HttpResponseMessage PerformCycle(DateTime performCycleCheck, string Type)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycleEntity = appraisalCycleBL.GetDetail(performCycleCheck, Type);
                if (appraisalCycleEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycleEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycleMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]
        [Route("GetDropDownCheck")]
        public HttpResponseMessage GetDropDownCheck(DateTime performCycleCheck, string Type, string DropDownCheck)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var appraisalCycleEntity = appraisalCycleBL.GetAllDetail(performCycleCheck, Type, DropDownCheck);
                if (appraisalCycleEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, appraisalCycleEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalCycleMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Self Assessment Cycle Details for Admin Management
        /// </summary>
        [HttpGet]
        [Route("GetSelfAssessmentCycleDetails")]
        public HttpResponseMessage GetSelfAssessmentCycleDetails(int AppraisalCycleId)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var cycles = appraisalCycleBL.GetSelfAssessmentCycleDetails(AppraisalCycleId);
                if (cycles == null || cycles.Count == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new List<AppraisalCycleYearbreakupDetailEntity>());
                }
                return ResponseMessages.CreateResponseMessage(true, cycles);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetSelfAssessmentCycleDetails", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Close Self Assessment Cycle
        /// </summary>
        [HttpPost]
        [Route("CloseSelfAssessmentCycle")]
        public HttpResponseMessage CloseSelfAssessmentCycle([FromBody] CloseCycleRequest request)
        {
            try
            {
                if (request == null || request.Id <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid request data");
                }

                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var result = appraisalCycleBL.CloseSelfAssessmentCycle(request.Id, request.ClosedBy);
                
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { Message = "Cycle closed successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Failed to close cycle");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "CloseSelfAssessmentCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Reopen Self Assessment Cycle
        /// </summary>
        [HttpPost]
        [Route("ReopenSelfAssessmentCycle")]
        public HttpResponseMessage ReopenSelfAssessmentCycle([FromBody] ReopenCycleRequest request)
        {
            try
            {
                if (request == null || request.Id <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid request data");
                }

                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                var result = appraisalCycleBL.ReopenSelfAssessmentCycle(request.Id);
                
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { Message = "Cycle reopened successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Failed to reopen cycle");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ReopenSelfAssessmentCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), ex.Message);
            }
        }
    }

    // Request models for cycle operations
    public class CloseCycleRequest
    {
        public int Id { get; set; }
        public int ClosedBy { get; set; }
    }

    public class ReopenCycleRequest
    {
        public int Id { get; set; }
    }
}
