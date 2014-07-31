(function(){
"user strict";
angular.module('ngvis')
.directive('graph', [
    'visualisationService', '$window', '$timeout', 'utilityService', function(visualisationService, $window, $timeout, util) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                height: '=?',
                width: '=?',
                padding: '=?',
                xTicks: '=?',
                xGap: '=?',
                yTicks: '=?',
                yGap: '=?',
                colors: '=?'
            },
            templateUrl: util.dynamicTemplateUrl('charts/graph.html'),
            link: { post: function($scope, $elem){
                $timeout(function(){
                    if(!$scope.width){
                        var parentEl = $elem[0].parentElement;
                        $scope.width = util.innerWidth(parentEl);
                        angular.element($window).on('resize', function(){
                            var newWidth = util.innerWidth(parentEl);
                            if(newWidth !== $scope.width){
                                $scope.width = newWidth;
                                $scope.$apply();
                            }
                        });
                    }
                }, 1);}
            },
            controller: function($scope, $attrs) {

                $scope.$watch('[data,width,height,padding,xTicks,xGap,yTicks,yGap,colors]', function(args) {
                    var data = args[0],
                        width = args[1],
                        height = args[2],
                        padding = args[3] || [10, 0, 30, 40],
                        xTicks = args[4] || 6,
                        xGap = args[5] || 50,
                        yTicks = args[6] || 6,
                        yGap = args[7] || 20,
                        colors = args[8];

                    if (_.some([data, width, height, padding, xTicks, xGap, yTicks, yGap, colors], _.isUndefined)) {
                        return;
                    }
                    $scope.padding = padding;
                    $scope.graphHeight = height - (padding[0] + padding[2]);
                    $scope.graphWidth = width - (padding[1] + padding[3]);
                    var colorScale = visualisationService.createOrdinalScale(colors);

                    $scope.graphs = _.map(data, function(graph) {
                        return {
                            label: graph.label,
                            path: visualisationService.convertDataToSvgPath(graph.data, $scope.graphWidth, $scope.graphHeight),
                            color: colorScale()
                        };
                    });

                    $scope.labels = _.pluck($scope.graphs, 'label');
                    $scope.ticksY = visualisationService.createTickObjects(_(data).pluck('data').flatten().pluck('y').value(), $scope.graphHeight, yTicks, yGap);
                    $scope.ticksX = visualisationService.createTickObjects(_(data).pluck('data').flatten().pluck('x').value(), $scope.graphWidth, xTicks, xGap);
                }, true);

            }
        };
    }
]);
})();
