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
    public class QuestionaryMasterBL
    {
        #region "Public Methods"

        public List<QuestionaryMasterEntity> Get()
        {
            using (var questionariesMasterRepository = new QuestionariesMasterRepository())
            {
                var questionaries = questionariesMasterRepository.Get();

                if (questionaries.Any())
                {
                    return Utility.ConvertToList<QuestionairesMaster, QuestionaryMasterEntity>(questionaries);

                }
                return null;
            }
        }
        public List<QuestionaryMasterEntity> Get(int AreaId, string Type)
        {
            using (var questionariesMasterRepository = new QuestionariesMasterRepository())
            {
                var questionaries = questionariesMasterRepository.Get(AreaId,Type);

                if (questionaries.Any())
                {
                    return Utility.ConvertToList<QuestionairesMaster, QuestionaryMasterEntity>(questionaries);

                }
                return null;
            }
        }
        public bool Delete(int QuestionnaireId)
        {
            using (var questionMasterRepository = new QuestionariesMasterRepository())
            {
                QuestionairesMaster questionMaster = new QuestionairesMaster();
                questionMaster.QuestionaireId = QuestionnaireId;
                return questionMasterRepository.Delete(questionMaster);
            }
        }
        public QuestionaryMasterEntity Get(int QuestionnaireId) //picks one KRA of a specific employee
        {
            using (var quesMasterRepository = new QuestionariesMasterRepository())
            {
                var questionMaster = quesMasterRepository.Get(QuestionnaireId);

                if (questionMaster != null)
                {
                    QuestionaryMasterEntity questionEntity = new QuestionaryMasterEntity();
                    return (QuestionaryMasterEntity)Utility.ConvertToObject(questionMaster, questionEntity);
                }
                return null;
            }
        }

        public int Post(QuestionaryMasterEntity questionMasterEntity)
        {
            using (var questMasterRepository = new QuestionariesMasterRepository())
            {
                QuestionairesMaster questMaster = new QuestionairesMaster();
                questMaster = (QuestionairesMaster)Utility.ConvertToObject(questionMasterEntity, questMaster);
                questMaster.CreatedOn = DateTime.Now;
                return questMasterRepository.Insert(questMaster);
            }
        }
        public bool Put(QuestionaryMasterEntity questionMasterEntity)
        {
            using (var questMasterRepository = new QuestionariesMasterRepository())
            {
                QuestionairesMaster questMaster = questMasterRepository.Get(questionMasterEntity.QuestionnaireId);
                if (questMaster != null)
                {
                    questMaster.AreaID = questionMasterEntity.AreaID;
                    questMaster.Question = questionMasterEntity.Question;
                    questMaster.QuestionTypeId = questionMasterEntity.QuestionTypeId;
                    questMaster.QuestionDesc1 = questionMasterEntity.QuestionDesc1;
                    questMaster.IsActive = questionMasterEntity.IsActive;
                    questMaster.ModifiedBy = questionMasterEntity.ModifiedBy;
                    questMaster.Rate1 = questionMasterEntity.Rate1;
                    questMaster.Rate2 = questionMasterEntity.Rate2;
                    questMaster.Rate3 = questionMasterEntity.Rate3;
                    questMaster.Rate4 = questionMasterEntity.Rate4;
                    questMaster.Rate5 = questionMasterEntity.Rate5;
                    questMaster.ModifiedOn = DateTime.Now;
                    return questMasterRepository.Update(questMaster);
                }
                return false;
            }
        }
        public ValidationsEntity Validations(QuestionaryMasterEntity questionMasterEntity)
        {
            ValidationHelper helper = new ValidationHelper();
            using (var questionMaterRepository = new QuestionariesMasterRepository())
            {
                if (questionMasterEntity.Question == "" )
                {
                    return helper.CreateValidation("Empty Fields", questionMasterEntity.Question.ToString(), "All fields need to be filled.");
                }
                //if (questionMasterEntity.AreaID == 0)
                //{
                //    return helper.CreateValidation("Area", questionMasterEntity.AreaID.ToString(), "Please select an Area.");
                //}
             
            }
            return null;
        }

        #endregion  
    
    }
}