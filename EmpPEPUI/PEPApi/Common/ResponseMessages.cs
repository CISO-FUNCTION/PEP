using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using EmpPEP.BusinessLayer;
using Newtonsoft.Json;
using EmpPEP.BusinessEntities;
using System.Net;

namespace EmpPEP.WebApi.Common
{
    public static class ResponseMessages 
    {
        public static HttpResponseMessage CreateResponseMessage<T>(bool Success,List<T> obj )
        {
            var responseObj = new { Success = Success, Result = obj };

            return new HttpResponseMessage
            {
                Content = new StringContent(JsonConvert.SerializeObject(responseObj),
                                                System.Text.Encoding.UTF8, "application/json")
            };
           
        }

        public static HttpResponseMessage CreateResponseMessage <T> (bool Success, T obj)
        {
     
            var responseObj = new { Success = Success, Result = obj };

            return new HttpResponseMessage
            {
                Content = new StringContent(JsonConvert.SerializeObject(responseObj),
                                                System.Text.Encoding.UTF8, "application/json")
            };

        }
        public static HttpResponseMessage CreateResponseErrorMessage(bool Success, string  ErrorCode, string ErrorMessage)
        {
            var responseObj = new { Success = Success, ErrorCode = ErrorCode, ErrorMessage = ErrorMessage };

            return new HttpResponseMessage
            {
                Content = new StringContent(JsonConvert.SerializeObject(responseObj),
                                                System.Text.Encoding.UTF8, "application/json")
            };

        }


        public static HttpResponseMessage CreateResponseErrorMessage<T>(bool Success, string ErrorCode, T obj)
        {
            var responseObj = new { Success = Success, ErrorCode = ErrorCode, ErrorMessage = obj };

            //var controller = HttpContext.Current.Request.RequestContext.RouteData.Values["controller"].ToString();
            //var action = HttpContext.Current.Request.RequestContext.RouteData.Values["action"].ToString();

            ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();
            ErrorLogBL objErrorLogBL = new ErrorLogBL();

            objErrorLogEntity.Module = "API";
            objErrorLogEntity.Controller = "Login";
            objErrorLogEntity.Action = "GetSSO";
            objErrorLogEntity.Timestamp = DateTime.Now;
            objErrorLogEntity.Error = obj.ToString();
            var empInsertLogin = objErrorLogBL.Insert(objErrorLogEntity);

            return new HttpResponseMessage
            {
                Content = new StringContent(JsonConvert.SerializeObject(responseObj),
                                                System.Text.Encoding.UTF8, "application/json")
            };

        }


    }
}