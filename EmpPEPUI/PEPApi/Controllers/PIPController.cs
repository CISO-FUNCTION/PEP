using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using EmpPEP.BusinessEntity;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using System.Linq;
using System.IO;
using System.Net.Http.Headers;
using EmpPEP.WebApi.Controllers;

public class PIPController : ApiController
{
    readonly ILogService logService = new FileLogService(typeof(EmployeeMasterController));
    // GET: PIP


    [HttpGet]
    [Route("api/PIP/GetEmpListbyRM")]
    // [AuthenticateUser]
    public HttpResponseMessage GetEmpListbyRM(int RMID)
    {
        try
        {

            PIPMasterBL PIPMasterBL = new PIPMasterBL();
            var mgrList = PIPMasterBL.GetPIPEmployeesByRM(RMID);
            if (mgrList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, mgrList);

            }
            else
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagers", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }



    [HttpGet]
    [Route("api/PIP/GetEmpPIPDetailbyRoleId")]
    public HttpResponseMessage GetEmpPIPDetailbyRoleId(int LoginId, int RoleId, int FilterId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.GetPIPEmployeeDetailsByRoleId(LoginId, RoleId, FilterId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }




    [HttpPost]
    [Route("api/PIP/PutActionbyHRBP")]

    public HttpResponseMessage PutActionbyHRBP([FromBody] EmployeePIPDetail EmpPIPDetail)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = 0;
            if (EmpPIPDetail != null)
            {
                ActionResult = objPIPBLL.PutActionbyHRBP(EmpPIPDetail.LoginEmpId, EmpPIPDetail.SelectEmpId, EmpPIPDetail.PIPId, EmpPIPDetail.Action, EmpPIPDetail.PIPRejectionReason);
                if (ActionResult > 0)
                {
                    int resultmail = objPIPBLL.SendMailBasedOnStatus(EmpPIPDetail.PIPId, EmpPIPDetail.LoginEmpId, EmpPIPDetail.SelectEmpId, EmpPIPDetail.Action);
                    if (resultmail == 0)
                    {
                        return ResponseMessages.CreateResponseMessage(true, ActionResult);
                    }
                    else { return ResponseMessages.CreateResponseMessage(false, ActionResult); }

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, ActionResult);
            }
            return ResponseMessages.CreateResponseMessage(false, ActionResult);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\PutActionbyHRBP", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }

    [HttpPost]
    [Route("api/PIP/PIP_DeleteEmployeeSavedParamDetByParameterId")]
    public HttpResponseMessage PIP_DeleteEmployeeSavedParamDetByParameterId(int ParamId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = objPIPBLL.PIP_DeleteEmployeeSavedParamDetByParameterId(ParamId);
            if (ActionResult > 0)
            {
                return ResponseMessages.CreateResponseMessage(true, ActionResult);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, ActionResult);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\PutActionbyHRBP", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }




    [HttpPost]
    [Route("api/PIP/PutPIPDocApproveProcess")]
    public HttpResponseMessage PutPIPDocApproveProcess(int LoginEmpId, int SelectEmpId, int PIPDuration, DateTime PIPDiscussionDate, DateTime PIPActualStartDate, int PIPId, int Action, int RoleId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = objPIPBLL.PutPIPDocApproveProcess(LoginEmpId, SelectEmpId, PIPDuration, PIPDiscussionDate, PIPActualStartDate, PIPId, Action, RoleId);
            if (ActionResult > 0)
            {
                int resultmail = objPIPBLL.SendMailBasedOnStatus(PIPId, LoginEmpId, SelectEmpId, Action);
                if (resultmail == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, ActionResult);
                }
                else { return ResponseMessages.CreateResponseMessage(false, ActionResult); }

            }
            else
                return ResponseMessages.CreateResponseMessage(false, ActionResult);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\PutPIPDocApproveProcess", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }

    [HttpPost]
    [Route("api/PIP/PIPReferBackToPM")]
    public HttpResponseMessage PIPReferBackToPM(int LoginEmpId, int SelectedEmpId, int PIPId, int StatusId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = objPIPBLL.Put(LoginEmpId, PIPId, StatusId);
            if (ActionResult > 0)
            {
                int resultmail = objPIPBLL.SendMailBasedOnStatus(PIPId, LoginEmpId, SelectedEmpId, StatusId);
                if (resultmail == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, ActionResult);
                }
                else { return ResponseMessages.CreateResponseMessage(false, ActionResult); }
            }
            else
            {
                return ResponseMessages.CreateResponseMessage(false, ActionResult);
            }
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\PIPReferBackToPM", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }

    [HttpPost]
    [Route("api/PIP/PIP_SubmitFinalResult")]
    public HttpResponseMessage PIP_SubmitFinalResult(int PIPId, int PIPResultId, int PIPExtension, int PIPSubmitBy, int SelectEmpID)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = objPIPBLL.PIP_SubmitFinalResult(PIPId, PIPResultId, PIPExtension, PIPSubmitBy);
            if (ActionResult > 0)
            {

                int resultmail = objPIPBLL.SendMailBasedOnStatus(PIPId, PIPSubmitBy, SelectEmpID, PIPResultId);
                if (resultmail == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, ActionResult);
                }
                else { return ResponseMessages.CreateResponseMessage(false, ActionResult); }

            }
            else
                return ResponseMessages.CreateResponseMessage(false, ActionResult);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_SubmitFinalResult", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }


    [HttpGet]
    [Route("api/PIP/PIP_CheckMandatoryWeekFill")]
    public HttpResponseMessage PIP_CheckMandatoryWeekFill(int PIPId, int WeekId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            int ActionResult = objPIPBLL.PIP_CheckMandatoryWeekFill(PIPId, WeekId);

            if (ActionResult > 0)
            {

                return ResponseMessages.CreateResponseMessage(true, ActionResult);
            }
            else
            {
                return ResponseMessages.CreateResponseMessage(false, ActionResult);
            }
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_CheckMandatoryWeekFill", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }




    [HttpGet]
    [Route("api/PIP/GetEmpRoleListById")]
    public HttpResponseMessage GetEmpRoleListById(int EmpID)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.GetEmpRoleListById(EmpID);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }




    [HttpGet]
    [Route("api/PIP/GetEmpPIPDetailbyEmpId")]
    public HttpResponseMessage GetEmpPIPDetailbyEmpId(int SelectEmpId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPSEmpList = objPIPBLL.GetPIPEmployeeDetailsBySelectEmpID(SelectEmpId);
            if (PIPSEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPSEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPSEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmpPIPDetailbyEmpId", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }

    [HttpGet]
    public HttpResponseMessage GetFile(int EmpId, string filename)
    {
        string filePath = System.Configuration.ConfigurationManager.AppSettings["NonTravelBillFilePath"].ToString() + "/" + EmpId.ToString() + "/" + filename;

        // Replace this with logic to retrieve or generate your file bytes
        byte[] fileBytes = System.IO.File.ReadAllBytes(@filePath);

        HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
        response.Content = new ByteArrayContent(fileBytes);

        // Set content type header
        response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

        // Set the file name
        response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
        {
            FileName = filename
        };

        response.Headers.Add("FileName", filename);

        return response;
    }



    [HttpPost]
    public IHttpActionResult UploadDocFile()
    {

        var Frm = HttpContext.Current.Request.Form;
        PIPMasterBL objPIPBLL = new PIPMasterBL();
        int SelectedEmpID = Convert.ToInt32(Frm["SelectedEmpID"]);

        int LoginEmpId = Convert.ToInt32(Frm["LoginEmpId"]);

        string FileNames = Convert.ToString(Frm["Attachment"]);

        string PIPReason = Convert.ToString(Frm["PIPReason"]);

        int Action = Convert.ToInt32(Frm["Action"]);

        int PIPId = 0;
        if (Frm["PIPId"] != "NaN")
        {
            PIPId = Convert.ToInt32(Frm["PIPId"]);

        }
        if (HttpContext.Current.Request.Files.Count > 0)
        {
            var file = HttpContext.Current.Request.Files[0];

            string filedetails = string.Empty, tempPath = string.Empty, fileSavePath = string.Empty;
            int PIPEmpList = 0;
            for (int i = 0; i < HttpContext.Current.Request.Files.Count; i++)
            {
                var httpPostedFile = HttpContext.Current.Request.Files[i];

                string[] extlist = { ".pdf", ".png", ".jpg", ".jpeg", ".msg", ".txt", ".docx", ".xls", ".xlsx", ".doc", ".eml" };
                string ext = string.Empty;

                filedetails = Path.GetFileNameWithoutExtension(httpPostedFile.FileName).ToString() + Path.GetExtension(httpPostedFile.FileName).ToString();
                tempPath = System.Configuration.ConfigurationManager.AppSettings["NonTravelBillFilePath"].ToString() + "/" + SelectedEmpID + "/";
                if (!(Directory.Exists(tempPath)))
                {
                    Directory.CreateDirectory(tempPath);
                }
                fileSavePath = Path.Combine(tempPath, filedetails);

                if (System.IO.File.Exists(fileSavePath))
                {
                    System.IO.File.Delete(fileSavePath);
                    //return Ok(1);
                }

                httpPostedFile.SaveAs(fileSavePath);


            }
            PIPEmpList = objPIPBLL.Post(SelectedEmpID, LoginEmpId, FileNames, Action, PIPReason);

            if (PIPEmpList > 0)
            {
                int resultmail = objPIPBLL.SendMailBasedOnStatus(PIPEmpList, LoginEmpId, SelectedEmpID, Action);
                if (resultmail == 0)
                {
                    return Ok(2);
                }
                else { return Ok(3); }

            }
            else
            {
                return Ok(3);
            }
        }
        else
        {

            if (PIPId > 0 && HttpContext.Current.Request.Files.Count == 0)
            {
                int PIPEmpList = 0;

                PIPEmpList = objPIPBLL.Post(SelectedEmpID, LoginEmpId, FileNames, Action, PIPReason);

                if (PIPEmpList > 0)
                {
                    int resultmail = objPIPBLL.SendMailBasedOnStatus(PIPId, LoginEmpId, SelectedEmpID, Action);
                    if (resultmail == 0)
                    {
                        return Ok(2);
                    }
                    else { return Ok(3); }

                }
                else
                {
                    return Ok(3);
                }
            }
            else
            {
                return Ok(3);
            }

        }
    }



    [HttpPost]
    [Route("api/PIP/SavePIPMeasurementAgainstEmployee")]
    public HttpResponseMessage SavePIPMeasurementAgainstEmployee([FromBody] PIPIssueMeasuremntDetails PIPData)
    {
        try
        {
            int Result = 0;
            PIPMasterBL objRatingBLL = new PIPMasterBL();
            Result = objRatingBLL.SavePIPMeasurementAgainstEmployee(PIPData.ParamterId, PIPData.PIPId, PIPData.LoginEmpId, PIPData.SelectEmpID, PIPData.ProgressIssue, PIPData.Deliverables, PIPData.ProgressMeasuremnt, PIPData.CreatedBy);
            if (Result > 0)
            {
                return ResponseMessages.CreateResponseMessage(true, Result);

            }
            else
            {
                return ResponseMessages.CreateResponseMessage(false, Result);
            }
        }
        catch (Exception ex)
        {
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
        }
    }


    [HttpPost]
    [Route("api/PIP/AddPIPWeeklyFeedback")]
    public HttpResponseMessage AddPIPWeeklyFeedback([FromBody] AddPIPWeeklyFeedback PIPFeedback)
    {
        try
        {
            PIPMasterBL objRatingBLL = new PIPMasterBL();

            if (PIPFeedback == null)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to give feedback.");
            }
            else
            {
                PIPMasterBL objPIPBLL = new PIPMasterBL();

                bool result;

                result = objPIPBLL.Update(PIPFeedback);

                if (result)
                {
                    if (PIPFeedback.Status == 2)
                    {
                        int resultmail = objPIPBLL.SendMailOnSubmitFeedback(PIPFeedback.PIPId, PIPFeedback.LoginEmpID, PIPFeedback.WeekNo);
                        if (resultmail == 0)
                        {
                            return ResponseMessages.CreateResponseErrorMessage(true, HttpStatusCode.NotFound.ToString(), "Feedback submitted successfully.");
                        }
                        else { return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending mail..."); }
                    }
                    else
                    {

                        return ResponseMessages.CreateResponseErrorMessage(true, HttpStatusCode.NotFound.ToString(), "Feedback saved successfully.");
                    }

                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending feedback...");
                }
            }

        }
        catch (Exception ex)
        {
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
        }
    }



    [HttpGet]
    [Route("api/PIP/PIP_GetEmployeeSavedParameterDetailsByPIPId")]
    public HttpResponseMessage PIP_GetEmployeeSavedParameterDetailsByPIPId(int PIPId, int SEmpId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetEmployeeSavedParameterDetailsByPIPId(PIPId, SEmpId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }



    [HttpGet]
    [Route("api/PIP/PIP_GetEmployeeAllPIPDetailsByEmpID")]
    public HttpResponseMessage PIP_GetEmployeeAllPIPDetailsByEmpID(int SEmpId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetEmployeeAllPIPDetailsByEmpID(SEmpId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }


    [HttpGet]
    [Route("api/PIP/GetActionHistory")]
    public HttpResponseMessage GetActionHistory(int PIPId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPHistory = objPIPBLL.GetActionHistory(PIPId);
            if (PIPHistory != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPHistory);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPHistory);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\GetActionHistory", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }



    [HttpGet]
    [Route("api/PIP/PIP_GetFeedbackByParamId")]
    public HttpResponseMessage PIP_GetFeedbackByParamId(int ParameterId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetFeedbackByParamId(ParameterId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_GetFeedbackByParamId", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }

    [HttpGet]
    [Route("api/PIP/PIP_GetParamterDetailByParamId")]
    public HttpResponseMessage PIP_GetParamterDetailByParamId(int PIPId, int WeekNo)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetParamterDetailByParamId(PIPId, WeekNo);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_GetParamterDetailByParamId", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }


    [HttpGet]
    [Route("api/PIP/GetPIPEndateExceptHoliday_Weekends")]
    public HttpResponseMessage GetPIPEndateExceptHoliday_Weekends(int PIPId, DateTime PIPEndDate)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var ValidPIPEndDate = objPIPBLL.GetPIPEndateExceptHoliday_Weekends(PIPId, PIPEndDate);
            if (ValidPIPEndDate != null)
            {
                return ResponseMessages.CreateResponseMessage(true, ValidPIPEndDate);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, ValidPIPEndDate);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\GetPIPEndateExceptHoliday_Weekends", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }




    [HttpGet]
    [Route("api/PIP/PIP_GetEligibleExtension")]
    public HttpResponseMessage PIP_GetEligibleExtension(int PIPId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetEligibleExtension(PIPId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_GetEligibleExtension", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }
    [HttpGet]
    [Route("api/PIP/PIP_GetPIPResultValues")]
    public HttpResponseMessage PIP_GetPIPResultValues(int PIPId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetPIPResultValues(PIPId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_GetPIPResultValues", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }







    [HttpGet]
    [Route("api/PIP/PIP_GetTotalWeeksForFeedback")]
    public HttpResponseMessage PIP_GetTotalWeeksForFeedback(int ParameterId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetTotalWeeksForFeedback(ParameterId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "PIP\\PIP_GetTotalWeeksForFeedback", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }
    [HttpGet]
    [Route("api/PIP/PIP_GetEmployeeSavedParameterDetailsByParameterId")]
    public HttpResponseMessage PIP_GetEmployeeSavedParameterDetailsByParameterId(int ParameterId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetEmployeeSavedParameterDetasByParamId(ParameterId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }


    [HttpGet]
    [Route("api/PIP/PIP_GetEmpSavedFeedbackDetByWeekId")]
    public HttpResponseMessage PIP_GetEmpSavedFeedbackDetByWeekId(int WeekId)
    {
        try
        {

            PIPMasterBL objPIPBLL = new PIPMasterBL();
            var PIPEmpList = objPIPBLL.PIP_GetEmpSavedFeedbackDetByWeekId(WeekId);
            if (PIPEmpList != null)
            {
                return ResponseMessages.CreateResponseMessage(true, PIPEmpList);

            }
            else
                return ResponseMessages.CreateResponseMessage(false, PIPEmpList);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPIPEmployeeDetailsByRMID", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }



    [HttpGet]
    [Route("api/PIP/PIP_ResultDashboard")]
    public HttpResponseMessage Get(int ManagerId)
    {
        try
        {
            PIPMasterBL PIPMasterBL = new PIPMasterBL();
            var emploees = PIPMasterBL.PIP_CurrentlyPIPStatusByEmployeeId(ManagerId);
            if (emploees == null)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            return ResponseMessages.CreateResponseMessage(true, emploees);
        }
        catch (Exception ex)
        {
            logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        }
    }
}
