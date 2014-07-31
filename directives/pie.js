(function(){
angular.module('ngvis')
.directive('pie', ['visualisationService', '$timeout', '$window', 'utilityService', function (visualisationService, $timeout, $window, util) {
    return {
        restrict: 'E',
        scope: {
            height: '=?',
            width: '=?',
            data: '=?',
            colors: '=?',
            padding: '=?',
            resize: '=?'
        },
        templateUrl: util.dynamicTemplateUrl('charts/pie.html'),
        link: { post: function($scope, $elem, $attr){
            $timeout(function(){
                if(!$scope.width){
                    var parentEl = $elem[0].parentElement;
                    $scope.width = util.innerWidth(parentEl);
                    if(!$attr.resize){
                        angular.element($window).on('resize', function(){
                            var newWidth = util.innerWidth(parentEl);
                            if(newWidth !== $scope.width){
                                $scope.width = newWidth;
                                $scope.$apply();
                            }
                        });
                    }
                }
            }, 1);}
        },
        controller: function($scope){
            $scope.$watch('[height,width,data,colors, padding, resize]', function(args){
                var height = args[0] || args[1],
                    width = args[1] || args[0],
                    data = args[2],
                    colors = args[3],
                    padding = args[4] || 0;

                if(_.some([height, width, data, colors, padding], _.isUndefined)){
                    return ;
                }

                $scope.width = width;
                $scope.height = height;
                $scope.colors = colors;
                $scope.padding = padding;

                var total = _(data).pluck('value').reduce(function(sum, num) {
                    return sum + num;
                });

                var percentageScale = visualisationService.createScale(0, total, 0, 100);
                var radius = $scope.radius = _.min([width,height])/2 - padding;
                var center = $scope.center = [width/2, height/2];
                var vectorData = visualisationService.createPieChartVectors(_.pluck(data, 'value'));
                var colorScale = visualisationService.createOrdinalScale(colors);

                $scope.pieChartData = _.map(data, function(d, i){
                    console.log(percentageScale(d.value), d.value);
                    return{
                        color: colorScale(),
                        largeArc: vectorData[i].largeArc,
                        x1: center[0] + radius * vectorData[i].x1,
                        y1: center[1] + radius * vectorData[i].y1,
                        x2: center[0] + radius * vectorData[i].x2,
                        y2: center[1] + radius * vectorData[i].y2
                    };
                });

                //Reset scale
                colorScale = visualisationService.createOrdinalScale(colors);
                $scope.legend = _.map(data, function(d, i){
                    return {
                        label: d.label,
                        color: colorScale(),
                        percentage: percentageScale(d.value)
                    };
                });

            },true);
        }
    };
}]);
})();
