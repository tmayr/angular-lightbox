var app = angular.module('app', []);

app.directive('ngLightbox', ['$compile', function($compile) {
    return function(scope, element, attr) {
        var lightbox, options, overlay;

        var defaults = {
            'class_name': false,
            'trigger': 'manual',
            'element': element[0],
            'kind': 'normal'
        }

        var options = angular.extend(defaults, angular.fromJson(attr.ngLightbox));
        
        var add_overlay = function(){
            // check if element is passed by the user
            options.element = typeof options.element === 'string' ? document.getElementById(options.element) : options.element;

            if(document.getElementById('overlay')) return;
            // compiling when we add it to have the close directive kick in
            overlay = $compile('<div id="overlay" ng-lightbox-close/>')(scope);
            
            // add a custom class if specified
            options.class_name && overlay.addClass(options.class_name);

            // append to dom
            angular.element(document.body).append(overlay);

            // load iframe options if defined
            options.kind === 'iframe' && load_iframe();

            // we need to flush the styles before applying a class for animations
            window.getComputedStyle(overlay[0]).opacity;
            overlay.addClass('overlay-active');
            angular.element(options.element).addClass('lightbox-active');
        }

        var load_iframe = function(){
            options.element = options.element || 'lightbox-iframe';
            var iframe = "<div id='" + options.element + "' class='lightbox'><iframe frameBorder=0 width='100%' height='100%' src='" + attr.href + "'></iframe></div>";
            angular.element(document.body).append(iframe)
        }

        if(options.trigger === 'auto'){
            add_overlay();
        }else{
            element.bind('click', function(event) {
                add_overlay();
                event.preventDefault();
                return false;
            });
        }
    }
}]);

app.directive('ngLightboxClose', function() {
    return function(scope, element, attr) {
        var transition_events = ['webkitTransitionEnd', 'mozTransitionEnd', 'msTransitionEnd', 'oTransitionEnd', 'transitionend'];
        
        angular.forEach(transition_events, function(ev){
            element.bind(ev, function(){
                // on transitions, when the overlay doesnt have a class active, remove it
                !angular.element(document.getElementById('overlay')).hasClass('overlay-active') && angular.element(document.getElementById('overlay')).remove();
            });
        });

        // binding esc key to close
        angular.element(document.body).bind('keydown', function(event){
            event.keyCode === 27 && remove_overlay();
        });

        // binding click on overlay to close
        element.bind('click', function(event) {
            remove_overlay();
        });

        var remove_overlay = function(){
            var overlay = document.getElementById('overlay');
            angular.element(document.getElementsByClassName('lightbox-active')[0]).removeClass('lightbox-active');

            // fallback for ie8 and lower to handle the overlay close without animations
            if(angular.element(document.documentElement).hasClass('lt-ie9')){
                angular.element(overlay).remove();
            }else{
                angular.element(overlay).removeClass('overlay-active');
            }
        }
    }
});
