(function($, w, undefined) {
    var ImageQueue = w.ImageQueue = function() {};
    
    ImageQueue.prototype = {
        _actual: 0,
        _data: null,
        
        _oncomplete: function() {},
        
        addItem: function(image) {
            if(this._data == null) this._data = [];
            this._data.push(image);
        },
        
        start: function() {
            if(typeof(this._data[this._actual]) !== 'undefined') {
                this._actual = 0;
                this._current();
                return true;
            }
            return false;
        },
        
        _current: function() {
            var self = this;
            var image = this._data[this._actual];
            if(image.complete) {
                self._next();
            } else {
                $(image).one('load', function() {
                    self._next();
                });
            }
        },
        
        _next: function() {
            this._actual++;
            if(typeof(this._data[this._actual]) !== 'undefined') {
                this._current();
            } else {
                this._oncomplete();
            }
        }
    };
})(jQuery, window);