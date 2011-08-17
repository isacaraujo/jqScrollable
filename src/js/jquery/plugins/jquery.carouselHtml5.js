(function($, w, undefined) {
    $.fn.carouselHtml5 = function(options) {
        var defaults = {
            displayItems:   4,
            walk:           1,
            itemW:          143,
            itemH:          142,
            itemStyle: {
                margin:             '0 3px',
                backgroundColor:    '#000',
                padding:            0,
                border:             0
            },
            onItemClick:        function() {},
            btnPrevStyle:       {},
            btnNextStyle:       {},
            autoScroll:         false,
            autoScrollDelay:    3000,
            btnPrev:            null,
            btnNext:            null,
            btnPrevAttributes:  null,
            btnNextAttributes:  null
        };
        
        options = $.extend(defaults, options);
        
        return this.each(function(i, el) {
            var target = $(this);
            var c = new Carousel();
            c.setTarget(target);
            c.setOptions(options);
            c.init();
        });
    };
})(jQuery, window);