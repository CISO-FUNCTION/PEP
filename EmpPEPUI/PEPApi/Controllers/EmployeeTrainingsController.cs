using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.Framework.Helper;
using System.ComponentModel.DataAnnotations;
using EmpPEP.WebApi.Models;
using EmpPEP.WebApi.Common;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class EmployeeTrainingsController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(TrainingMasterController));

        /// <summary>
        /// Gets list of trainings suggested by manager(s) to particular employee        
        /// </summary>  
        /// 
  
        public HttpResponseMessage Get(int empId, int appraisalCycleId)
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var trainingMaster = trainingBL.GetMyTrainingList(empId, appraisalCycleId);

                if (trainingMaster == null || trainingMaster.Count < 1)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Not Data Found");
                }

                return ResponseMessages.CreateResponseMessage(true, trainingMaster);

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeTrainings/Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Gets list of trainings requested by employee.        
        /// </summary>        
        ///   
        ///         
  
        [Route("api/EmployeeTrainings/TrainingsRequested")]
        public HttpResponseMessage GetTrainingsRequested(int empId, int appraisalCycleId)
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var trainingMaster = trainingBL.GetRequestedTrainingsList(empId, appraisalCycleId);
                if (trainingMaster == null || trainingMaster.Count < 1)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Not Data Found");
                }

                return ResponseMessages.CreateResponseMessage(true, trainingMaster);

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeTrainings/TrainingsRequested", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Gets list of trainings suggested to employees reporting to a manager
        /// </summary>
        /// <param name="empId"></param>
        /// <param name="appraisalCycleId"></param>        
        ///       
  
        [Route("api/EmployeeTrainings/TrainingsSuggested")]
        public HttpResponseMessage GetTrainingsSuggested(int managerId, int appraisalCycleId)
        {
            try
            {
                EmployeeTrainingBL objBL = new EmployeeTrainingBL();
                var trainingsList = objBL.GetTrainingsSuggested(managerId, appraisalCycleId);

                if (trainingsList == null || trainingsList.Count < 1)
                {
                    return ResponseMessages.CreateResponseMessage(false, "No Data Found");
                }

                return ResponseMessages.CreateResponseMessage(true, trainingsList);
                
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeTrainings/TrainingsSuggested", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Saves the training request received from employee
        /// </summary>
        /// <param name="empTrainingEntity"></param>   
  
                 
        public HttpResponseMessage Post([FromBody] EmployeeTrainingEntity empTrainingEntity)
        {
            try
            {
                if (ModelState.IsValid == false)
                {
                    return ResponseMessages.CreateResponseMessage(false, ModelState);
                }

                #region Code commented used for testing and initializing empTrainingEntity
                //empTrainingEntity = new EmployeeTrainingEntity();
                //empTrainingEntity.TrainingItemId = 1;
                //empTrainingEntity.AppraisalCycleId = 4;
                //empTrainingEntity.EmployeeIds = "1,2,3,4,5";
                //empTrainingEntity.ActionTypeId = 4;
                //empTrainingEntity.TrainingStatusId = 5;
                //empTrainingEntity.Comments = "Please attend the suggested training";
                //empTrainingEntity.SuggestedStartDate = DateTime.Now.AddDays(10);
                //empTrainingEntity.SuggestedEndDate = DateTime.Now.AddDays(30);
                //empTrainingEntity.ActualEndDate = empTrainingEntity.SuggestedEndDate.Value.AddDays(10);
                //empTrainingEntity.ParentTrainingId = 1;
                //empTrainingEntity.Priority = (int)EnumCollection.PRIORITY.High;
                //empTrainingEntity.CreatedBy = 1;
                //empTrainingEntity.ModifiedBy = 1;                 
                #endregion

                if (empTrainingEntity == null)
                {
                    return ResponseMessages.CreateResponseMessage(false, "INPUT_DATA_NULL");
                }

                var objBL = new EmployeeTrainingBL();
                var isSaved = objBL.Insert(empTrainingEntity);
                return ResponseMessages.CreateResponseMessage(isSaved, isSaved == true ? "Training request saved successfully" : "Training request not saved");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "TrainingMaster/Post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Method to delete employee training
        /// </summary>
        /// <param name="trainingId"></param>      

  
        public HttpResponseMessage Delete(int trainingId)
        {
            try
            {
                EmployeeTrainingBL objBL = new EmployeeTrainingBL();
                var isDeleted = objBL.Delete(trainingId);
                return ResponseMessages.CreateResponseMessage(isDeleted, isDeleted == true ? "Training deleted successfully" : "Cannot delete training");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeTrainings/Delete", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
