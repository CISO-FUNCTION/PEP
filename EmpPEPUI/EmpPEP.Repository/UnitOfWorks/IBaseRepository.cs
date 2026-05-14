using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.UnitOfWorks
{
    public interface IBaseRepository<T>
    {
            List<T> Get();

            T Get(int id);

            int Insert(T obj);

            bool Update(T obj);

            bool Delete(T obj);
   }
    
 }
