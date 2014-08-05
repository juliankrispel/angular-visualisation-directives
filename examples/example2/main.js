(function(){
    angular.module('ngvis', [])
    .controller('ctrl', ['$scope', 'visualisationService', 'mockService', '$http', '$q', function($scope, visualisationService, mockService, $http, $q){
        $scope.chartWidth = 600;
        $scope.chartHeight = 200;

        $scope.pieChartHeight = 300;
        $scope.pieChartWidth = 300;

        $scope.valuation = mockService.mockValuation(23);
        $scope.pieChartData = mockService.generateAssetAllocationFromValuation($scope.valuation);
        console.log($scope.pieChartData);

        $scope.colors = ['#3fae2a', '#8679ac', '#4aa6d3', '#e3d454', '#ce7e9d' ];

        $scope.$watch('selected', function(index){
            if(index === undefined){
                $scope.highlight = {};
            }else{
                $scope.highlight = { backgroundColor: $scope.colors[index], color: '#fff' };
            }
        });


        $scope.graphData = mockService.mockGraphs(3, 100);
        window.s = $scope;
    }]);
})();
