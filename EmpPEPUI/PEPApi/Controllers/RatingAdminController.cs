using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System.Collections.Generic;
using EmpPEP.BusinessEntities;
using EmpPEP.WebApi.Common;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Security.Claims;


namespace EmpPEP.WebApi.Controllers
{
    [AuthorizeAttribute]
    public class RatingAdminController : ApiController
    {
        // GET: Rating
        readonly ILogService logService = new FileLogService(typeof(RatingAdminController));

        [HttpPost]
        [Route("api/RatingAdmin/GetRatingsByRole")]
  
        //int AppraisalCycleId, int LoginEmployeeId, string GDLId, string DPId, string InputterId, int Role
        public HttpResponseMessage GetRatingsByRole([FromBody]EmployeeDataForAdminEntity ratingAdminInfo)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != ratingAdminInfo.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetHRBPAdminEmployeeRatingDetailsYearWise(ratingAdminInfo.AppraisalCycleId, ratingAdminInfo.LoginEmployeeId, ratingAdminInfo.GDLId, ratingAdminInfo.DPId, ratingAdminInfo.InputterId, ratingAdminInfo.Role, ratingAdminInfo.CriticalityPriorityId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmpRatingGDLandRMWise", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("api/RatingAdmin/GetValidRecommendedDesignations")]

        //int AppraisalCycleId, int LoginEmployeeId, string GDLId, string DPId, string InputterId, int Role
        public HttpResponseMessage GetValidRecommendedDesignations()
        {
            try
            {

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetValidRecommendedDesignations();
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmpRatingGDLandRMWise", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPost]
        [Route("api/RatingAdmin/RatingReferBack")]
  
        public HttpResponseMessage RatingReferBack([FromBody] EmployeeDataForAdminFiltersEntity ReferbackData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != ReferbackData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();

                if (ReferbackData == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please select filters properly to referback ratings.");
                }
                else
                {
                    PEPratingMasterBL PEPratingkBL = new PEPratingMasterBL();

                    var Result = PEPratingkBL.ReferBackForAdmin(ReferbackData.AppraisalCycleId, ReferbackData.LoginEmployeeId, ReferbackData.GDLHeadSpan);
                    if (Result != 0)
                    {
                        return ResponseMessages.CreateResponseMessage(true, Result);

                    }
                    else
                        return ResponseMessages.CreateResponseMessage(false, Result);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }

        }


        [HttpPost]
        [Route("api/RatingAdmin/SendMailAfterAction")]
    // create for feedback autopaste mail : created by kaushal saini || created Date :6 august 2019
        public HttpResponseMessage SendMailAfterAction([FromBody] EmployeeDataEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.EmpId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();

                int result = ratingMasterBL.SendMailAfterAction(empData.EmpId, empData.action, empData.selectedEmployees, empData.Role);


                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "There is some Error!!");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SendMailAfterAction", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/RatingAdmin/AdminRatingApproved")]
  
        public HttpResponseMessage AdminRatingApproved([FromBody] List<EmployeeRatingNormailizationDetailsEntity> employeeRatingNormailizationDetailEntity)
        {
            try
            {

                int result = 0;
                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();

                EmployeeRatingNormailizationDetailsEntity employeeRatingNormailizationDetail = new EmployeeRatingNormailizationDetailsEntity();

                if (employeeRatingNormailizationDetailEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to give rating.");
                }
                else
                {
                    PEPratingMasterBL PEPratingkBL = new PEPratingMasterBL();

                    foreach (var ERN in employeeRatingNormailizationDetailEntity)
                    {
                        employeeRatingNormailizationDetail.AppraisalCycleId = ERN.AppraisalCycleId;
                        employeeRatingNormailizationDetail.Id = ERN.Id;
                        employeeRatingNormailizationDetail.ModifiedBy = ERN.ModifiedBy;
                        result = PEPratingBL.AdminRatingApproved(employeeRatingNormailizationDetail);  // // Update main rating Table

                    }

                }
                if (result != 0)
                    return ResponseMessages.CreateResponseMessage(true, "Approved Successfully!");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending feedback...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }

        }

        [HttpPost]
        [Route("api/RatingAdmin/ShowToEmpApproved")]
  
        public HttpResponseMessage ShowToEmpApproved([FromBody] List<EmployeeRatingNormailizationDetailsEntity> employeeRatingNormailizationDetailEntity)
        {
            try
            {
                int result = 0;
                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();

                EmployeeRatingNormailizationDetailsEntity employeeRatingNormailizationDetail = new EmployeeRatingNormailizationDetailsEntity();

                if (employeeRatingNormailizationDetailEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to give rating.");
                }
                else
                {
                    PEPratingMasterBL PEPratingkBL = new PEPratingMasterBL();

                    foreach (var ERN in employeeRatingNormailizationDetailEntity)
                    {
                        employeeRatingNormailizationDetail.AppraisalCycleId = ERN.AppraisalCycleId;
                        employeeRatingNormailizationDetail.Id = ERN.Id;
                        employeeRatingNormailizationDetail.ModifiedBy = ERN.ModifiedBy;
                        result = PEPratingBL.ShowToEmpApproved(employeeRatingNormailizationDetail);  // // Update main rating Table

                    }

                }
                if (result != 0)
                    return ResponseMessages.CreateResponseMessage(true, "Approved Successfully!");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending feedback...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }

        }


        [HttpGet]
        [Route("api/RatingAdmin/GetNormalisationAppraisalCycleGradeMapping")]
  
        public HttpResponseMessage GetNormalisationAppraisalCycleGradeMapping()
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetNormalisationAppraisalCycleGradeMapping();
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpPost]
        [Route("api/RatingAdmin/SaveNormalisationAppraisalCycleGradeMapping")]
  
