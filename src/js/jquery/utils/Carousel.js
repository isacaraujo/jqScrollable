(function($, w, undefined) {
    
    var Carousel = w.Carousel = function() {};
    
    Carousel.prototype = {
        _actual:            0,
        _walk:              1,
        _displayItems:      4,
        _animateDelay:      300,
        _itemW:             null,
        _itemH:             null,
        _itemStyle:         null,
        _target:            null,
        _content:           null,
        _scroll:            null,
        _btnPrev:           null,
        _btnNext:           null,
        _data:              null,
        _dataCollection:    null,
        _onItemClick:       null,
        _autoScroll:        false,
        _autoScrollDelay:   2000,
        _orientation:       'landscape',
        
        setTarget: function(target) {
            this._target = target;
        },
        
        setOptions: function(options) {
            this._itemW             = options.itemW;
            this._itemH             = options.itemH;
            this._itemStyle         = options.itemStyle;
            this._displayItems      = options.displayItems;
            this._walk              = options.walk;
            this._onItemClick       = options.onItemClick || function() {};
            this._autoScroll        = options.autoScroll;
            this._autoScrollDelay   = options.autoScrollDelay;
            this._orientation       = options.orientation;
            this._btnPrev           = options.btnPrev;
            this._btnNext           = options.btnNext;
            this._btnPrevAttributes = options.btnPrevAttributes;
            this._btnNextAttributes = options.btnNextAttributes;
        },
        
        init: function() {
            var self = this;
            this._target.hide();
            this._setData(function() {
                self._createContent();
                if(self._btnPrev == null || self._btnNext == null) {
                    self._btnPrev = $('<button id="btnPrev">&lt;</button>').appendTo(self._content);
                    self._btnNext = $('<button id="btnNext">&gt;</button>').appendTo(self._content);
                }
                self._setNavs();
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
        
        _setNavs: function() {
            var prevAttr = this._btnPrevAttributes || {};
            var nextAttr = this._btnNextAttributes || {};
            var style = {
                width:      50,
                height:     50,
                margin:     '40px 0 0',
                padding:    0,
                border:     0,
                position:   'relative',
                top:        0,
                left:       0,
                cursor:     'pointer',
                zIndex:     2
            };
            
            if(prevAttr['style'] == undefined || prevAttr['style'] == null) prevAttr['style'] = {};
            if(nextAttr['style'] == undefined || nextAttr['style'] == null) nextAttr['style'] = {};
            
            style.float = 'left';
            prevAttr['style'] = $.extend(style, prevAttr['style']);
            this._btnPrev.attr(prevAttr);
            this._btnPrev.css(prevAttr['style']);
            
            style.float = 'right';
            nextAttr['style'] = $.extend(style, nextAttr['style']);
            this._btnNext.attr(nextAttr);
            this._btnNext.css(nextAttr['style']);
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