(function(){
    "use strict";
    'use strict';
    
    var app = angular.module('viewCustom', ['angularLoad']);
    
    "use strict";
    'use strict';
    
    "use strict";
    'use strict';
    
    "use strict";
    'use strict';
    
    //Auto generated code by primo app store DO NOT DELETE!!! -START-
    /*
        hookName is a place holder with should hold the hook name not including "prm" at the beginning and in upper camel case
        e.g: for hook prmSearchBarAfter (in html prm-search-bar-after) it should be given "SearchBarAfter"
     */
    app.controller('SearchResultAvailabilityLineAfterController', [function () {
      var vm = this;
    }]);
    
    app.component('prmSearchResultAvailabilityLineAfter', {
      bindings: { parentCtrl: '<' },
      controller: 'SearchResultAvailabilityLineAfterController',
      template: '\n    <hathi-trust-availability-studio parent-ctrl="$ctrl.parentCtrl"></hathi-trust-availability-studio>\n'
    
    });
    
    //Auto generated code by primo app store DO NOT DELETE!!! -END-
    
    //Auto generated code by primo app store DO NOT DELETE!!! -START-
    angular.module('hathiTrustAvailability', []).value('hathiTrustIconPath', 'custom/CENTRAL_PACKAGE/img/hathitrust.svg').constant('hathiTrustBaseUrl', "https://catalog.hathitrust.org/api/volumes/brief/json/").config(['$sceDelegateProvider', 'hathiTrustBaseUrl', function ($sceDelegateProvider, hathiTrustBaseUrl) {
      var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
      urlWhitelist.push(hathiTrustBaseUrl + '**');
      $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
    }]).factory('hathiTrust', ['$http', '$q', function ($http, $q) {
      var svc = {};
      var hathiTrustBaseUrl = "https://catalog.hathitrust.org/api/volumes/brief/json/";
    
      svc.findFullViewRecord = function (ids) {
        var deferred = $q.defer();
    
        var handleResponse = function handleResponse(resp) {
          var data = resp.data;
          var fullTextUrl = null;
          for (var i = 0; !fullTextUrl && i < ids.length; i++) {
            var result = data[ids[i]];
            for (var j = 0; j < result.items.length; j++) {
              var item = result.items[j];
              if (item.usRightsString.toLowerCase() === "full view") {
                fullTextUrl = result.records[item.fromRecord].recordURL;
                break;
              }
            }
          }
          deferred.resolve(fullTextUrl);
        };
    
        if (ids.length) {
          var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
          $http.jsonp(hathiTrustLookupUrl, { cache: true, jsonpCallbackParam: 'callback' }).then(handleResponse).catch(function (e) {
            console.log(e);
          });
        } else {
          deferred.resolve(null);
        }
    
        return deferred.promise;
      };
    
      return svc;
    }]).controller('hathiTrustAvailabilityStudioController', ['hathiTrust', 'hathiTrustIconPath', function (hathiTrust, hathiTrustIconPath) {
      var self = this;
      self.hathiTrustIconPath = hathiTrustIconPath;
    
      self.$onInit = function () {
        setDefaults();
        if (!(isOnline() && self.hideOnline)) {
          updateHathiTrustAvailability();
        }
      };
    
      var setDefaults = function setDefaults() {
        if (!self.msg) self.msg = 'Full Text Available at HathiTrust';
      };
    
      var isOnline = function isOnline() {
        return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(function (g) {
          return g.links.some(function (l) {
            return l.isLinktoOnline;
          });
        });
      };
    
      var updateHathiTrustAvailability = function updateHathiTrustAvailability() {
        var hathiTrustIds = (self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []).map(function (id) {
          return "oclc:" + id;
        });
        hathiTrust.findFullViewRecord(hathiTrustIds).then(function (res) {
          self.fullTextLink = res;
        });
      };
    }]).component('hathiTrustAvailabilityStudio', {
      require: {
        prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine'
      },
      bindings: {
        hideOnline: '<',
        msg: '@?'
      },
      controller: 'hathiTrustAvailabilityStudioController',
      template: '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
                    <md-icon md-svg-src="{{$ctrl.hathiTrustIconPath}}" alt="HathiTrust Logo"></md-icon>\
                    <a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
                    {{ ::$ctrl.msg }}\
                      <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
                    </a>\
                  </span>'
    });
    
    app.requires.push('hathiTrustAvailability');
    
    //Auto generated code by primo app store DO NOT DELETE!!! -END-
    })();