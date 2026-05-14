var GlobalAppConfig = (function () {
    var _configs = null;
    var _isLoaded = false;

    // Private function to load all configs
    function loadAllConfigs(callback) {
        if (_isLoaded && _configs !== null) {
            if (callback) callback();
            return;
        }

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'GlobalAppConfig/GetAllConfigs';

        $.ajax({
            url: apiPath,
            type: 'GET',
           // headers: CommonGetHeaderInfo(),
            async: false, // Load synchronously to ensure configs are available
            success: function (response) {
                if (response.Success) {
                    _configs = response.Result;
                    _isLoaded = true;
                    console.log('GlobalAppConfig loaded successfully');
                    if (callback) callback();
                } else {
                    console.error('Error loading GlobalAppConfig:', response.Message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching GlobalAppConfig:', error);
            }
        });
    }

    // Public interface
    return {
        // Initialize - call this once when the app starts
        init: function (callback) {
            loadAllConfigs(callback);
        },

        // Get config value
        get: function (configKey) {
            if (!_isLoaded) {
                loadAllConfigs();
            }
            return _configs && _configs[configKey] ? _configs[configKey] : '';
        },

        // Get all configs
        getAll: function () {
            if (!_isLoaded) {
                loadAllConfigs();
            }
            return _configs;
        },

        // Reload configs from server
        reload: function (callback) {
            _isLoaded = false;
            _configs = null;
            loadAllConfigs(callback);
        },

        // Check if configs are loaded
        isLoaded: function () {
            return _isLoaded;
        },

        // Helper methods for common configs
        getOrgName: function () {
            return this.get('ORG_NAME');
        },
        getShortOrgName: function () {
            return this.get('ORG_SHORT_NAME');
        },
        getOrgFullName: function () {
            return this.get('ORG_FULL_NAME');
        },

        getOrgLogo: function () {
            return this.get('ORG_Logo_White_URL');
        },

        getOrgLogoBlack: function () {
            return this.get('ORG_Logo_black');
        },

        getFacebookIcon: function () {
            return this.get('ORG_FACEBOOK_ICON_URL');
        },

        getFacebookUrl: function () {
            return this.get('ORG_FACEBOOK_URL');
        },

        getLinkedinIcon: function () {
            return this.get('ORG_LINKEDIN_ICON_URL');
        },

        getLinkedinUrl: function () {
            return this.get('ORG_LINKEDIN_URL');
        },

        getTwitterIcon: function () {
            return this.get('ORG_TWITTER_ICON_URL');
        },

        getTwitterUrl: function () {
            return this.get('ORG_TWITTER_URL');
        },

        getYoutubeIcon: function () {
            return this.get('ORG_YOUTUBE_ICON_URL');
        },

        getYoutubeUrl: function () {
            return this.get('ORG_YOUTUBE_URL');
        },

        getcopyRight: function () {
            return this.get('COPYRIGHT_TEXT');
        },
        getOrgLogo_Login: function () {
            return this.get('ORG_Logo_URL');
        },
        getFaviconUrl: function () {
            return this.get('Org_FaviconUrl');
        }

        
    };
})();