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
    public class QuestionaryMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(QuestionaryMasterController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                QuestionaryMasterBL QMBL = new QuestionaryMasterBL();

                var QuestionaryMaster = QMBL.Get();

                if (QuestionaryMaster != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, QuestionaryMaster);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GET", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int AreaId,string Type)
        {
            try
            {
                QuestionaryMasterBL QMBL = new QuestionaryMasterBL();

                var QuestionaryMaster = QMBL.Get(AreaId,Type);

                if (QuestionaryMaster != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, QuestionaryMaster);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GET", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpDelete]
  
        public HttpResponseMessage Delete(int QuestionnaireId)
        {
            try
            {
                //why is this line written
                // int FromEmployeeId = Convert.ToInt32(Request.Headers.GetValues("X-EmpNo").ToString());

                if (QuestionnaireId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                QuestionaryMasterBL QMBL = new QuestionaryMasterBL();
                bool result = QMBL.Delete(QuestionnaireId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Delete Questionnaire", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int id)
        {
            try
            {


                QuestionaryMasterBL questionMaster = new QuestionaryMasterBL();
                var questionMasterEntity = questionMaster.Get(id);

                if (questionMasterEntity != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, questionMasterEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Getquestionnairebyquestionid", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpPost]
  
        public HttpResponseMessage Post([FromBody] QuestionaryMasterEntity questionMasterEntity)
        {
            try
            {
                if (questionMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                QuestionaryMasterBL questionMasterBL = new QuestionaryMasterBL();
                var validations = questionMasterBL.Validations(questionMasterEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                var result = questionMasterBL.Post(questionMasterEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { QuestionnaireId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "QuestionaryMasterPost", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage Put([FromBody]  QuestionaryMasterEntity questionMasterEntity)
        {
            try
            {
                if (questionMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                QuestionaryMasterBL questionMasterBL = new QuestionaryMasterBL();
                var validations = questionMasterBL.Validations(questionMasterEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                var result = questionMasterBL.Put(questionMasterEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "QuestionMasterPut", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
