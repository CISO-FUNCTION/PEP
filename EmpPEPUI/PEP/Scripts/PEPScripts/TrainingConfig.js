var TRAININGTYPEDATA = (function () {
    var private = {
        'TRAININGTYPE': [
            { "ID": "1", "Name": "Technical" },
            { "ID": "2", "Name": "Behavioural" }
        ]
    };
    return {
        get: function (name) {
            return private[name];
        }
    };
})();