        public HttpResponseMessage SaveNormalisationAppraisalCycleGradeMapping([FromBody] PEP_ADMIN_NormalisationAppraisalCycleGradeMappingEntity normalisationAppraisalCycleGradeMappingEntity)
        {
            try
            {
                int result = 0;

                if (normalisationAppraisalCycleGradeMappingEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data.");
                }
                else
                {
                    PEPratingMasterBL PEPratingBL = new PEPratingMasterBL();
                    if (normalisationAppraisalCycleGradeMappingEntity.Id <= 0)
                    {
                        result = PEPratingBL.Insert(normalisationAppraisalCycleGradeMappingEntity);  // create new cycle grade mapping record
                    }
                    else
                    {
                        result = PEPratingBL.Update(normalisationAppraisalCycleGradeMappingEntity);  // Update cycle grade mapping record
                    }
                }
                if (result != 0)
                    return ResponseMessages.CreateResponseMessage(true, "Added Successfully!");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while adding record...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpPost]
        [Route("api/RatingAdmin/SavePromotionGradeConfiguration")]
  
        public HttpResponseMessage SavePromotionGradeConfiguration([FromBody] PromotionPercentageYearGenderWiseEntity promotionPercentageYearGenderWiseEntity)
        {
            try
            {
                int result = 0;
                bool isUpdateOperation = false;

                if (promotionPercentageYearGenderWiseEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data.");
                }
                else
                {
                    PEPratingMasterBL PEPratingBL = new PEPratingMasterBL();
                    if (promotionPercentageYearGenderWiseEntity.Id <= 0)
                    {
                        result = PEPratingBL.Insert(promotionPercentageYearGenderWiseEntity); // Insert 
                    }
                    else
                    {
                        isUpdateOperation = true;
                        result = PEPratingBL.Update(promotionPercentageYearGenderWiseEntity);  // Update
                    }
                }
                if (result != 0)
                {
                    if (isUpdateOperation)
                    {
                        return ResponseMessages.CreateResponseMessage(true, "Grade Configuration Updated Successfully!");
                    }
                    else
                    {
                        return ResponseMessages.CreateResponseMessage(true, "Grade Configuration Added Successfully!");
                    }
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while adding record...");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }



        [HttpGet]
  
        [Route("api/RatingAdmin/GetGDLRMList")]
    
        public HttpResponseMessage GetGDLRMList(int DropdownValue, string GDLId, string DPId)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var gdlrmlist = ratingMasterBL.GetGDLRMList(DropdownValue, GDLId, DPId);
                if (gdlrmlist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, gdlrmlist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetGDLRMList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }





        [HttpPost]
  
        [Route("api/RatingAdmin/GetMaleFemaleNormalization")]
        public HttpResponseMessage GetMaleFemaleNormalization([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetHRBPAdminMalefemaleNorm(empData.LoginEmployeeId, empData.AppraisalCycleId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus,empData.Promotion);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpPost]
  
        [Route("api/RatingAdmin/GetRatingOverallData")]
        public HttpResponseMessage GetRatingOverallData([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRatingHRBPAdminOverallData(empData.LoginEmployeeId, empData.AppraisalCycleId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus,empData.Promotion);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }



        [HttpPost]
  
        [Route("api/RatingAdmin/GetDataForChart")]
        public HttpResponseMessage GetDataForChart([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetHRBPAdminDataForChart(empData.LoginEmployeeId, empData.AppraisalCycleId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus, empData.Promotion);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }



        [HttpPost]
  
        [Route("api/RatingAdmin/GetRatingPromotionDetails")]
        public HttpResponseMessage GetRatingPromotionDetails([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetHRBPAdminRatingPromotionDetails(empData.AppraisalCycleId, empData.LoginEmployeeId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpPost]
  
        [Route("api/RatingAdmin/GetRatingMaleFemalePromotionDetails")]
        public HttpResponseMessage GetRatingMaleFemalePromotionDetails([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetHRBPAdminRatingMaleFemalePromotionDetails(empData.AppraisalCycleId, empData.LoginEmployeeId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpPost]
  
        [Route("api/RatingAdmin/GetDataforPromotionGraph")]
        public HttpResponseMessage GetDataforPromotionGraph([FromBody]EmployeeDataForAdminFiltersEntity empData)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != empData.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetHRBPAdminDataforPromotionGraph(empData.AppraisalCycleId, empData.LoginEmployeeId, empData.GDLHeadSpan, empData.DPSpan, empData.RMSpan, empData.GradeId, empData.LocationId, empData.GroupAccountId, empData.Gender, empData.EmpStatus, empData.Role, empData.DeliveryStatus);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }




        [HttpGet]
  
        [Route("api/RatingAdmin/GetAdminNormRatingVisibility")]
        public HttpResponseMessage GetAdminNormRatingVisibility(int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetAdminRatingVisibility(AppraisalCycleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        [Route("api/RatingAdmin/GetPromotionGradeConfiguration")]
        public HttpResponseMessage GetPromotionGradeConfiguration(int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetPromotionGradeConfiguration(AppraisalCycleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
        [HttpPost]
        [Route("api/RatingAdmin/SaveNormalisationRatingVisibility")]
  
        public HttpResponseMessage SaveNormalisationRatingVisibility([FromBody] GetAdminRatingVisibilityEntity adminRatingVisibilityEntity)
        {
            try
            {
                int result = 0;

                if (adminRatingVisibilityEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data.");
                }
                else
                {
                    PEPratingMasterBL PEPratingBL = new PEPratingMasterBL();
                    if (adminRatingVisibilityEntity.Id <= 0)
                    {
                        result = PEPratingBL.Insert(adminRatingVisibilityEntity); // Insert 
                    }
                    else
                    {
                        result = PEPratingBL.Update(adminRatingVisibilityEntity);  // Update
                    }
                }
                if (result != 0)
                    return ResponseMessages.CreateResponseMessage(true, "Added Successfully!");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while adding record...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("api/RatingAdmin/BindRolesByApprCycle")]
        public HttpResponseMessage BindRolesByApprCycle(int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.BindRolesByApprCycle(AppraisalCycleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("api/RatingAdmin/BindStartDateByRole")]
        public HttpResponseMessage BindStartDateByRole(int AppraisalCycleId, int Role)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.BindStartDateByRole(AppraisalCycleId, Role);

                
                    return ResponseMessages.CreateResponseMessage(true, new
                    {
                        StartDate = data.StartDate.HasValue ? data.StartDate.Value.ToString("yyyy-MM-dd") : null,
                        EndDate = data.EndDate.HasValue ? data.EndDate.Value.ToString("yyyy-MM-dd") : null
                    });

                
                
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, "InternalServerError", ex.Message);
            }
        }


        [HttpGet]
        [Route("api/RatingAdmin/GetAppraisalCycleRoleMapping")]
        public HttpResponseMessage GetAppraisalCycleRoleMapping()
        {
            try
            {

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetAppraisalCycleRoleMapping();
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "RatingAdmin\\GetAppraisalCycleRoleMapping", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPost]
        [Route("api/RatingAdmin/SaveNormalisationRoleMapping")]

        public HttpResponseMessage SaveNormalisationRoleMapping([FromBody] PEP_ADMIN_GetAppraisalCycleRoleMapping_ResultEntity RoleMappingEntity)
        {
            try
            {
                int result = 0;

                if (RoleMappingEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data.");
                }
                else
                {
                    PEPratingMasterBL PEPratingBL = new PEPratingMasterBL();
                    if (RoleMappingEntity.Id <= 0)
                    {
                        result = PEPratingBL.SaveNormalisationRoleMapping(RoleMappingEntity);  // create new cycle grade mapping record
                    }
                }
                if (result > 0)
                    return ResponseMessages.CreateResponseMessage(true, "Added Successfully!");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while adding record...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

       
        [HttpPost]
        [Route("api/RatingAdmin/UploadDataFromExcel")]
        public HttpResponseMessage UploadDataFromExcel([FromBody] List<EmployeeRatingDetails_Entity> details)
        {
            try
            {
                PEPratingMasterBL PEPratingBL = new PEPratingMasterBL();
                if (details == null || !details.Any())
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Please provide valid data to give ratings.");
                }

                // Save all data at once using the business logic
                int result = PEPratingBL.UploadDataFromExcel(details);

                if (result > 0)
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { success = true, message = "Data uploaded successfully!" });
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "An error occurred while uploading the data.");
                }
            }
            catch (Exception ex)
            {
                // Log the error
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}