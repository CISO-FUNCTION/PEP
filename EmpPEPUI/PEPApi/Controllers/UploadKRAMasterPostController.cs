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
    public class UploadKRAMasterPostController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(UploadKRAMasterController));
        // To Upload KRA for selected Employee
        [HttpPost]
  
        public HttpResponseMessage Post([FromBody] UploadKRAMasterEntiry uploadKRAMasterEntiry)
        {
            try
            {
                if (uploadKRAMasterEntiry == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to upload.");
                }
                else
                {
                    UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();

                    var validations = uploadKRAMasterBL.Validations(uploadKRAMasterEntiry);
                    if ((validations.Count>0))
                    {
                        return ResponseMessages.CreateResponseMessage(false, validations);
                    }

                    bool result = uploadKRAMasterBL.Post(uploadKRAMasterEntiry);
                    if (result)
                        return ResponseMessages.CreateResponseMessage(true, "KRA Uploaded Successfully.");
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while Uploading.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "POST UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage Put([FromBody]  UploadKRAMasterEntiry uploadKRAMasterEntiry)
        {
            try
            {
                if (uploadKRAMasterEntiry == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                var validations = uploadKRAMasterBL.Validations(uploadKRAMasterEntiry);
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                var result = uploadKRAMasterBL.Put(uploadKRAMasterEntiry);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Upload G&Os Updated Successfully.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "uploadKRAMasterEntiryPUT", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpDelete]
  
        public HttpResponseMessage Delete(int UploadKRAId)
        {
            try
            {
                if (UploadKRAId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                bool result = uploadKRAMasterBL.Delete(UploadKRAId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Deleted Successfully.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteuploadKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


    }
}
