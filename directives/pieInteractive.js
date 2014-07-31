(function(){
angular.module('ngvis')
.directive('metroPie', ['visualisationService', 'utilityService', function (visualisationService, util) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            colors: '=',
            data: '='
        },

        templateUrl: util.dynamicTemplateUrl('charts/metro-pie.html'),

        controller: function($scope){
            console.log('dwq');
        }
    };
}]);
})();
