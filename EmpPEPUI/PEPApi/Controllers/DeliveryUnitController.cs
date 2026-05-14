using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class DeliveryUnitController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeRoleMasterController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                DeliveryUnitBL deliveryUnitBL = new DeliveryUnitBL();
                var deliveryUnitEntity = deliveryUnitBL.GetDeliveryUnits();
                if (deliveryUnitEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, deliveryUnitEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "deliveryUnitEntity", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int EmployeeId)
        {
            try
            {
                DeliveryUnitBL deliveryUnitBL = new DeliveryUnitBL();

                var deliveryUnitEntity = deliveryUnitBL.GetListDUHRMapping(EmployeeId);
                if (deliveryUnitEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
               
                return ResponseMessages.CreateResponseMessage(true, deliveryUnitEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "deliveryUnitEntity", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

       // [HttpGet]
       // [AuthenticateUser]
        //public HttpResponseMessage Get(string type,int EmployeeId)
        //{
        //    try
        //    {
        //        DeliveryUnitBL deliveryUnitBL = new DeliveryUnitBL();
        //        var deliveryUnitEntity = deliveryUnitBL.GetDUHRMapping(EmployeeId);
        //        if (deliveryUnitEntity == null)
        //        {
        //            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
        //        }
        //        return ResponseMessages.CreateResponseMessage(true, deliveryUnitEntity);
        //    }
        //    catch (Exception ex)
        //    {
        //        logService.Fatal("EmpPEP.WebApi", "deliveryUnitEntity", ex.Message);
        //        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        //    }
        //}
        [HttpGet]
  
        public HttpResponseMessage Get(string type, int EmployeeId)
        {
            try
            {
                DeliveryUnitBL deliveryUnitBL = new DeliveryUnitBL();
                var deliveryUnitEntity = deliveryUnitBL.GetListDUHRMapping(EmployeeId);
                if (deliveryUnitEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, deliveryUnitEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "deliveryUnitEntity", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}