using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.BusinessEntities;

namespace EmpPEP.Framework.Log4Net.Helper
{
    public class ValidationHelper
    {
        public ValidationsEntity CreateValidation(string FieldName, string FieldValue, string ErrorMessage)
        {
            ValidationsEntity validationsEntity = new ValidationsEntity();
            validationsEntity.FieldName = FieldName;
            validationsEntity.Fieldvalue = FieldValue;
            validationsEntity.ErrorMessage = ErrorMessage;
            return validationsEntity;
        }
    }
}
