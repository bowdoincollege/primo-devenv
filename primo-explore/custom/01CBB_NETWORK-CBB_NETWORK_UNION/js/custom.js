(function(){

var app = angular.module('viewCustom', ['angularLoad', 'externalSearch']);
var LOCAL_VID = "01CBB_NETWORK-CBB_NETWORK_UNION";
"use strict";
'use strict';

/* adding a cool new card to the browse page */

var viewCode = function (str) { // allow all views to refer to templates in their own view
    // EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
    if (str.indexOf('%3A') > -1) {
        str = str.replace(/%3A/g, ':');
    }  
    // 01CBB_NETWORK
    // 01CBB_BCOLL, 01CBB_CCLIBRAR, 01CBB_BOWC
    var environment = 'NETWORK'; // - 01CBB_NETWORK was LRCCD
    if (str.indexOf('01CBB_BOWC') > -1) { // this allows us to use the sandbox, was '01CACCL_CC'
        environment = 'BOWC'; // was CC
    } 
    if (str.indexOf('01CBB_CCLIBRAR') > -1) { 
        environment = 'CCLIBRAR'; 
    } 
    if (str.indexOf('01CBB_BCOLL') > -1) { 
        environment = 'BCOLL'; 
    } 
    var arr=str.split('01CBB_'+ environment + ':'); // was 01CACCL_
    var arr2=arr[1].split('&');
    return {
        env: environment,
        view: arr2[0]
    };
}(location.href);

var custPackagePath = '/discovery/custom/01CBB_' + viewCode.env + '-' + viewCode.view;

app.component('prmBrowseSearchAfter', { // insert template into browse screens. would be nice to hide it when results appear
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmBrowseSearchAfterController',
    templateUrl: custPackagePath + '/html/browse.html'
    //templateUrl: 'https://cbb.primo.exlibrisgroup.com/discovery/custom/01CBB_NETWORK-01CBB_NETWORK_UNION/html/browse.html'
});

app.controller('prmBrowseSearchAfterController', function() { 
    var vm = this;
    vm.$onInit = function() {
        vm.showCards = function() { // avoid typeError by waiting for property to become available
            if (vm.parentCtrl.browseSearchBarService._selectedScope.SourceCode1) {
                return true;
            }
        };
        vm.showExplanation = function(box) { // show explanation card appropriate to browse index used
            var searchScope = vm.parentCtrl.browseSearchBarService._selectedScope.SourceCode1; // this property stores the browse index label
            if (searchScope.indexOf(box) > -1) {
                return true;
            }
        };
        vm.hideOnResults = function() { // hide cards when there are search results or when search is in progress
            var results = vm.parentCtrl.browseSearchService._browseResult; // array of search results
            var inProgress = vm.parentCtrl.browseSearchService._inProgress;
            if ((results.length > 0 || inProgress === true)) {
                return true;
            }
        };
    };
});

/**   Begin externalSearch   **/
/* from https://knowledge.exlibrisgroup.com/Primo/Community_Knowledge/How_to_-_Add_links_to_additional_search_platforms_in_Primo_Brief_Results */

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
}]);
/* end externalSearch */

})();