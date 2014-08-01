(function(){
angular.module('ngvis')
.directive('legend', ['visualisationService', 'utilityService', function (visualisationService, util) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
            colors: '='
        },
        templateUrl: util.dynamicTemplateUrl('charts/legend.html'),
        controller: function($scope){
            console.log($scope);
            $scope.$watch('[data, colors]', function(args){
                var data = args[0],
                    colors = args[1];

                if(_.some([data, colors], _.isUndefined)){
                    return ;
                }

                var colorScale = visualisationService.createOrdinalScale(colors);

                var total = _(data).pluck('value').reduce(function(sum, num) {
                    return sum + num;
                });

                var percentageScale = visualisationService.createScale(0, total, 0, 100);

                $scope.legend = _.map(data, function(d, i){
                    console.log(d);
                    return {
                        label: d.label,
                        color: colorScale(),
                        percentage: percentageScale(d.value)
                    };
                });
            }, true);
        }
    };
}]);
})();
