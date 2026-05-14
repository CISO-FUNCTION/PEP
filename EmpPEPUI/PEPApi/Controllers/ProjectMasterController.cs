using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class ProjectMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeMasterController));

        //GEt the list of employees by ProjectId
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int ProjectId)
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetEmployeeByProjectId(AppraisalCycleId, ProjectId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByProjectId", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //Get the Projects to fill Autocomplete by Project Name

        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, string ProjectName)
        {
            try
            {

                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                var projList = uploadKRAMasterBL.GetProjects(AppraisalCycleId, ProjectName);
                if (projList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, projList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetProjectsBY Name", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
