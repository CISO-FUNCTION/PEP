var EMP_CONFIG = (function () {
     empData = {
        'EmployeeId': '',
        'AppraisalCycleId': '',
        'DomainId':'',
        'Role': '',
        'AppraisalCycleStart': '',
        'AppraisalCycleEnd': '',
        'CompanyId': ''
    };

    return {
        get: function (name) {
            if(name=='EmployeeId')
                return this.EmployeeId;
            if (name == 'DomainId')
                return this.DomainId;
            if (name == 'Role')
                return this.Role;
            if (name == 'AppraisalCycleId')
                return this.AppraisalCycleId;
            if (name == 'AppraisalCycleStart')
                return this.AppraisalCycleStart;
            if (name == 'AppraisalCycleEnd')
                return this.AppraisalCycleEnd;
            if (name == 'CompanyId')
                return this.CompanyId;
        },
        setEmpCode: function (empNo) {
            localStorage.EmployeeId = empNo;
        },
        setDomainId: function (domainId) {
            localStorage.DomainId = domainId;
        },
        setRole: function (role) {
            localStorage.Role = role;
        },
        setAppraisalCycleId: function (appraisalCycleId) {
            localStorage.AppraisalCycleId = appraisalCycleId;
        },
        setAppraisalCycleStart: function (appraisalCycleStart) {
            localStorage.AppraisalCycleStart = appraisalCycleStart;
        },
        setAppraisalCycleEnd: function (appraisalCycleEnd) {
            localStorage.AppraisalCycleEnd = appraisalCycleEnd;
        },
        setCompanyId: function (companyId) {
            localStorage.CompanyId = companyId;
        }
    }
     
})();