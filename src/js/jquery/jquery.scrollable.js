(function($, w, undefined) {
    
    var Carousel = w.Carousel = function() {};
    
    Carousel.prototype = {
        _actual:            0,
        _walk:              1,
        _displayItems:      4,
        _animateDelay:      300,
        _itemW:             143,
        _itemH:             142,
        _itemStyle:         {
            margin:          '0 3px',
            backgroundColor: '#000',
            padding:         0,
            border:          0
        },
        _target:            null,
        _content:           null,
        _scroll:            null,
        _btnPrev:           null,
        _btnNext:           null,
        _data:              null,
        _dataCollection:    null,
        _onItemClick:       function() {},
        _autoScroll:        false,
        _autoScrollDelay:   3000,
        _orientation:       'landscape',
        
        setTarget: function(target) {
            this._target = target;
        },
        
        setOptions: function(options) {
            for(key in options) {
                if(typeof this['_'+key] !== 'undefined') {
                    this['_'+key] = options[key];
                }
            }
        },
        
        init: function() {
            var self = this;
            this._target.hide();
            this._setData(function() {
                self._createContent();
                self._createNavs();
                self._target.show();
                self.current();
            });
        },
        
        current: function() {
            var self = this;
            this._adjustScroll();
            
            this._btnPrev.bind('click', function(e) {
                self._btnPrev.unbind('click');
                self._btnNext.unbind('click');
                self.prev();
            });
            
            this._btnNext.bind('click', function(e) {
                self._btnPrev.unbind('click');
                self._btnNext.unbind('click');
                self.next();
            });
        },
        
        next: function() {
            var self = this;
            var desloc = this._getDesloc();
            this._scroll.animate({left: '-=' + desloc + 'px'}, this._animateDelay, 'linear', function() {
                var newIndex = self._actual;
                newIndex += self._walk;
                if(newIndex >= self._data.length) newIndex -= self._data.length;
                self._actual = newIndex;
                self.current();
            });
        },
        
        prev: function() {
            var self = this;
            var desloc = this._getDesloc();
            this._scroll.animate({left: '+=' + desloc + 'px'}, this._animateDelay,  function() {
                var newIndex = self._actual;
                newIndex -= self._walk;
                if(newIndex < 0) newIndex = self._data.length + newIndex;
                self._actual = newIndex;
                self.current();
            });
        },
        
        _createContent: function() {
            var item = this._data[this._actual];
            var w = $(item).outerWidth(true) * this._displayItems;
            this._content = $('<article class="carouselContent" />').css({
                float:      'left',
                width:      w,
                height:     this._itemH,
                overflow:   'hidden',
                position:   'relative',
                top:        0,
                left:       0
            }).appendTo(this._target);
            
            this._scroll = this._createScroll().appendTo(this._content);
        },
        
        _createScroll: function() {
            return $('<section class="carouselScroll" />').css({
                position:   'absolute',
                top:        0,
                left:       0,
                zIndex:     1
            });
        },
        
        _createNavs: function() {
            if(this._btnPrev == null || this._btnNext == null) {
                this._btnPrev = $('<button id="btnPrev">&lt;</button>').appendTo(this._content);
                this._btnNext = $('<button id="btnNext">&gt;</button>').appendTo(this._content);
            }
        },
        
        _setData: function(fnCallback) {
            var self = this;
            this._data = [];
            
            if(this._target.find('img').length > 0) {
                var queue = new ImageQueue();
                this._target.find('img').each(function() {
                    queue.addItem(this);
                });
                queue._oncomplete = function() {
                    nextStep.apply(self);
                };
                queue.start();
            } else {
                nextStep.apply(self);
            }
            
            function nextStep() {
                this._target.children().each(function(i, el) {
                    var objItem = this;
                    
                    if(this.tagName.toLowerCase() == 'img') {
                        objItem = $('<figure />').append(this).get(0);
                    }
                    
                    for(var key in self._itemStyle) {
                        if(self._itemStyle.hasOwnProperty(key)) {
                            $(objItem).css(key, self._itemStyle[key]);
                        }
                    }
                    
                    $(objItem).css({
                        float:      'left',
                        position:   'relative',
                        top:        0,
                        left:       0,
                        overflow:   'hidden',
                        width:      self._itemW,
                        height:     self._itemH
                    });
                    
                    $(objItem).click(function(e) {
                        self._onItemClick.apply(this, [e]);
                    });
                    
                    if(this.tagName.toLowerCase() == 'img') {
                        var image = $(this);
                        image.css({float: 'left', position: 'relative', top: 0, left: 0, zIndex: 1});
                        self._resizeImage(image, $(objItem).width(), $(objItem).height());
                    }
                    self._data.push(objItem);
                });
                this._target.children().remove();
                fnCallback.call(self);
            }
        },
        
        _adjustScroll: function() {
            var temp = this._createScroll();
            var viewArea = this._getViewArea();
            
            for(var i = 0, viewAreaLen = viewArea.length; i < viewAreaLen; i++) {
                var item = this._data[ viewArea[i] ];
                var clonedItem = $(item).clone(true);
                temp.append(clonedItem);
            }
            
            var itemsLen = temp.children().length;
            var itemW    = temp.children().outerWidth(true);
            var desloc = temp.children().outerWidth(true) * this._walk;
            temp.css('width', itemsLen * itemW);
            temp.css('left', desloc * -1);
            
            this._scroll.after(temp).remove();
            this._scroll = temp;
        },
        
        _getViewArea: function() {
            var dataLen = this._data.length;
            var response = [];
            for(var i = this._actual - this._walk, limit = this._actual + (this._displayItems + this._walk); i < limit; i++) {
                var index = (((i % dataLen) + dataLen) % dataLen);
                response.push(index);
            }
            return response;
        },
        
        _getDesloc: function() {
            return this._scroll.children().outerWidth(true) * this._walk;
        },
        
        _resizeImage: function(img, width, height) {
            var imageWidth = img.width() || img.get(0).width;
            var imageHeight = img.height() || img.get(0).height;
            var scaleX = parseInt(width) / imageWidth;
            var scaleY = parseInt(height) / imageHeight;
            var newWidth = 0;
            var newHeight = 0;
            
            if(imageHeight > imageWidth) {
                scaleX = scaleY;
            } else {
                scaleY = scaleX;
            }
            
            newWidth = imageWidth * scaleX;
            newHeight = imageHeight * scaleY;
            
            img.css('width', newWidth);
            img.css('height', newHeight);
            img.css('left', (width - newWidth) / 2);
            img.css('top', (height - newHeight) / 2);
        }
    };
})(jQuery, window);

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

(function($, w, undefined) {
    $.fn.scrollable = function(options) {
        
        return this.each(function(i, el) {
            var target = $(this);
            var c = new Carousel();
            c.setTarget(target);
            c.setOptions(options);
            c.init();
        });
    };
})(jQuery, window);