(function(){
"use strict";
'use strict';
var app = angular.module('viewCustom', ['angularLoad']);


/* and can we make all of the menu links stay in this tab?! */


  /* Same Tab Menu Links start  */
  angular
    .module('sameTabMenuLinks', [])
    .component('sameTabMenuLinks', {
      bindings: {parentCtrl: '<'},
      controller: function controller($document, $scope) {
        this.$onInit = function() {
          /*Must wait for menu items to appear*/
          console.log("Hi there I got called.");
          var elCheck = setInterval(updateLinks, 1000);
          function updateLinks() {
            /* Checks for menu links, sets all target attributes to '_self'*/
            if( $document[0].querySelectorAll("div.top-nav-bar-links > div").length>0 ){
              var menuItems=$document[0].querySelectorAll("div.top-nav-bar-links > div")
              for (var i = 0; i < menuItems.length; i++) {
                var mItem = menuItems[i];
                var anchor = mItem.querySelector("div > a");
                anchor.target="_self"
              }
              clearInterval(elCheck);
            }
          }
          var linkCheck = setInterval(updateHiddenLinks, 1000);
          function updateHiddenLinks() {
            /* Checks for menu links, sets all target attributes to '_self'*/
            if( $document[0].querySelectorAll("div.custom-links-container > div").length>0 ){
              var menuItems=$document[0].querySelectorAll("div.custom-links-container > div")
              for (var i = 0; i < menuItems.length; i++) {
                var mItem = menuItems[i];
                var anchor = mItem.querySelector("div > a");
                anchor.target="_self"
              }
              clearInterval(linkCheck);
            }
          }
        }
      }
    })
  /* End Same Tab Menu Links */



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

})();