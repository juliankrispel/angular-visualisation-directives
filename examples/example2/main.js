(function(){
    angular.module('ngvis', [])
    .controller('ctrl', ['$scope', 'visualisationService', '$http', function($scope, visualisationService, $http){
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

        $http.get('valuation.json').then(function(data){
            data.data.Valuation.Holdings = _(data.data.Valuation.Holdings).map(function(h){
                _(h.Asset.Properties).each(function(p){
                    h[p.Name] = p.Value;
                });
                return h;
            }).value();
            $scope.valuation = data.data.Valuation;
            console.log(data);
        });

        $scope.colors = ['#3fae2a', '#8679ac', '#4aa6d3', '#e3d454', '#ce7e9d' ];

        $scope.$watch('selected', function(index){
            if(index === undefined){
                $scope.highlight = {};
            }else{
                $scope.highlight = { backgroundColor: $scope.colors[index], color: '#fff' };
            }
        });

        $scope.pieChartData = visualisationService.mockDeepPieChartData();
        window.s = $scope;
    }]);
})();
