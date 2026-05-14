using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EmpPEP.UI.Models
{
    public class DownloadReport
    {
        public bool Success{get;set;}
        public Result Result{get;set;}

        //"Success":true,
        //"Result":{"Result":"","mimeType":"application/vnd.ms-excel","fileName":"RatingCalculation_08Feb2018.xls"}

    }
    public class Result{
        public byte[] fileObject {get; set;}
        public string mimeType { get; set; }
        public string fileName { get; set; }
        }
}