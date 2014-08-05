(function(){
var sum = function(sum, num){ return num + sum; };
angular.module('ngvis')
.factory('mockService', function(){
    return {
        mockPieChartData: function(){
            return [
                {label: 'Bonds', value: 17},
                {label: 'Equities', value: 23},
                {label: 'Alternatives', value: 20},
                {label: 'Cash', value: 4},
            ];
        },

        mockDeepPieChartData: function(){
            return [
                {
                    label: 'Bonds', 
                    value: 17,
                    subGroups: [
                        {label: 'UK', value: 17},
                        {label: 'U.S.A', value: 23},
                        {label: 'North America ', value: 20},
                        {label: 'Asia', value: 4},
                    ]
                },
                {
                    label: 'Equities', 
                    value: 23,
                    subGroups: [
                        {label: 'UK', value: 17},
                        {label: 'U.S.A', value: 23},
                        {label: 'North America ', value: 20},
                        {label: 'Asia', value: 4},
                    ]
                },
                {
                    label: 'Alternatives', 
                    value: 20,
                    subGroups: [
                        {label: 'UK', value: 17},
                        {label: 'U.S.A', value: 23},
                        {label: 'North America ', value: 20},
                        {label: 'Asia', value: 4},
                    ]
                },
                {
                    label: 'Cash', 
                    value: 4,
                    subGroups: []
                },
            ];
        },

        mockDateRange: function(days){
            return _.times(days, function(i){
                return new Date((new Date()).setDate(-(days - i)));
            });
        },

        mockGraphs: function(graphCount, dayCount){
            var self = this;
            return _.times(graphCount, function(i){
                return {
                    label: 'Graph #' + i,
                    data: self.mockGraph(dayCount)
                };
            });
        },

        mockGraph: function(count){
            var yValues = this.mockPerformanceValues(count);
            var xValues = this.mockDateRange(count);
            return _(xValues).zip(yValues).map(function(a){
                return {
                    x: a[0],
                    y: a[1]
                };
            }).value();
        },

        mockPerformanceValues: function(numberOfValues){
            var currentValue = 100;
            var values = [100];
            _.times(numberOfValues - 1, function(){
                currentValue+= _.random(-0.3, 0.3);
                values.push(currentValue);
            });

            return values;
        },

        generateAssetAllocationFromValuation: function(assets){
            var total = _(assets).pluck('value').reduce(function(sum, num){
                return sum + num;
            });

            return _(assets).groupBy('assetClass').map(function(arr, label){
                return {
                    label: label,
                    value: _(arr).pluck('value').reduce(sum) / total * 100,
                    subGroups: _(arr).groupBy('geographicClass').map(function(arr, label){
                        return {
                            label: label,
                            value: _(arr).pluck('value').reduce(sum) / total * 100
                        };
                    }).value()
                };
            }).value();

        },

        mockValuation: function(numberOfAssets){
            var assetClasses = ['Equities', 'Cash', 'Alternatives', 'Bonds'];
            var geographicClasses = ['U.S.A', 'North America', 'UK', 'ASIA'];
            var assets =_.times(numberOfAssets, function(){
                return {
                    name: chance.sentence({words: 3}),
                    value: chance.integer({min: 1000, max: 10000}),
                    price: chance.integer({min: 10, max: 400}),
                    profitLoss: chance.integer({min: 100, max: 1000}),
                    assetClass: assetClasses[_.random(0, assetClasses.length-1)],
                    geographicClass: geographicClasses[_.random(0, geographicClasses.length-1)],
                    yield: _.random(0, 1.99999)
                };
            });

            var total = _(assets).pluck('value').reduce(function(sum, num){
                return sum + num;
            });

            return _.map(assets, function(a){
                a.weight = a.value/total * 100;
                return a;
            });
        }
    };
});
})();
