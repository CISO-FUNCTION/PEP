var CONFIG = (function () {
    var private = {
        'SERVERNAME': 'http://localhost:54659/api/',
        'APPLICATIONURL': 'http://localhost:53469/',
        'PATH': '/api'
    };
    return {
        get: function (name) {
            return private[name];
        }
    };
})();


var CONFIG1 = (function () {
    var private = {
        'APPURL': 'http://localhost:54669/api/',
        'PATH': 'dashboard'
    };
    return {
        get: function (name) {
            return private[name];
        }
    };
})();
