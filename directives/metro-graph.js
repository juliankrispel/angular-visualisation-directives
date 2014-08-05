(function(){
"user strict";
angular.module('ngvis')
.directive('metroGraph', [
    'visualisationService', '$window', '$timeout', 'utilityService', '$filter', function(visualisationService, $window, $timeout, util, $filter) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                height: '=?',
                colors: '=?',
                width: '=?',
                padding: '=?'
            },
            templateUrl: util.dynamicTemplateUrl('charts/metro-graph.html'),
            link: { post: function($scope, $elem){
                var mouseOver = false;
                var xScale;
                var $date = $filter('date');
                var width;
                var lastDate;
                var childScope;

                // I'm indexing the graphData by date so that I can 
                // access it conveniently from the cursorOverGraph callback
                var graphDataByDate = {};

                $timeout(function(){
                    childScope = angular.element($elem.find('graph')).isolateScope();
                    childScope.$watch('[data,width]', function(args){
                        if(_.some(args, _.isUndefined)){
                            return ;
                        }
                        var data = args[0];
                        var width = args[1];
                        var xArray = _(data).pluck('data').flatten().pluck('x').value();
                        var xMin = _(xArray).min().value();
                        var xMax = _(xArray).max().value();

                        width = childScope.graphWidth;
                        xScale = visualisationService.createScale(0, childScope.graphWidth, xMin, xMax);
                        _(data).each(function(data){
                            var label = data.label;
                            return _(data.data).each(function(dataPoint){
                                var key = $date(dataPoint.x, 'shortDate');
                                if(graphDataByDate[key] === undefined){
                                    graphDataByDate[key] = { 
                                        date: $date(dataPoint.x, 'longDate'),
                                        graphs: []
                                    };
                                }

                                graphDataByDate[key].graphs.push({
                                    label: label,
                                    val: dataPoint.y,
                                    color: _(childScope.graphs).findWhere({label: label}).color
                                });

                            });
                        });
                    }, true);
                }, 1);

                $scope.cursorOverGraph = function(e){
                    var bbox = e.target.getBoundingClientRect();
                    var cursorPositionX = e.clientX - bbox.left;
                    var key = $date(new Date(xScale(cursorPositionX + 2)), 'shortDate');
                    if(lastDate === key){
                        return;
                    }else{
                        lastDate = key;
                    }

                    $scope.cursorPosition = cursorPositionX;
                    $scope.graphDetailPosition = cursorPositionX + childScope.padding[3];
                    $scope.graphDetail = graphDataByDate[key];
                };
            }}
        };
    }
]);
})();
