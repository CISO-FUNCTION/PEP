using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.Entity;
using System.Data.SqlClient;
using EmpPEP.Framework.Helper;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class EmployeeTrainingRepository : BaseDispose, IBaseRepository<EmployeeTraining>
    {
        #region "Private variables"
        private readonly PEPEntities1 context = null;
        #endregion

        #region "Constructor"
        public EmployeeTrainingRepository()
        {
            context = new PEPEntities1();
        }
        #endregion

        public List<EmployeeTraining> Get()
        {
            throw new NotImplementedException();
        }

        public EmployeeTraining Get(int id)
        {
            throw new NotImplementedException();
        }

        public int Insert(EmployeeTraining obj)
        {
            throw new NotImplementedException();
        }

        public bool Update(EmployeeTraining obj)
        {
            throw new NotImplementedException();
        }

        public bool Delete(EmployeeTraining obj)
        {
            if (obj == null) return false;

            obj.TrainingId = 2;

            EmployeeTraining empTraining = context.Set<EmployeeTraining>().Find(obj.TrainingId);

            if (empTraining == null)
                return false;

            if (context.Entry(empTraining).State == EntityState.Detached)
                context.Set<EmployeeTraining>().Attach(empTraining);

            context.Set<EmployeeTraining>().Remove(empTraining);
            return context.SaveChanges() > 0 ? true : false;
        }

        public List<spGetTrainingsSuggetsted_Result> GetTrainingsSuggested(string query, params object[] parameters)
        {
            return context.Database.SqlQuery<spGetTrainingsSuggetsted_Result>(query, parameters).ToList<spGetTrainingsSuggetsted_Result>();
        }

        /// <summary>
        /// Saves training request from employee
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public bool SaveTrainingRequest(EmployeeTraining obj)
        {
            context.EmployeeTrainings.Add(obj);
            return context.SaveChanges() > 0 ? true : false;
        }

        /// <summary>
        /// This function will save the the trainings suggested by manager to employee(s)
        /// </summary>
        /// <returns></returns>
        public bool SaveTrainingSuggested(EmployeeTraining obj, string employeeIds)
        {
            var isChangesSaved = false;
            using (var context = new PEPEntities1())
            {
                using (var dbContextTransaction = context.Database.BeginTransaction())
                {
                    try
                    {
                        if (obj.ActionTypeId.HasValue && obj.ActionTypeId == (int)EnumCollection.ACTIONTYPE.Suggest)
                        {
                            string[] ids = employeeIds.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                            if (ids.Length < 1) return false;

                            for (int i = 0; i < ids.Length; i++)
                            {
                                obj.EmployeeId = int.Parse(ids[i]);
                                context.EmployeeTrainings.Add(obj);
                                context.SaveChanges();
                            }
                            
                            dbContextTransaction.Commit();
                            isChangesSaved = true;
                        }
                    }
                    catch (Exception)
                    {
                        dbContextTransaction.Rollback();
                        isChangesSaved = false;
                    }
                }
            }
            return isChangesSaved;
        }
    }
}
