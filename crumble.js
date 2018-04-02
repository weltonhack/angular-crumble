/**
 * Crubmel Breadcrumbs - 0.2.3.4
 * https://github.com/weltonhack/angular-crumble
 */
!function () {
    'use strict';

    var ERR_NO_LABEL = 'Could not find property "label" of type "String" in route'
            + ' definition for path ';
    var ERR_NO_PATH = 'No path given to getParent()';

    function bakery($location, $route, $interpolate) {
        var crumble = {
            trail: [],
            context: {}
        };

        crumble.update = function (context) {
            crumble.context = context ? angular.extend({}, context) : crumble.context;
            crumble.trail = build($location.path());
        };

        crumble.getParent = function (path) {
            if (!path) {
                throw new Error(ERR_NO_PATH);
            }
            return path.replace(/[^\/]*\/?$/, '');
        };

        crumble.getCrumb = function (path, ignoreMenu) {
            var route = crumble.getRoute(path);
            if (!route) {
                return [];
            }
            if (!angular.isString(route.label)) {
                throw new Error(ERR_NO_LABEL + JSON.stringify(path));
            }
            var isSubmenu = angular.isString(route.menu) && !ignoreMenu;
            var item = {
                path: $interpolate(path)(crumble.context),
                label: $interpolate(route.label)(crumble.context),
                ignoreMenu: isSubmenu || ignoreMenu
            };
            return isSubmenu ? [{
                    path: item.path, label: $interpolate(route.menu)(crumble.context)
                }, item] : item;
        };

        crumble.getRoute = function (path) {
            var route = find($route.routes, function (route) {
                return route.regexp && route.regexp.test(path);
            });
            return (route && route.redirectTo)
                    ? $route.routes[route.redirectTo]
                    : route;
        };

        function build(path) {
            if (path) {
                var breadcrumb = build(crumble.getParent(path));
                var last = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length-1] : {};
                var partial = crumble.getCrumb(path, last.ignoreMenu);
                return breadcrumb.concat(partial);
            } else {
                return [];
            }
        }

        function find(obj, fn, thisArg) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && fn.call(thisArg, obj[key], key, obj)) {
                    return obj[key];
                }
            }
        }

        return crumble;
    }

    angular
            .module('crumble', ['ngRoute'])
            .factory('crumble', ['$location', '$route', '$interpolate', bakery]);

}();
