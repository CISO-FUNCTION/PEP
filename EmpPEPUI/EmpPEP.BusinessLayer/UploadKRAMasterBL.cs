using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.BusinessLayer
{
   public class UploadKRAMasterBL
   {
       #region "Public Methods"
       public List<UploadKRAMasterEntiry> Get()
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               var UploadKRA = uploadKRARepository.Get();

               if (UploadKRA.Any())
               {
                   return Utility.ConvertToList<UploadKRAMaster, UploadKRAMasterEntiry>(UploadKRA);

               }
               return null;
           }
       }

       // Get The KRASet to display in dropdown
       public List<UploadKRASetMasterEntity> GetKRASet()
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               var UploadKRA = uploadKRARepository.GetKRASet();

               if (UploadKRA.Any())
               {
                   return Utility.ConvertToList<UploadKRASetMaster, UploadKRASetMasterEntity>(UploadKRA);

               }
               return null;
           }
       }

      

       //Get the List of Projects to display in the  dropdown
       public List<GetProjects_ResultEntity> GetProjects(int AppraisalCycleId, string ProjectName)
       {
           using (var repository = new UploadKRAMasterRepository())
           {
               var empList = repository.GetProjects(AppraisalCycleId, ProjectName);

               if (empList.Any())
               {
                   return Utility.ConvertToList<GetProjects_Result, GetProjects_ResultEntity>(empList);
               }
               return null;
           }
       }
       
       // Get the KRA List on Selection of KRASet from dropdown
       public List<UploadKRAMasterEntiry> Get(int KRASetId, string IsSet)
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               var UploadKRA = uploadKRARepository.Get(KRASetId, "Y");

               if (UploadKRA.Any())
               {
                   return Utility.ConvertToList<UploadKRAMaster, UploadKRAMasterEntiry>(UploadKRA);

               }
               return null;
           }
       }

       public UploadKRAMasterEntiry Get(int id)
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               UploadKRAMaster uploadKRAMaster = new UploadKRAMaster();
               uploadKRAMaster = uploadKRARepository.Get(id);
               UploadKRAMasterEntiry obj = new UploadKRAMasterEntiry();
               return (UploadKRAMasterEntiry)Utility.ConvertToObject(uploadKRAMaster, obj);
           }
       }


       public bool Post(UploadKRAMasterEntiry uploadKRAMasterEntiry)
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               UploadKRAMaster uploadKRAMaster = new UploadKRAMaster();
               uploadKRAMaster = (UploadKRAMaster)Utility.ConvertToObject(uploadKRAMasterEntiry, uploadKRAMaster);
               uploadKRAMaster.CreatedOn = DateTime.Now;
              var result= uploadKRARepository.Insert(uploadKRAMaster);
              return result > 0 ? true : false;
           }
       }

       public bool Put(UploadKRAMasterEntiry uploadKRAMasterEntiry)
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               UploadKRAMaster uploadKRAMaster = uploadKRARepository.Get(uploadKRAMasterEntiry.UploadKRAId);
               if (uploadKRAMaster != null)
               {
                   uploadKRAMaster.GoalType = uploadKRAMasterEntiry.GoalType;
                   uploadKRAMaster.GoalDescription = uploadKRAMasterEntiry.GoalDescription;
                   uploadKRAMaster.Weightage = uploadKRAMasterEntiry.Weightage;
                   uploadKRAMaster.ActionStep = uploadKRAMasterEntiry.ActionStep;
                   uploadKRAMaster.Measure = uploadKRAMasterEntiry.Measure;
                   uploadKRAMaster.TargetDate = uploadKRAMasterEntiry.TargetDate;
                   uploadKRAMaster.KRAFromDate = uploadKRAMasterEntiry.KRAFromDate;
                   uploadKRAMaster.KRAToDate = uploadKRAMasterEntiry.KRAToDate;
                   uploadKRAMaster.ModifiedBy = uploadKRAMasterEntiry.ModifiedBy;
                   uploadKRAMaster.ModifiedOn = DateTime.Now;
                   return uploadKRARepository.Update(uploadKRAMaster);
               }
               return false;
           }
       }

       public bool Delete(int id)
       {
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
               UploadKRAMaster uploadKRAMaster = new UploadKRAMaster();
               uploadKRAMaster.UploadKRAId = id;
               return uploadKRARepository.Delete(uploadKRAMaster);
           }
       }

       public List<ValidationsEntity> Validations(UploadKRAMasterEntiry employeeKRAEntity)
       {
           List<ValidationsEntity> validationsEntity = new List<ValidationsEntity>();
           AppraisalCycleMaster appraisalCycle = new AppraisalCycleMaster();
           using (var appraisalCycleRepository = new AppraisalCycleRepository())
           {
               appraisalCycle = appraisalCycleRepository.Get(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId));
           }
           //Date Validations
           ValidationHelper helper = new ValidationHelper();
           using (var uploadKRARepository = new UploadKRAMasterRepository())
           {
              

               // KRA upload dates align with selected cycle master; skip appraisal cycle boundary checks.
               //if (employeeKRAEntity.KRAFromDate < appraisalCycle.StartDate)
               //{
               //    validationsEntity.Add(helper.CreateValidation("KRAFromDate", employeeKRAEntity.KRAFromDate.ToString(), "From date should be greater than Appraisal cycle start date."));
               //}
               //if (employeeKRAEntity.KRAToDate > appraisalCycle.EndDate)
               //{
               //    validationsEntity.Add(helper.CreateValidation("KRAToDate", employeeKRAEntity.KRAToDate.ToString(), "End date should be less than Appraisal cycle end date."));
               //}

               //if (employeeKRAEntity.KRAFromDate > appraisalCycle.EndDate)
               //{
               //    validationsEntity.Add(helper.CreateValidation("KRAFromDate", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than Appraisal cycle end date."));
               //}
               if (employeeKRAEntity.KRAFromDate > employeeKRAEntity.KRAToDate)
               {
                   validationsEntity.Add(helper.CreateValidation("KRAFromDate", employeeKRAEntity.KRAFromDate.ToString(), "From date should be less than to date."));
               }

               if ((employeeKRAEntity.Weightage <= 0) || (employeeKRAEntity.Weightage > 100))//Weighatage validation between 1 to 100
               {
                   validationsEntity.Add(helper.CreateValidation("Weightage", employeeKRAEntity.Weightage.ToString(), "Weightage should be between 1 to 100."));
               }
               #region GoalValidations

               List<UploadKRAMaster> uploadKRAMaster = new List<UploadKRAMaster>();
               uploadKRAMaster = uploadKRARepository.Get(Convert.ToInt32(employeeKRAEntity.UploadKRASetID), "Y");

               string goaltype = employeeKRAEntity.GoalType;
               decimal weightage = Convert.ToDecimal(employeeKRAEntity.Weightage);
               int rowcountop = 0, rowcountdp = 0;
               decimal weightageop = 0.0M, weightagedp = 0.0M;
               //Approve
               foreach (var obj in uploadKRAMaster)
               {
                   if (obj.GoalType == "O")
                   {
                       if (obj.UploadKRAId != employeeKRAEntity.UploadKRAId)
                       {
                           weightageop += (Convert.ToDecimal(obj.Weightage));
                           rowcountop += 1;
                       }
                   }
                   if (obj.GoalType == "D")
                   {
                       if (obj.UploadKRAId != employeeKRAEntity.UploadKRAId)
                       {
                           weightagedp += (Convert.ToDecimal(obj.Weightage));
                           rowcountdp += 1;
                       }
                   }
               }
               if (goaltype == "O")
               {
                   rowcountop++;
                   weightageop += weightage;
               }
               else
               {
                   rowcountdp++;
                   weightagedp += weightage;
               }
               if (rowcountop > 6)
               {
                   validationsEntity.Add(helper.CreateValidation("GoalType", "Operational", "Maximum of 6 Operational Goals only!"));
               }
               if ((weightageop + weightagedp) > 100)
               {
                   validationsEntity.Add(helper.CreateValidation("Weightage", Convert.ToString(weightagedp + weightageop), "Total weightage should be 100 to finalize the Goals."));
               }
           }

               #endregion GoalValidations
           return validationsEntity;

       }
       #endregion
   }
}
