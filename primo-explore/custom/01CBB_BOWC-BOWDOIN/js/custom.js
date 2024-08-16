(function(){
    "use strict";
    'use strict';
    
    // 'hathiTrustAvailablity' is from Orbis Cascade
    var app = angular.module('viewCustom', ['angularLoad', 'hathiTrustAvailability'/*, 'externalSearch'*/]);
    var LOCAL_VID = "01CBB_BOWC-CORAL_TEST";
    var LOCAL_VID_URL = "01CBB_BOWC:CORAL_TEST"
    "use strict";
    'use strict';

    /* ******** Enhance No Results tile - BEGIN ************ */
    app.controller('prmNoSearchResultAfterController', [function() {
      var vm = this;
    
      this.$onInit = function(){
        {
          vm.getSearchTerm = getSearchTerm;
          vm.pciSetting = vm.parentCtrl.searchStateService.searchObject.pcAvailability || '';
          function getSearchTerm() {
            return vm.parentCtrl.term;
          }
        }
      };
    }]);
    
      // this writes the No Results card; changing it is annoying to do since it's writing all the HTML on one line
      // TODO: redo this so it's more like the CBB Browse Card
      app.component('prmNoSearchResultAfter',{
        bindings: {parentCtrl: '<'},
        controller: 'prmNoSearchResultAfterController',
        template: '<md-card class="default-card zero-margin _md md-primoExplore-theme"><md-card-title><md-card-title-text><span translate="" class="md-headline ng-scope">No records found</span></md-card-title-text></md-card-title><md-card-content><p><strong>There are no results matching your search:</strong> <blockquote><i>{{$ctrl.getSearchTerm()}}</i>.</blockquote></p><p><span translate="" class="bold-text ng-scope">Search suggestions:</span><ul><li translate="" class="ng-scope">Make sure that all words are spelled correctly.</li><li translate="" class="ng-scope">Try a different search scope. "Almost everything" is the broadest search.</li><li translate="" class="ng-scope">Try different search terms, including synonyms.</li><li translate="" class="ng-scope">Try more general search terms.</li><li translate="" class="ng-scope">Try fewer search terms.</li></ul></p><p> If you are looking for a specific item, you can <a href="https://library.bowdoin.edu/services/interlibrary-loan-and-document-delivery.shtml">request it through Interlibrary Loan and Document Delivery</a></p><p>If you are stuck, <a href="https://bowdoin.libanswers.com/">ask a librarian</a>.</p></md-card-content></md-card>'
      });
     /* ******** Enhance No Results tile - END ************ */
    


    /* ********* HATHI TRUST CODE FROM ORBIS CASCADE (and Bates) - START ******* */

  //* Begin Hathi Trust Availability *//
  //* Adapted from UMNLibraries primo-explore-hathitrust-availability *//
  //* https://github.com/UMNLibraries/primo-explore-hathitrust-availability *//

  /* search title: Culture and human behavior by Sanford Winston */
  
  angular
  .module('hathiTrustAvailability', [])
  .constant(
    'hathiTrustBaseUrl',
    'https://catalog.hathitrust.org/api/volumes/brief/json/'
  )
  .config([
    '$sceDelegateProvider',
    'hathiTrustBaseUrl',
    function ($sceDelegateProvider, hathiTrustBaseUrl) {
      var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
      urlWhitelist.push(hathiTrustBaseUrl + '**');
      $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
    },
  ])
  .factory('hathiTrust', [
    '$http',
    '$q',
    'hathiTrustBaseUrl',
    function ($http, $q, hathiTrustBaseUrl) {
      var svc = {};
      var lookup = function (ids) {
        if (ids.length) {
          var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
          return $http
                  .jsonp(hathiTrustLookupUrl, {
                      cache: true,
                      jsonpCallbackParam: 'callback',
                  })
                  .then(function (resp) {
                      return resp.data;
                  });
        } else {
          return $q.resolve(null);
        }
      };

      // find a HT record URL for a given list of identifiers (regardless of copyright status)
      svc.findRecord = function (ids) {
        return lookup(ids)
          .then(function (bibData) {
            for (var i = 0; i < ids.length; i++) {
              var recordId = Object.keys(bibData[ids[i]].records)[0];
              if (recordId) {
                return $q.resolve(bibData[ids[i]].records[recordId].recordURL);
              }
            }
            return $q.resolve(null);
          })
          .catch(function (e) {
            console.error(e);
          });
      };

      // find a public-domain HT record URL for a given list of identifiers
      svc.findFullViewRecord = function (ids) {
        var handleResponse = function (bibData) {
          var fullTextUrl = null;
          for (var i = 0; !fullTextUrl && i < ids.length; i++) {
            var result = bibData[ids[i]];
            for (var j = 0; j < result.items.length; j++) {
              var item = result.items[j];
              if (item.usRightsString.toLowerCase() === 'full view') {
                fullTextUrl = result.records[item.fromRecord].recordURL;
                break;
              }
            }
          }
          return $q.resolve(fullTextUrl);
        };
        return lookup(ids)
          .then(handleResponse)
          .catch(function (e) {
            console.error(e);
          });
      };

      return svc;
    },
  ])
  .component('hathiTrustAvailability', {
    require: {
      prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine',
    },
    bindings: {
      entityId: '@',
      ignoreCopyright: '<',
      hideIfJournal: '<',
      hideOnline: '<',
      msg: '@?',
      institutionId: '@'
    },
    controller: function (hathiTrust, hathiTrustAvailabilityOptions) {
      var self = this;
      self.$onInit = function () {

        // copy options from local package or central package defaults
        self.msg = hathiTrustAvailabilityOptions.msg;
        self.hideOnline = hathiTrustAvailabilityOptions.hideOnline;
        self.hideIfJournal = hathiTrustAvailabilityOptions.hideIfJournal;
        self.ignoreCopyright = hathiTrustAvailabilityOptions.ignoreCopyright;
        self.entityId = hathiTrustAvailabilityOptions.entityId;
        self.excludeNotLocal = hathiTrustAvailabilityOptions.excludeNotLocal;

        if (!self.msg) self.msg = 'Full Text Available at HathiTrust';

        // prevent appearance/request iff 'hide-online'
        if (self.hideOnline && isOnline()) {
          return;
        }

        // prevent appearance/request iff 'hide-if-journal'
        if (self.hideIfJournal && isJournal()) {
          return;
        }

        // prevent appearance iff no holding in this library
        if (self.excludeNotLocal && !isLocal()) {
          return;
        }

        // prevent appearance/request if item is unavailable
        if (self.ignoreCopyright && !isAvailable()) {
            //allow links for locally unavailable items that are in the public domain
            self.ignoreCopyright = false;
        }

        // look for full text at HathiTrust
        updateHathiTrustAvailability();
      };

      var isJournal = function () {
        if (angular.isDefined(self.prmSearchResultAvailabilityLine.result.pnx.addata.format)) {
          var format = self.prmSearchResultAvailabilityLine.result.pnx.addata.format[0];
          return !(format.toLowerCase().indexOf('journal') == -1); // format.includes("Journal")
        }
        else {
          return false;
        }
      };

      var isAvailable = function isAvailable() {
        var available = self.prmSearchResultAvailabilityLine.result.delivery.availability[0];
        return (available.toLowerCase().indexOf('unavailable') == -1);
      };

      var isLocal = function () {
        var availablelocally = false;
        /* If ebook is available set availablelocally to true */
        if (self.prmSearchResultAvailabilityLine.result.delivery.availability[0] == 'not_restricted') {
            availablelocally = true;
        }
        /* If ebook is available by link-in-record set availablelocally to true */
        else if (self.prmSearchResultAvailabilityLine.result.delivery.availability[0] == 'fulltext_linktorsrc') {
            availablelocally = true;
        }
        /* If print book is available set availablelocally to true */
        else if (self.prmSearchResultAvailabilityLine.result.delivery.availability[0] == 'available_in_library') {
            availablelocally = true;
        }
        /* If print book is owned but unavailable set availablelocally to true */
        else if (self.prmSearchResultAvailabilityLine.result.delivery.availability == 'unavailable') {
            availablelocally = true;
        }
        return availablelocally;
      }

      var isOnline = function () {
        var delivery =
          self.prmSearchResultAvailabilityLine.result.delivery || [];
        if (!delivery.GetIt1)
          return delivery.deliveryCategory.indexOf('Alma-E') !== -1;
        return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(
          function (g) {
            return g.links.some(function (l) {
              return l.isLinktoOnline;
            });
          }
        );
      };

      var formatLink = function (link) {
        return self.entityId ? link + '?signon=swle:' + self.entityId : link;
      };

      // Rewrote logic to filter on presence of (ocolc) prefix PO 20220825
      var isOclcNum = function (value) {
        const oclcre = /^(\(ocolc\))?\d+$/i;
        var res = false;
        var getmatch = value.match(oclcre);
        if (getmatch) {
          if (getmatch[1]) {
            res = true;
          }
        }
        return res;
      };

      var updateHathiTrustAvailability = function () {
        var hathiTrustIds = (
          self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []
        )
          .filter(isOclcNum)
          .map(function (id) {
            return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
          });
        hathiTrust[self.ignoreCopyright ? 'findRecord' : 'findFullViewRecord'](
          hathiTrustIds
        ).then(function (res) {
          if (res) self.fullTextLink = formatLink(res);
        });
      };
    },
    template:
      '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
        <md-icon alt="HathiTrust Logo">\
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">  <image id="image0" width="16" height="16" x="0" y="0"\
          xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJN\
          AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACNFBMVEXuegXvegTsewTveArw\
          eQjuegftegfweQXsegXweQbtegnsegvxeQbvegbuegbvegbveQbtegfuegbvegXveQbvegbsfAzt\
          plfnsmfpq1/wplPuegXvqFrrq1znr2Ptok/sewvueQfuegbtegbrgRfxyJPlsXDmlTznnk/rn03q\
          pVnomkjnlkDnsGnvwobsfhPveQXteQrutHDqpF3qnUnpjS/prmDweQXsewjvrWHsjy7pnkvqqGDv\
          t3PregvqhB3uuXjusmzpp13qlz3pfxTskC3uegjsjyvogBfpmkHpqF/us2rttXLrgRjrgBjttXDo\
          gx/vtGznjzPtfhHqjCfuewfrjCnwfxLpjC7wtnDogBvssmjpfhLtegjtnEjrtnTmjC/utGrsew7s\
          o0zpghnohB/roUrrfRHtsmnlkTbrvH3tnEXtegXvegTveQfqhyHvuXjrrGTpewrsrmXqfRHogRjt\
          q2Dqewvqql/wu3vqhyDueQnwegXuegfweQPtegntnUvnt3fvxI7tfhTrfA/vzJvmtXLunEbtegrw\
          egTregzskjbsxI/ouoPsqFzniyrz2K3vyZnokDLpewvtnkv30J/w17XsvYXjgBbohR7nplnso1L0\
          1Kf40Z/um0LvegXngBnsy5juyJXvsGftrGTnhB/opVHoew7qhB7rzJnnmErkkz3splbqlT3smT3t\
          tXPqqV7pjzHvunjrfQ7vewPsfA7uoU3uqlruoEzsfQ/vegf///9WgM4fAAAAFHRSTlOLi4uLi4uL\
          i4uLi4uLi4tRUVFRUYI6/KEAAAABYktHRLvUtndMAAAAB3RJTUUH4AkNDgYNB5/9vwAAAQpJREFU\
          GNNjYGBkYmZhZWNn5ODk4ubh5WMQERUTl5CUEpWWkZWTV1BUYlBWUVVT19BUUtbS1tHV0zdgMDQy\
          NjE1MzRXsrC0sraxtWOwd3B0cnZxlXZz9/D08vbxZfDzDwgMCg4JdQsLj4iMio5hiI2LT0hMSk5J\
          TUvPyMzKzmHIzcsvKCwqLiktK6+orKquYZCuratvaGxqbmlta+8QNRBl6JQ26Oru6e3rnzBx0uQ8\
          aVGGvJopU6dNn1E8c9bsOXPniYoySM+PXbBw0eIlS5fl1C+PFRFlEBUVXbFy1eo1a9fliQDZYIHY\
          9fEbNm7avEUUJiC6ddv2HTt3mSuBBfhBQEBQSEgYzOIHAHtfTe/vX0uvAAAAJXRFWHRkYXRlOmNy\
          ZWF0ZQAyMDE2LTA5LTEzVDE0OjA2OjEzLTA1OjAwNMgVqAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAx\
          Ni0wOS0xM1QxNDowNjoxMy0wNTowMEWVrRQAAAAASUVORK5CYII=" />\
          </svg> \
        </md-icon>\
        <a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
        {{ ::$ctrl.msg }}\
          <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
        </a>\
      </span>',
  })
  // Set default values for options
  .value('hathiTrustAvailabilityOptions', {
    msg: 'Full Text Available at HathiTrust',
    hideOnline: true,
    hideIfJournal: true,
    ignoreCopyright: false,
    entityId: '',
    excludeNotLocal: false
  });

app.component('prmSearchResultAvailabilityLineAfter', { template: '<hathi-trust-availability></hathi-trust-availability>' });

/* End HathiTrust Availability */

/**   Begin externalSearch   **/
/*
app.component('prmFacetExactAfter', {
  bindings: { parentCtrl: '<' },
  template: '<external-search></external-search>'
});

angular.module('externalSearch', []).value('searchTargets', []).directive('externalSearch', function () {
  return {
    require: '^^prmFacet',
    restrict: 'E',
    templateUrl: '/discovery/custom/' + LOCAL_VID + '/html/externalSearch.html',
    controller: ['$scope', '$location', 'searchTargets', function ($scope, $location, searchTargets) {
      $scope.name = $scope.$ctrl.parentCtrl.facetGroup.name;
      $scope.targets = searchTargets;
      var query = $location.search().query;
      var filter = $location.search().pfilter;
      $scope.queries = Array.isArray(query) ? query : query ? [query] : false;
      $scope.filters = Array.isArray(filter) ? filter : filter ? [filter] : false;
    }],
    link: function link(scope, element, attrs, prmFacetCtrl) {
      var facetTitle = 'Other Search';
      var found = false;
      for (var facet in prmFacetCtrl.facets) {
        if (prmFacetCtrl.facets[facet].name === facetTitle) {
          found = true;
        }
      }
      if (!found) {
        prmFacetCtrl.facets.unshift({
          name: facetTitle,
          displayedType: 'exact',
          limitCount: 0,
          facetGroupCollapsed: false,
          values: []
        });
      }
    }
  };
});

app.value('searchTargets', [{
  "name": "MaineCat",
  "url": "https://mainecat.maine.edu/search/?searchtype=X&SORT=D&searcharg=",
  "img": "/discovery/custom/" + LOCAL_VID + "/img/maine_state_library.png",
  "img_2": "/discovery/custom/" + LOCAL_VID + "/img/logo_placeholder.png",
  "alt": "Search the Maine State Library's catalog",
  mapping: function mapping(queries, filters) {
    try {
      return queries.map(function (part) {
      return part.replace(/,OR/, ' OR').replace(/,AND/, ' AND').split(",").slice(2) || "";
        }).join(' ').replace(/ AND$/, '');
      } catch (e) {
    return '';
    }
  }
} /*, {
    "name": "WorldCat",
    "url": "https://bowdoincollege.on.worldcat.org/search?queryString=",
    "img": "/discovery/custom/" + LOCAL_VID + "/img/wc-pinwheel.png",
    "img_2": "/discovery/custom/" + LOCAL_VID + "/img/logo_placeholder.png",
    "alt": "WorldCat",
    mapping: function mapping(queries, filters) {
      try {
        return queries.map(function (part) {
          return part.split(",")[2] || "";
        }).join(' ');
      } catch (e) {
        return '';
      }
    }
}
]); 
end externalSearch */

})();