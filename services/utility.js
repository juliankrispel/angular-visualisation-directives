(function(){
"user strict";
angular.module('ngvis')
.factory('utilityService', function(){
    return {
        stripAngularProperties: function(obj){
            return _.omit(obj, function(val, key){
                return key.indexOf('$') > -1;
            });
        },

        dynamicTemplateUrl: function(templateUrl){
            return function (el, attr) {
                console.log(attr.templateurl, templateUrl);
                return attr.templateUrl || templateUrl;
            };
        },

        innerWidth: function(element){
            var paddingLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-left'));
            var paddingRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-right'));
            return element.offsetWidth - paddingLeft - paddingRight;
        }
    };
});
})();
