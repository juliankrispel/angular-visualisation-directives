(function(){
angular.module('ngvis')
.factory('visualisationService', ['$filter', function($filter){
    return {
        degToRad: function(degrees){
            return Math.PI * degrees / 180;
        },

        radToDeg: function(rad){
            return rad / Math.PI * 180;
        },

        getArcVectors: function(startAngle, endAngle){
            return {
                x1: Math.cos(this.degToRad(startAngle)),
                y1: Math.sin(this.degToRad(startAngle)),
                x2: Math.cos(this.degToRad(endAngle)),
                y2: Math.sin(this.degToRad(endAngle))
            };
        },

        createPieChartVectors: function(data, totalDegrees, startAngle, isClockWise){
            var that = this;
            if(!_.every(data, _.isNumber) && !_.every(data, function(n){ return n > 0; })){
                throw new Error('createPieChartPathData only accepts an array of positive numbers as the data argument');
            }
            if(totalDegrees > 360){
                throw new Error('totalDegrees argument can\'t be more than 360');
            }
            if(startAngle === undefined){
                startAngle = 0;
            }
            if(totalDegrees === undefined){
                totalDegrees = 360;
            }
            if(isClockWise === undefined){
                isClockWise = true;
            }

            var sumOfData = _.reduce(data, function(sum, num) {
                return sum + num;
            });

            var scale = this.createScale(0, sumOfData, 0, totalDegrees);
            var currentAngle = startAngle;
            var result = _(data).map(function(angle){
                var degrees = scale(angle);
                var vectors = that.getArcVectors(currentAngle, currentAngle + degrees);
                currentAngle = currentAngle + degrees;

                if(degrees > 180){
                    vectors.largeArc = 1;
                }else{
                    vectors.largeArc = 0;
                }
                return vectors;
            }).value();
            return result;
        },

        createOrdinalScale: function(array){
            var _array = angular.copy(array);
            if(!_.isArray(array)){
                throw new Error('createOrdinalScale only takes array as argument');
            }

            return function(num){
                if(_.isNumber(num) && array.length > num){
                    return array[num];
                }else{
                    var firstItem = _array.shift();
                    _array.push(firstItem);
                    return firstItem;
                }
            };
        },

        createScale: function(minA, maxA, minB, maxB, name){
            if(!_.every([minA, maxA, minB, maxB], function(n){
                return _.isNumber(n) || _.isDate(n);
            })){
                throw new Error('scale only accepts numbers or dates');
            }

            minA = minA.valueOf();
            maxA = maxA.valueOf();
            minB = minB.valueOf();
            maxB = maxB.valueOf();

            if(maxB > minB){
                return function(value){
                    return (value - minA) / (maxA - minA) * (maxB - minB) + minB;
                };
            }else if(maxB < minB){
                //Reverse scale
                return function(value){
                    return (value - minA) / (maxA - minA) * (maxB - minB) + minB;
                };
            }
        },


        nearest: function(n, v) {
            n = n / v;
            n = Math.round(n) * v;
            return n;
        },

        normalizeData: function(data){
            return _.map(data, function(item, i){
                if(!_.isObject(item) && _.isNumber(item)){
                    return {
                        x: i,
                        y: item
                    };
                }else{
                    return item;
                }
            });
        },

        isDataPoint: function(obj){
            return obj.x !== undefined && obj.y !== undefined;
        },

        assertGraphData: function(data){
            if(_.isArray(data)){
                if(_.every(data, _.isObject) && !_.every(data, this.isDataPoint)){
                    throw new Error('All objects in data argument need to have x and y attributes');
                }else if(!_.every(data, _.isObject) && !_.every(data, _.isNumber)){
                    throw new Error('If data array isn\'t an array of objects it must be an array of numbers');
                }
            }else{
                throw new Error('data argument has to be array');
            }
        },

        assertDataArray: function(data){
            if(!_.isArray(data)){
                throw new Error('tick data has to be array');
            }else{
                if(!_.every(data, _.isNumber) && !_.every(data, _.isDate)){
                    throw new Error('tick data has to be an array of dates, numbers or strings');
                }
            }
        },

        convertDataToSvgPaths: function(data, width, height, colors){
            // Get Max and Min Values
            var xData = _(data).pluck('data').flatten().pluck('x').value();
            var yData = _(data).pluck('data').flatten().pluck('y').value();

            var maxY = _.max(yData);
            var minY = _.min(yData);
            var maxX = _.max(xData);
            var minX = _.min(xData);

            // Create Scales to project data values onto x and y coordinates
            var colorScale = this.createOrdinalScale(colors);
            var xScale = this.createScale(minX, maxX, 0, width);
            var yScale = this.createScale(minY, maxY, height, 0);
            var self = this;

            return _.map(data, function(graph) {
                return {
                    label: graph.label,
                    path: self.convertDataToSvgPath(graph.data, width, height, xScale, yScale),
                    color: colorScale()
                };
            });

        },

        convertDataToSvgPath: function(data, width, height, xScale, yScale){
            this.assertGraphData(data);
            // If we have just an array of numbers normalizeData turns this array into an array with objects 
            // that have x and y attributes
            data = this.normalizeData(data);
            var length = data.length;


            // Apply scales to data to make the data into valid path data.
            var pathData = _(data).map(function(dataPoint){
                return {
                    x: xScale(dataPoint.x),
                    y: yScale(dataPoint.y)
                };
            });

            // Concatenate path data into SVG path grammar
            return 'M ' + _(pathData).map(function(dataPoint){ return '' + dataPoint.x + ' ' + dataPoint.y; }).join(' L ');
        },

        getZeroDecimalCount: function(number){
            var asString = '' + number;
            return asString.match(/0\.(?:0+)?/)[0].length - 2;
        },

        roundUpToStep: function(number, step){
            var result;
            if(step < 1){
                result = parseFloat((Math.ceil(number / step ) * step).toFixed(this.getZeroDecimalCount(step) + 1)); 
            }else{
                result = parseFloat((Math.ceil(number / step ) * step)); 
            }
            return result;
        },

        timeSteps: [
            1e3,    // 1-second
            5e3,    // 5-second
            15e3,   // 15-second
            3e4,    // 30-second
            6e4,    // 1-minute
            3e5,    // 5-minute
            9e5,    // 15-minute
            18e5,   // 30-minute
            36e5,   // 1-hour
            108e5,  // 3-hour
            216e5,  // 6-hour
            432e5,  // 12-hour
            864e5,  // 1-day
            1728e5, // 2-day
            6048e5, // 1-week
            2592e6, // 1-month
            7776e6, // 3-month
            31536e6 // 1-year
        ],

        numberSteps: [
            1,2,5,10
        ],

        // Rounds a number to the closest 1, 2, 5 or 10
        roundTickInterval: function(number, type){
            var asString = '' + number;
            var rebasedNumber;
            if(type === 'date'){
                return _(this.timeSteps).filter(function(t){
                    return t > number;
                }).min(function(n, i){
                    var h = Math.abs(number - n);
                    return h;
                }).value();
            }else if(number < 0.1){
                var zeroDecimalCount = this.getZeroDecimalCount(number);
                var numberWithoutDecimals = asString.substr(zeroDecimalCount + 2);
                rebasedNumber = parseFloat(numberWithoutDecimals.substr(0,1) + '.' + numberWithoutDecimals.substr(1));
                    
                var decimalFactor = (zeroDecimalCount * 100);

                return _(this.numberSteps).min(function(n){ 
                    return Math.abs(n - rebasedNumber); 
                }).value() / decimalFactor;
            }else{
                var decades = asString.match(/\d+/)[0].length;
                var decadeFactor = Math.pow(10, (decades-1));
                rebasedNumber = number / decadeFactor;
                return _(this.numberSteps).map().min(function(n){ 
                    return Math.abs(n - rebasedNumber); 
                }).value() * decadeFactor;
            }
        },

        createTickValues: function(array, ticks){
            this.assertDataArray(array);

            // Get Max and Min Values
            var max = _.max(array);
            var min = _.min(array);

            var type = 'number';
            if(_.isDate(max)){
                type = 'date';
            }

            var tickInterval = this.roundTickInterval((max - min)/ticks, type);

            var currentValue = this.roundUpToStep(min, tickInterval);

            var tickValues = [currentValue];

            while((currentValue + tickInterval) < max){
                currentValue += tickInterval;
                tickValues.push(currentValue);
            }

            if(type === 'date'){
                tickValues = _.map(tickValues, this.toDate);
            }

            return tickValues;
        },

        toDate: function(n){
            return new Date(n);
        },

        createTickObjects: function(data, size, ticks, minGap){
            if(!_.isArray(data)){
                throw new Error('data needs to be array');
            }else if(!_.isNumber(size) || isNaN(size) || size < 0){
                throw new Error('size needs to be an absolute number');
            }
            minGap = minGap || 10;
            ticks = ticks || 10;

            // Get Max and Min Values
            var self = this;
            var max = _.max(data);
            var min = _.min(data);
            var scale = this.createScale(min, max, size, 0);
            var maxTicks = Math.floor(size / minGap);

            if(ticks > maxTicks){
                ticks = maxTicks;
            }

            var tickValues = this.createTickValues(data, ticks);
            var tickObjects =  _.map(tickValues, function(value){
                var label = self.formatChartLabel(value);
                return {
                    label: label,
                    value: value,
                    position: scale(value)
                };
            });

            //If first and last tick are not accounted for, add them
            if(tickObjects[0].value !== min){
                tickObjects.unshift({
                    label: '',
                    value: min,
                    position: scale(min)
                });
            }
            if(tickObjects[tickObjects.length-1].value !== max){
                tickObjects.push({
                    label: '',
                    value: max,
                    position: scale(max)
                });
            }
            return tickObjects;
        },

        formatChartLabel: function(val){
            if(_.isNumber(val)){
                return val;
            }else if(_.isDate(val)){
                return $filter('date')(val, 'dd/MM/yy');
            }
        }
    };
}]);
})();
