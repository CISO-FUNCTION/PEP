using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;


namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class TrainingMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(TrainingMasterController));

        /// <summary>
        /// Gets Training enum list and returns dictionary collection
        /// </summary>                
  
        public HttpResponseMessage Get()
        {
            try
            {
                //authentication part is pending and needs to be added in commong attribute [PepAuthorize] -> which neeeds to be created.
                TrainingMasterBL bal = new TrainingMasterBL();
                var trainingTypeList = bal.GetTrainingTypes();
                if (trainingTypeList == null)
                {                    
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, trainingTypeList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "TrainingMaster/Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);                
            }
        }

        /// <summary>
        /// Gets Training list based on training type.
        /// </summary>
        /// <param name="trainingtypeid">Type of training id</param>
        /// <returns></returns>  
  
        public HttpResponseMessage Get(int trainingtypeid)
        {
            try
            {
                //authentication part is pending and needs to be added in commong attribute [PepAuthorize] -> which neeeds to be created.
                TrainingMasterBL bal = new TrainingMasterBL();
                var trainingTypeList = bal.GetTrainingTypeList(trainingtypeid);
                if (trainingTypeList == null)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
                
                return ResponseMessages.CreateResponseMessage(true, trainingTypeList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "TrainingMaster/Get?trainingtypeid", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);                
            }
        }

    }
}
