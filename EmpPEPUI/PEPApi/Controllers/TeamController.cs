using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Linq;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class TeamController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(TeamController));

        // [Route("api/Team/GetSubordinatesByMgrId")]
        [HttpGet]
  
        public HttpResponseMessage Get(int id, int AppraisalCycleId, string viewAwardsMode = "",string report="")
        {
            int ManagerId = id;
            try
            {
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                if (report=="GOFS")
                {
                    var lstSubordinates = empBL.GetSubordinatesByManagerId(ManagerId, AppraisalCycleId, report);
                    if (lstSubordinates != null)
                    {
                        return ResponseMessages.CreateResponseMessage(true, lstSubordinates);
                    }
                }
                    if (empBL.IsManager(id))
                {
                    //added by kinjal to handle  null viewAwardsMode
                    if (viewAwardsMode == string.Empty || viewAwardsMode == null)
                    {
                        var lstSubordinates = empBL.GetSubordinatesByManagerId(ManagerId, AppraisalCycleId);
                        if (lstSubordinates != null)
                        {
                            return ResponseMessages.CreateResponseMessage(true, lstSubordinates);
                        }
                    }
                    else if (viewAwardsMode.ToLower() == "show")
                    {
                        ManagerDashboardBL objBAL = new ManagerDashboardBL();
                        var myEmployeesAwardsList = objBAL.GetMyTeamAwards(id, AppraisalCycleId);
                        if (myEmployeesAwardsList != null)
                        {
                            return ResponseMessages.CreateResponseMessage(true, myEmployeesAwardsList);
                        }
                    }
                    else if (viewAwardsMode.ToLower() == "delegator")
                    {
                        var lstSubordinates = empBL.GetSubordinatesByManagerIdForDelegator(ManagerId, AppraisalCycleId);
                        if (lstSubordinates != null)
                        {
                            return ResponseMessages.CreateResponseMessage(true, lstSubordinates);
                        }
                    }

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "You are not authorized");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Team\\GetSubordinatesByMgrId", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        [Route("api/Team/GetAllEmployee")]
        public HttpResponseMessage GetAllEmployee(int LocationId, int AppraisalCycleId)
        {
            EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
            var mgrList = empMasterBL.GetManager(AppraisalCycleId, LocationId);


            try
            {
                List<GetSubordinatesByManagerId_ResultEntity> allstSubordinates = new List<GetSubordinatesByManagerId_ResultEntity>();
                foreach (var item in mgrList)
                {

                    int ManagerId = item.EmployeeId;
                    EmployeeMasterBL empBL = new EmployeeMasterBL();
                    if (empBL.IsManager(ManagerId))
                    {

                        List<GetSubordinatesByManagerId_ResultEntity> lstSubordinates = empBL.GetSubordinatesByManagerId(ManagerId, AppraisalCycleId);
                        if (lstSubordinates != null)
                        {


                            allstSubordinates.AddRange(lstSubordinates);
                            

                        }


                    }
                }
                return ResponseMessages.CreateResponseMessage(true, allstSubordinates.GroupBy(x => x.EmployeeId)
                 .Select(grp => grp.First())
                 .ToList());

            }

            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Team\\GetSubordinatesByMgrId", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);

            }

            // return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(),"");
        }

        // Get the KRA List on Selection of KRASet from dropdown
        [HttpGet]
  
        public HttpResponseMessage Get(int KRAStatusId, int AppraisalCycleId, int ManagerId)
        {
            try
            {
                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                var emploees = employeeMasterBL.GetEmployeesByKRAStatusId(KRAStatusId, AppraisalCycleId, ManagerId);
                if (emploees == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, emploees);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}