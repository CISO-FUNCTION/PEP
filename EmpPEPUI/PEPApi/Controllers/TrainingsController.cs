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
using EmpPEP.WebApi.Common;


namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class TrainingsController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(TrainingsController));

        [HttpGet]
  
        public HttpResponseMessage GetAllTrainingTypes(int id)
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var trainingMaster = trainingBL.GetTrainingTypeList(id);
                if (trainingMaster != null)
                {
                    HttpResponseMessage ret = Request.CreateResponse(HttpStatusCode.OK, trainingMaster);
                    return ret;
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAllTrainingTypes", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        //[Route("api/Training/GetMyTrainingList")]
        //[HttpGet]
        //public HttpResponseMessage Get()
        //{
        //    try
        //    {
        //        int empid = EmployeeAuthentication.GetEmployeeId(Request);
        //        TrainingMasterBL trainingBL = new TrainingMasterBL();
        //        var trainingMaster = trainingBL.GetMyTrainingList(empid);
        //        if (trainingMaster != null)
        //        {
        //            return Request.CreateResponse(HttpStatusCode.OK, trainingMaster);
        //        }
        //        else
        //            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
        //    }
        //    catch (Exception ex)
        //    {
        //        logService.Fatal("EmpPEP.WebApi", "GetMyTrainingList", ex.Message);
        //        return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
        //    }
        //}

        [HttpPost]
  
        public HttpResponseMessage SendTrainingRequest([FromBody] EmployeeTrainingEntity empTrainingEntity)
        {
            try
            {
                if (empTrainingEntity == null)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "INPUT_DATA_NULL");
                }
                else
                {
                    var objBL = new EmployeeTrainingBL();
                    var employeeTraining_ResultEntity = objBL.Insert(empTrainingEntity);
                    if (employeeTraining_ResultEntity != false)
                    {
                        HttpResponseMessage ret = Request.CreateResponse(HttpStatusCode.OK, employeeTraining_ResultEntity);
                        return ret;
                    }
                    else
                        return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SendTrainingRequest", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        /// <summary>
        /// Get all trainings from IPE_Training_List table
        /// </summary>
        [HttpGet]
        [Route("api/Trainings/GetIPETrainingList")]
        public HttpResponseMessage GetIPETrainingList()
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var trainingList = trainingBL.GetIPETrainingList();
                if (trainingList != null && trainingList.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, trainingList);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(true, new List<object>()); // Return empty list
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetIPETrainingList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        //[AuthorizeUser]
        //public HttpResponseMessage Get()
        //{

        //}
    }
}
