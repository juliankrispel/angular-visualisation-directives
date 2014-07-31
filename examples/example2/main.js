(function(){
    angular.module('ngvis', [])
    .controller('ctrl', ['$scope', 'visualisationService', function($scope, visualisationService){
        $scope.chartWidth = 600;
        $scope.chartHeight = 200;

        $scope.pieChartHeight = 300;
        $scope.pieChartWidth = 300;

        $scope.performanceData = [
            {
                label: 'Graph 1',
                data: visualisationService.mockGraphData()
            },
            {
                label: 'Graph 2',
                data: visualisationService.mockGraphData()
            }
        ];

        $scope.pieChartData = visualisationService.mockPieChartData();
    }]);
})();
