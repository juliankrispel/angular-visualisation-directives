(function(){
angular.module('ngvis')
.directive('legend', ['visualisationService', function (visualisationService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            colors: '=',
            data: '='
        },
        templateUrl: util.dynamicTemplateUrl('charts/legend.html'),
        controller: function($scope){
            $scope.$watch('[colors,data]', function(args){
                var colors = args[0],
                    data = args[1];
                if(_.some([colors, names], _.isUndefined)){
                    return ;
                }

                var colorScale = visualisationService.createOrdinalScale($scope.colors);
                $scope.legendData = _.map(names, function(name){
                    return {color: colorScale(), name: name};
                });
            }, true);
        }
    };
}]);
})();
