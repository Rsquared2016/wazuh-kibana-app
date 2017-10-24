// Require routes
var routes = require('ui/routes');

//Installation wizard
var settingsWizard = function ($location, $q, Notifier, testAPI, appState) {
	const notify = new Notifier();

    var deferred = $q.defer();
    testAPI.check_stored().then(
        function (data) {
            if (data.data.error) {
                if(data.data.error == 2)
                    notify.warning("Wazuh App: Please set up Wazuh API credentials.");
                else
                    notify.error("Could not connect with Wazuh RESTful API.");

                deferred.reject();
                $location.path('/settings');
            } else {
                appState.setClusterInfo(data.data.data.cluster_info);
                appState.setExtensions(data.data.data.extensions);
                deferred.resolve();  
            }
        }, function (data) {
            notify.error("Could not connect with Wazuh RESTful API.");
        });
    return deferred.promise;
}

// Manage leaving the app to another Kibana tab
var goToKibana = function ($location, $window) {
    var url = $location.$$absUrl.substring(0, $location.$$absUrl.indexOf('#'));
    
    if(sessionStorage.getItem('lastSubUrl:' + url).includes('/wazuh#/visualize') || sessionStorage.getItem('lastSubUrl:' + url).includes('/wazuh#/doc') || sessionStorage.getItem('lastSubUrl:' + url).includes('/wazuh#/context'))
        sessionStorage.setItem('lastSubUrl:' + url, url);

    $window.location.href = $location.absUrl().replace('/wazuh#', '/kibana#');
}

//Routes
routes.enable();
routes
    .when('/agents/:id?/:tab?/:view?', {
        template: require('plugins/wazuh/templates/agents.jade'),
        resolve: {
            "checkAPI": settingsWizard
        }
    })
    .when('/manager/:tab?/', {
        template: require('plugins/wazuh/templates/manager.jade'),
        resolve: {
            "checkAPI": settingsWizard
        }
    })
	.when('/overview/', {
        template: require('plugins/wazuh/templates/overview.jade'),
        resolve: {
            "checkAPI": settingsWizard
        }
    })
    .when('/dashboard/:select?', {
        template: require('plugins/wazuh/templates/dashboards.jade'),
        resolve: {
            "checkAPI": settingsWizard
        }
    })
	.when('/discover/', {
        template: require('plugins/wazuh/templates/discover.jade'),
        resolve: {
            "checkAPI": settingsWizard
        }
    })
    .when('/settings/:tab?/', {
        template: require('plugins/wazuh/templates/settings.html')
    })
    .when('/visualize/create?', {
        redirectTo: function() {
        },
        resolve: {
            "checkAPI": goToKibana
        }
    })
    .when('/context/:pattern?/:type?/:id?', {
        redirectTo: function() {
        },
        resolve: {
            "checkAPI": goToKibana
        }
    })
    .when('/doc/:pattern?/:index?/:type?/:id?', {
        redirectTo: function() {
        },
        resolve: {
            "checkAPI": goToKibana
        }
    })
    .when('/', {
        redirectTo: '/overview/',
    })
    .when('', {
        redirectTo: '/overview/',
    })
    .otherwise({
        redirectTo: '/overview/'
    });