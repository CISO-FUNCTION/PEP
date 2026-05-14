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
    public class EmployeeGradeMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeGradeMasterController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                EmployeeGradeMasterBL EGMBL = new EmployeeGradeMasterBL();

                var EmployeeGrade = EGMBL.Get();

                if (EmployeeGrade != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, EmployeeGrade);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get()", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int gradeId)
        {
            try
            {
                EmployeeGradeMasterBL EGMBL = new EmployeeGradeMasterBL();

                var EmployeeGrade = EGMBL.Get(gradeId);

                if (EmployeeGrade != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, EmployeeGrade);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get()", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int gradeId,int appraisalcycleid)
        {
            try
            {
                EmployeeMasterBL EGMBL = new EmployeeMasterBL();

                var EmployeeGrade = EGMBL.GetEmployeesByGradeId(gradeId, appraisalcycleid);

                if (EmployeeGrade != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, EmployeeGrade);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get()", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int gradeId, int appraisalcycleid,int DuId)
        {
            try
            {
                EmployeeMasterBL EGMBL = new EmployeeMasterBL();

                var EmployeeGrade = EGMBL.GetEmployeesByGradeId_DU(gradeId, appraisalcycleid, DuId);

                if (EmployeeGrade != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, EmployeeGrade);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get()", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
