(function(){
var sum = function(sum, num) {
    return sum + num;
};
angular.module('ngvis')
.directive('metroPie', ['visualisationService', 'utilityService', function (visualisationService, util) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            colors: '=',
            data: '=',
            selected: '=?'
        },

        templateUrl: util.dynamicTemplateUrl('charts/metro-pie.html'),
        controller: function($scope){
            $scope.$watch('selected', function(selected){
                if(_.isUndefined(selected) || _.isUndefined($scope.data[selected])){
                    $scope.pieDetail = undefined;
                    return ;
                }
                if(_.isUndefined($scope.colors)){
                    throw new Error('$scope.colors must not be undefined');
                }

                var colorScale = visualisationService.createOrdinalScale($scope.colors);

                var detail = $scope.data[$scope.selected];
                var total = _($scope.data).pluck('value').reduce(sum);
                var percentageScale = visualisationService.createScale(0, total, 0, 100);
                if(detail.subGroups === undefined || detail.subGroups < 1){
                    $scope.pieDetail = {
                        color: colorScale($scope.selected),
                        percentage: percentageScale(detail.value).toFixed(2),
                        label: detail.label,
                    };
                    return $scope.pieDetail;
                }

                var subGroupTotal = _(detail.subGroups).pluck('value').reduce(sum);
                var subGroupPercentageScale = visualisationService.createScale(0, subGroupTotal, 0, 100);

                var subGroupMax = _(detail.subGroups).pluck('value').max().value();
                var subGroupMin = _(detail.subGroups).pluck('value').min().value();
                var fontSizeScale = visualisationService.createScale(subGroupMin, subGroupMax, 18, 36, 'fontsize');

                var subGroups = _(detail.subGroups).sortBy('value').reverse().map(function(sg){
                    sg.percentage = subGroupPercentageScale(sg.value);
                    sg.fontSize = fontSizeScale(sg.value).toFixed(1);
                    return sg;
                }).value();

                $scope.pieDetail = {
                    color: colorScale($scope.selected),
                    percentage: percentageScale(detail.value).toFixed(2),
                    label: detail.label,
                    subGroups: subGroups
                };
            }, true);

            $scope.selectPie = function(index){
                if($scope.selected === index){
                    $scope.selected = undefined;
                }else{
                    $scope.selected = index;
                }

            };
            $scope.$watch('[data, colors]', function(args){
                if(_.some(args, _.isUndefined)){
                    return;
                }
            }, true);
        }
    };
}]);
})();
