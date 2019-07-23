jQuery(function() {
  initFixedScrollBlock();
  initCustomForms();
   initMobileNav()
  initActiveClass();
  initSlickCarousel();
  initSameHeight();
});


// initialize custom form elements
function initCustomForms() {
  jcf.setOptions('Select', {
    maxVisibleItems: 5,
    wrapNative: false,
    wrapNativeOnMobile: false,
  });
  jcf.replaceAll();
}

// align blocks height
function initSameHeight() {
  jQuery('.events-block').sameHeight({
    elements: '.content-hold',
    flexible: true,
    multiLine: true,
    biggestHeight: true
  });
  jQuery('.service-detail').sameHeight({
    elements: '.icon-hold',
    flexible: true,
    multiLine: true,
    biggestHeight: true
  });

  jQuery('.products-list').sameHeight({
    elements: '.title-text',
    flexible: true,
    multiLine: true,
    biggestHeight: true
  });
}


// initialize fixed blocks on scroll
function initFixedScrollBlock() {
  jQuery('#wrapper').fixedScrollBlock({
    slideBlock: '.fixed-header'
  });
}

function initActiveClass() {
  $('.menu-opener').on('click', function(e) {
    e.preventDefault();
    $('body').toggleClass('menu-active');
  });
  $(".popup").hover(function () {
    $('body').toggleClass("popup-active");
  });
}

// mobile menu init
function initMobileNav() {
  jQuery('body').mobileNav({
    hideOnClickOutside: true,
    menuActiveClass: 'link-active',
    menuOpener: '.link-opener',
    menuDrop: '.contact-list'
  });
}


/*
 * jQuery SameHeight plugin
 */
 ;(function($){
  $.fn.sameHeight = function(opt) {
    var options = $.extend({
      skipClass: 'same-height-ignore',
      leftEdgeClass: 'same-height-left',
      rightEdgeClass: 'same-height-right',
      elements: '>*',
      flexible: false,
      multiLine: false,
      useMinHeight: false,
      biggestHeight: false
    },opt);
    return this.each(function(){
      var holder = $(this), postResizeTimer, ignoreResize;
      var elements = holder.find(options.elements).not('.' + options.skipClass);
      if(!elements.length) return;

      // resize handler
      function doResize() {
        elements.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', '');
        if(options.multiLine) {
          // resize elements row by row
          resizeElementsByRows(elements, options);
        } else {
          // resize elements by holder
          resizeElements(elements, holder, options);
        }
      }
      doResize();

      // handle flexible layout / font resize
      var delayedResizeHandler = function() {
        if(!ignoreResize) {
          ignoreResize = true;
          doResize();
          clearTimeout(postResizeTimer);
          postResizeTimer = setTimeout(function() {
            doResize();
            setTimeout(function(){
              ignoreResize = false;
            }, 10);
          }, 100);
        }
      };

      // handle flexible/responsive layout
      if(options.flexible) {
        $(window).bind('resize orientationchange fontresize', delayedResizeHandler);
      }

      // handle complete page load including images and fonts
      $(window).bind('load', delayedResizeHandler);
    });
  };

  // detect css min-height support
  var supportMinHeight = typeof document.documentElement.style.maxHeight !== 'undefined';

  // get elements by rows
  function resizeElementsByRows(boxes, options) {
    var currentRow = $(), maxHeight, maxCalcHeight = 0, firstOffset = boxes.eq(0).offset().top;
    boxes.each(function(ind){
      var curItem = $(this);
      if(curItem.offset().top === firstOffset) {
        currentRow = currentRow.add(this);
      } else {
        maxHeight = getMaxHeight(currentRow);
        maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
        currentRow = curItem;
        firstOffset = curItem.offset().top;
      }
    });
    if(currentRow.length) {
      maxHeight = getMaxHeight(currentRow);
      maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
    }
    if(options.biggestHeight) {
      boxes.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', maxCalcHeight);
    }
  }

  // calculate max element height
  function getMaxHeight(boxes) {
    var maxHeight = 0;
    boxes.each(function(){
      maxHeight = Math.max(maxHeight, $(this).outerHeight());
    });
    return maxHeight;
  }

  // resize helper function
  function resizeElements(boxes, parent, options) {
    var calcHeight;
    var parentHeight = typeof parent === 'number' ? parent : parent.height();
    boxes.removeClass(options.leftEdgeClass).removeClass(options.rightEdgeClass).each(function(i){
      var element = $(this);
      var depthDiffHeight = 0;
      var isBorderBox = element.css('boxSizing') === 'border-box' || element.css('-moz-box-sizing') === 'border-box' || element.css('-webkit-box-sizing') === 'border-box';

      if(typeof parent !== 'number') {
        element.parents().each(function(){
          var tmpParent = $(this);
          if(parent.is(this)) {
            return false;
          } else {
            depthDiffHeight += tmpParent.outerHeight() - tmpParent.height();
          }
        });
      }
      calcHeight = parentHeight - depthDiffHeight;
      calcHeight -= isBorderBox ? 0 : element.outerHeight() - element.height();

      if(calcHeight > 0) {
        element.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', calcHeight);
      }
    });
    boxes.filter(':first').addClass(options.leftEdgeClass);
    boxes.filter(':last').addClass(options.rightEdgeClass);
    return calcHeight;
  }
}(jQuery));

/*
 * FixedScrollBlock
 */
 ;(function($, window) {
  'use strict';
  var isMobileDevice = ('ontouchstart' in window) ||
  (window.DocumentTouch && document instanceof DocumentTouch) ||
  /Windows Phone/.test(navigator.userAgent);

  function FixedScrollBlock(options) {
    this.options = $.extend({
      fixedActiveClass: 'fixed-position',
      slideBlock: '[data-scroll-block]',
      positionType: 'auto',
      fixedOnlyIfFits: true,
      container: null,
      animDelay: 100,
      animSpeed: 200,
      extraBottom: 0,
      extraTop: 0
    }, options);
    this.initStructure();
    this.attachEvents();
  }
  FixedScrollBlock.prototype = {
    initStructure: function() {
      // find elements
      this.win = $(window);
      this.container = $(this.options.container);
      this.slideBlock = this.container.find(this.options.slideBlock);

      // detect method
      if(this.options.positionType === 'auto') {
        this.options.positionType = isMobileDevice ? 'absolute' : 'fixed';
      }
    },
    attachEvents: function() {
      var self = this;

      // bind events
      this.onResize = function() {
        self.resizeHandler();
      };
      this.onScroll = function() {
        self.scrollHandler();
      };

      // handle events
      this.win.on({
        resize: this.onResize,
        scroll: this.onScroll
      });

      // initial handler call
      this.resizeHandler();
    },
    recalculateOffsets: function() {
      var defaultOffset = this.slideBlock.offset(),
      defaultPosition = this.slideBlock.position(),
      holderOffset = this.container.offset(),
      windowSize = this.win.height();

      this.data = {
        windowHeight: this.win.height(),
        windowWidth: this.win.width(),

        blockPositionLeft: defaultPosition.left,
        blockPositionTop: defaultPosition.top,

        blockOffsetLeft: defaultOffset.left,
        blockOffsetTop: defaultOffset.top,
        blockHeight: this.slideBlock.innerHeight(),

        holderOffsetLeft: holderOffset.left,
        holderOffsetTop: holderOffset.top,
        holderHeight: this.container.innerHeight()
      };
    },
    isVisible: function() {
      return this.slideBlock.prop('offsetHeight');
    },
    fitsInViewport: function() {
      if(this.options.fixedOnlyIfFits && this.data) {
        return this.data.blockHeight + this.options.extraTop <= this.data.windowHeight;
      } else {
        return true;
      }
    },
    resizeHandler: function() {
      if(this.isVisible()) {
        FixedScrollBlock.stickyMethods[this.options.positionType].onResize.apply(this, arguments);
        this.scrollHandler();
      }
    },
    scrollHandler: function() {
      if(this.isVisible()) {
        if(!this.data) {
          this.resizeHandler();
          return;
        }
        this.currentScrollTop = this.win.scrollTop();
        this.currentScrollLeft = this.win.scrollLeft();
        FixedScrollBlock.stickyMethods[this.options.positionType].onScroll.apply(this, arguments);
      }
    },
    refresh: function() {
      // refresh dimensions and state if needed
      if(this.data) {
        this.data.holderHeight = this.container.innerHeight();
        this.data.blockHeight = this.slideBlock.innerHeight();
        this.scrollHandler();
      }
    },
    destroy: function() {
      // remove event handlers and styles
      this.slideBlock.removeAttr('style').removeClass(this.options.fixedActiveClass);
      this.win.off({
        resize: this.onResize,
        scroll: this.onScroll
      });
    }
  };

  // sticky methods
  FixedScrollBlock.stickyMethods = {
    fixed: {
      onResize: function() {
        this.slideBlock.removeAttr('style');
        this.recalculateOffsets();
      },
      onScroll: function() {
        if(this.fitsInViewport() && this.currentScrollTop + this.options.extraTop > this.data.blockOffsetTop) {
          if(this.currentScrollTop + this.options.extraTop + this.data.blockHeight > this.data.holderOffsetTop + this.data.holderHeight - this.options.extraBottom) {
            this.slideBlock.css({
              position: 'absolute',
              top: this.data.blockPositionTop + this.data.holderHeight - this.data.blockHeight - this.options.extraBottom - (this.data.blockOffsetTop - this.data.holderOffsetTop),
              left: this.data.blockPositionLeft
            });
          } else {
            this.slideBlock.css({
              position: 'fixed',
              top: this.options.extraTop,
              left: this.data.blockOffsetLeft - this.currentScrollLeft
            });
          }
          this.slideBlock.addClass(this.options.fixedActiveClass);
        } else {
          this.slideBlock.removeClass(this.options.fixedActiveClass).removeAttr('style');
        }
      }
    },
    absolute: {
      onResize: function() {
        this.slideBlock.removeAttr('style');
        this.recalculateOffsets();

        this.slideBlock.css({
          position: 'absolute',
          top: this.data.blockPositionTop,
          left: this.data.blockPositionLeft
        });

        this.slideBlock.addClass(this.options.fixedActiveClass);
      },
      onScroll: function() {
        var self = this;
        clearTimeout(this.animTimer);
        this.animTimer = setTimeout(function() {
          var currentScrollTop = self.currentScrollTop + self.options.extraTop,
          initialPosition = self.data.blockPositionTop - (self.data.blockOffsetTop - self.data.holderOffsetTop),
          maxTopPosition =  self.data.holderHeight - self.data.blockHeight - self.options.extraBottom,
          currentTopPosition = initialPosition + Math.min(currentScrollTop - self.data.holderOffsetTop, maxTopPosition),
          calcTopPosition = self.fitsInViewport() && currentScrollTop > self.data.blockOffsetTop ? currentTopPosition : self.data.blockPositionTop;

          self.slideBlock.stop().animate({
            top: calcTopPosition
          }, self.options.animSpeed);
        }, this.options.animDelay);
      }
    }
  };

  // jQuery plugin interface
  $.fn.fixedScrollBlock = function(options) {
    return this.each(function() {
      var params = $.extend({}, options, {container: this}),
      instance = new FixedScrollBlock(params);
      $.data(this, 'FixedScrollBlock', instance);
    });
  };

  // module exports
  window.FixedScrollBlock = FixedScrollBlock;
}(jQuery, this));


// slick init
function initSlickCarousel() {
  jQuery('.slick-wrap').slick({
    slidesToScroll: 1,
    slidesToShow: 1,
    prevArrow: '<button class="slick-prev"><span class="icon-left"></span></button>',
    nextArrow: '<button class="slick-next"><span class="icon-right"></span></button>',
    autoplay: true,
    mobileFirst: true,
    // rtl: true,
    responsive: [
    {
      breakpoint: 1023,
      settings: {
        slidesToShow: 4
      }
    }, {
      breakpoint: 767,
      settings: {
        slidesToShow: 3
      }
    }, {
      breakpoint: 479,
      settings: {
        slidesToShow: 2
      }
    }, {
      breakpoint: 320,
      settings: {
        slidesToShow: 1
      }
    }
    ]
  });
}



/*
 _ _      _       _
 ___| (_) ___| | __  (_)___
 / __| | |/ __| |/ /  | / __|
 \__ \ | | (__|   < _ | \__ \
 |___/_|_|\___|_|\_(_)/ |___/
 |__/

 Version: 1.6.0
 Author: Ken Wheeler
 Website: http://kenwheeler.github.io
 Docs: http://kenwheeler.github.io/slick
 Repo: http://github.com/kenwheeler/slick
 Issues: http://github.com/kenwheeler/slick/issues

 */
 !function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery"],a):"undefined"!=typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){"use strict";var b=window.Slick||{};b=function(){function c(c,d){var f,e=this;e.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:a(c),appendDots:a(c),arrows:!0,asNavFor:null,prevArrow:'<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',nextArrow:'<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(b,c){return a('<button type="button" data-role="none" role="button" tabindex="0" />').text(c+1)},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnFocus:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!0,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},e.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},a.extend(e,e.initials),e.activeBreakpoint=null,e.animType=null,e.animProp=null,e.breakpoints=[],e.breakpointSettings=[],e.cssTransitions=!1,e.focussed=!1,e.interrupted=!1,e.hidden="hidden",e.paused=!0,e.positionProp=null,e.respondTo=null,e.rowCount=1,e.shouldClick=!0,e.$slider=a(c),e.$slidesCache=null,e.transformType=null,e.transitionType=null,e.visibilityChange="visibilitychange",e.windowWidth=0,e.windowTimer=null,f=a(c).data("slick")||{},e.options=a.extend({},e.defaults,d,f),e.currentSlide=e.options.initialSlide,e.originalSettings=e.options,"undefined"!=typeof document.mozHidden?(e.hidden="mozHidden",e.visibilityChange="mozvisibilitychange"):"undefined"!=typeof document.webkitHidden&&(e.hidden="webkitHidden",e.visibilityChange="webkitvisibilitychange"),e.autoPlay=a.proxy(e.autoPlay,e),e.autoPlayClear=a.proxy(e.autoPlayClear,e),e.autoPlayIterator=a.proxy(e.autoPlayIterator,e),e.changeSlide=a.proxy(e.changeSlide,e),e.clickHandler=a.proxy(e.clickHandler,e),e.selectHandler=a.proxy(e.selectHandler,e),e.setPosition=a.proxy(e.setPosition,e),e.swipeHandler=a.proxy(e.swipeHandler,e),e.dragHandler=a.proxy(e.dragHandler,e),e.keyHandler=a.proxy(e.keyHandler,e),e.instanceUid=b++,e.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,e.registerBreakpoints(),e.init(!0)}var b=0;return c}(),b.prototype.activateADA=function(){var a=this;a.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},b.prototype.addSlide=b.prototype.slickAdd=function(b,c,d){var e=this;if("boolean"==typeof c)d=c,c=null;else if(0>c||c>=e.slideCount)return!1;e.unload(),"number"==typeof c?0===c&&0===e.$slides.length?a(b).appendTo(e.$slideTrack):d?a(b).insertBefore(e.$slides.eq(c)):a(b).insertAfter(e.$slides.eq(c)):d===!0?a(b).prependTo(e.$slideTrack):a(b).appendTo(e.$slideTrack),e.$slides=e.$slideTrack.children(this.options.slide),e.$slideTrack.children(this.options.slide).detach(),e.$slideTrack.append(e.$slides),e.$slides.each(function(b,c){a(c).attr("data-slick-index",b)}),e.$slidesCache=e.$slides,e.reinit()},b.prototype.animateHeight=function(){var a=this;if(1===a.options.slidesToShow&&a.options.adaptiveHeight===!0&&a.options.vertical===!1){var b=a.$slides.eq(a.currentSlide).outerHeight(!0);a.$list.animate({height:b},a.options.speed)}},b.prototype.animateSlide=function(b,c){var d={},e=this;e.animateHeight(),e.options.rtl===!0&&e.options.vertical===!1&&(b=-b),e.transformsEnabled===!1?e.options.vertical===!1?e.$slideTrack.animate({left:b},e.options.speed,e.options.easing,c):e.$slideTrack.animate({top:b},e.options.speed,e.options.easing,c):e.cssTransitions===!1?(e.options.rtl===!0&&(e.currentLeft=-e.currentLeft),a({animStart:e.currentLeft}).animate({animStart:b},{duration:e.options.speed,easing:e.options.easing,step:function(a){a=Math.ceil(a),e.options.vertical===!1?(d[e.animType]="translate("+a+"px, 0px)",e.$slideTrack.css(d)):(d[e.animType]="translate(0px,"+a+"px)",e.$slideTrack.css(d))},complete:function(){c&&c.call()}})):(e.applyTransition(),b=Math.ceil(b),e.options.vertical===!1?d[e.animType]="translate3d("+b+"px, 0px, 0px)":d[e.animType]="translate3d(0px,"+b+"px, 0px)",e.$slideTrack.css(d),c&&setTimeout(function(){e.disableTransition(),c.call()},e.options.speed))},b.prototype.getNavTarget=function(){var b=this,c=b.options.asNavFor;return c&&null!==c&&(c=a(c).not(b.$slider)),c},b.prototype.asNavFor=function(b){var c=this,d=c.getNavTarget();null!==d&&"object"==typeof d&&d.each(function(){var c=a(this).slick("getSlick");c.unslicked||c.slideHandler(b,!0)})},b.prototype.applyTransition=function(a){var b=this,c={};b.options.fade===!1?c[b.transitionType]=b.transformType+" "+b.options.speed+"ms "+b.options.cssEase:c[b.transitionType]="opacity "+b.options.speed+"ms "+b.options.cssEase,b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.autoPlay=function(){var a=this;a.autoPlayClear(),a.slideCount>a.options.slidesToShow&&(a.autoPlayTimer=setInterval(a.autoPlayIterator,a.options.autoplaySpeed))},b.prototype.autoPlayClear=function(){var a=this;a.autoPlayTimer&&clearInterval(a.autoPlayTimer)},b.prototype.autoPlayIterator=function(){var a=this,b=a.currentSlide+a.options.slidesToScroll;a.paused||a.interrupted||a.focussed||(a.options.infinite===!1&&(1===a.direction&&a.currentSlide+1===a.slideCount-1?a.direction=0:0===a.direction&&(b=a.currentSlide-a.options.slidesToScroll,a.currentSlide-1===0&&(a.direction=1))),a.slideHandler(b))},b.prototype.buildArrows=function(){var b=this;b.options.arrows===!0&&(b.$prevArrow=a(b.options.prevArrow).addClass("slick-arrow"),b.$nextArrow=a(b.options.nextArrow).addClass("slick-arrow"),b.slideCount>b.options.slidesToShow?(b.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),b.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),b.htmlExpr.test(b.options.prevArrow)&&b.$prevArrow.prependTo(b.options.appendArrows),b.htmlExpr.test(b.options.nextArrow)&&b.$nextArrow.appendTo(b.options.appendArrows),b.options.infinite!==!0&&b.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):b.$prevArrow.add(b.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},b.prototype.buildDots=function(){var c,d,b=this;if(b.options.dots===!0&&b.slideCount>b.options.slidesToShow){for(b.$slider.addClass("slick-dotted"),d=a("<ul />").addClass(b.options.dotsClass),c=0;c<=b.getDotCount();c+=1)d.append(a("<li />").append(b.options.customPaging.call(this,b,c)));b.$dots=d.appendTo(b.options.appendDots),b.$dots.find("li").first().addClass("slick-active").attr("aria-hidden","false")}},b.prototype.buildOut=function(){var b=this;b.$slides=b.$slider.children(b.options.slide+":not(.slick-cloned)").addClass("slick-slide"),b.slideCount=b.$slides.length,b.$slides.each(function(b,c){a(c).attr("data-slick-index",b).data("originalStyling",a(c).attr("style")||"")}),b.$slider.addClass("slick-slider"),b.$slideTrack=0===b.slideCount?a('<div class="slick-track"/>').appendTo(b.$slider):b.$slides.wrapAll('<div class="slick-track"/>').parent(),b.$list=b.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(),b.$slideTrack.css("opacity",0),(b.options.centerMode===!0||b.options.swipeToSlide===!0)&&(b.options.slidesToScroll=1),a("img[data-lazy]",b.$slider).not("[src]").addClass("slick-loading"),b.setupInfinite(),b.buildArrows(),b.buildDots(),b.updateDots(),b.setSlideClasses("number"==typeof b.currentSlide?b.currentSlide:0),b.options.draggable===!0&&b.$list.addClass("draggable")},b.prototype.buildRows=function(){var b,c,d,e,f,g,h,a=this;if(e=document.createDocumentFragment(),g=a.$slider.children(),a.options.rows>1){for(h=a.options.slidesPerRow*a.options.rows,f=Math.ceil(g.length/h),b=0;f>b;b++){var i=document.createElement("div");for(c=0;c<a.options.rows;c++){var j=document.createElement("div");for(d=0;d<a.options.slidesPerRow;d++){var k=b*h+(c*a.options.slidesPerRow+d);g.get(k)&&j.appendChild(g.get(k))}i.appendChild(j)}e.appendChild(i)}a.$slider.empty().append(e),a.$slider.children().children().children().css({width:100/a.options.slidesPerRow+"%",display:"inline-block"})}},b.prototype.checkResponsive=function(b,c){var e,f,g,d=this,h=!1,i=d.$slider.width(),j=window.innerWidth||a(window).width();if("window"===d.respondTo?g=j:"slider"===d.respondTo?g=i:"min"===d.respondTo&&(g=Math.min(j,i)),d.options.responsive&&d.options.responsive.length&&null!==d.options.responsive){f=null;for(e in d.breakpoints)d.breakpoints.hasOwnProperty(e)&&(d.originalSettings.mobileFirst===!1?g<d.breakpoints[e]&&(f=d.breakpoints[e]):g>d.breakpoints[e]&&(f=d.breakpoints[e]));null!==f?null!==d.activeBreakpoint?(f!==d.activeBreakpoint||c)&&(d.activeBreakpoint=f,"unslick"===d.breakpointSettings[f]?d.unslick(f):(d.options=a.extend({},d.originalSettings,d.breakpointSettings[f]),b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b)),h=f):(d.activeBreakpoint=f,"unslick"===d.breakpointSettings[f]?d.unslick(f):(d.options=a.extend({},d.originalSettings,d.breakpointSettings[f]),b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b)),h=f):null!==d.activeBreakpoint&&(d.activeBreakpoint=null,d.options=d.originalSettings,b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b),h=f),b||h===!1||d.$slider.trigger("breakpoint",[d,h])}},b.prototype.changeSlide=function(b,c){var f,g,h,d=this,e=a(b.currentTarget);switch(e.is("a")&&b.preventDefault(),e.is("li")||(e=e.closest("li")),h=d.slideCount%d.options.slidesToScroll!==0,f=h?0:(d.slideCount-d.currentSlide)%d.options.slidesToScroll,b.data.message){case"previous":g=0===f?d.options.slidesToScroll:d.options.slidesToShow-f,d.slideCount>d.options.slidesToShow&&d.slideHandler(d.currentSlide-g,!1,c);break;case"next":g=0===f?d.options.slidesToScroll:f,d.slideCount>d.options.slidesToShow&&d.slideHandler(d.currentSlide+g,!1,c);break;case"index":var i=0===b.data.index?0:b.data.index||e.index()*d.options.slidesToScroll;d.slideHandler(d.checkNavigable(i),!1,c),e.children().trigger("focus");break;default:return}},b.prototype.checkNavigable=function(a){var c,d,b=this;if(c=b.getNavigableIndexes(),d=0,a>c[c.length-1])a=c[c.length-1];else for(var e in c){if(a<c[e]){a=d;break}d=c[e]}return a},b.prototype.cleanUpEvents=function(){var b=this;b.options.dots&&null!==b.$dots&&a("li",b.$dots).off("click.slick",b.changeSlide).off("mouseenter.slick",a.proxy(b.interrupt,b,!0)).off("mouseleave.slick",a.proxy(b.interrupt,b,!1)),b.$slider.off("focus.slick blur.slick"),b.options.arrows===!0&&b.slideCount>b.options.slidesToShow&&(b.$prevArrow&&b.$prevArrow.off("click.slick",b.changeSlide),b.$nextArrow&&b.$nextArrow.off("click.slick",b.changeSlide)),b.$list.off("touchstart.slick mousedown.slick",b.swipeHandler),b.$list.off("touchmove.slick mousemove.slick",b.swipeHandler),b.$list.off("touchend.slick mouseup.slick",b.swipeHandler),b.$list.off("touchcancel.slick mouseleave.slick",b.swipeHandler),b.$list.off("click.slick",b.clickHandler),a(document).off(b.visibilityChange,b.visibility),b.cleanUpSlideEvents(),b.options.accessibility===!0&&b.$list.off("keydown.slick",b.keyHandler),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().off("click.slick",b.selectHandler),a(window).off("orientationchange.slick.slick-"+b.instanceUid,b.orientationChange),a(window).off("resize.slick.slick-"+b.instanceUid,b.resize),a("[draggable!=true]",b.$slideTrack).off("dragstart",b.preventDefault),a(window).off("load.slick.slick-"+b.instanceUid,b.setPosition),a(document).off("ready.slick.slick-"+b.instanceUid,b.setPosition)},b.prototype.cleanUpSlideEvents=function(){var b=this;b.$list.off("mouseenter.slick",a.proxy(b.interrupt,b,!0)),b.$list.off("mouseleave.slick",a.proxy(b.interrupt,b,!1))},b.prototype.cleanUpRows=function(){var b,a=this;a.options.rows>1&&(b=a.$slides.children().children(),b.removeAttr("style"),a.$slider.empty().append(b))},b.prototype.clickHandler=function(a){var b=this;b.shouldClick===!1&&(a.stopImmediatePropagation(),a.stopPropagation(),a.preventDefault())},b.prototype.destroy=function(b){var c=this;c.autoPlayClear(),c.touchObject={},c.cleanUpEvents(),a(".slick-cloned",c.$slider).detach(),c.$dots&&c.$dots.remove(),c.$prevArrow&&c.$prevArrow.length&&(c.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),c.htmlExpr.test(c.options.prevArrow)&&c.$prevArrow.remove()),c.$nextArrow&&c.$nextArrow.length&&(c.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),c.htmlExpr.test(c.options.nextArrow)&&c.$nextArrow.remove()),c.$slides&&(c.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){a(this).attr("style",a(this).data("originalStyling"))}),c.$slideTrack.children(this.options.slide).detach(),c.$slideTrack.detach(),c.$list.detach(),c.$slider.append(c.$slides)),c.cleanUpRows(),c.$slider.removeClass("slick-slider"),c.$slider.removeClass("slick-initialized"),c.$slider.removeClass("slick-dotted"),c.unslicked=!0,b||c.$slider.trigger("destroy",[c])},b.prototype.disableTransition=function(a){var b=this,c={};c[b.transitionType]="",b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.fadeSlide=function(a,b){var c=this;c.cssTransitions===!1?(c.$slides.eq(a).css({zIndex:c.options.zIndex}),c.$slides.eq(a).animate({opacity:1},c.options.speed,c.options.easing,b)):(c.applyTransition(a),c.$slides.eq(a).css({opacity:1,zIndex:c.options.zIndex}),b&&setTimeout(function(){c.disableTransition(a),b.call()},c.options.speed))},b.prototype.fadeSlideOut=function(a){var b=this;b.cssTransitions===!1?b.$slides.eq(a).animate({opacity:0,zIndex:b.options.zIndex-2},b.options.speed,b.options.easing):(b.applyTransition(a),b.$slides.eq(a).css({opacity:0,zIndex:b.options.zIndex-2}))},b.prototype.filterSlides=b.prototype.slickFilter=function(a){var b=this;null!==a&&(b.$slidesCache=b.$slides,b.unload(),b.$slideTrack.children(this.options.slide).detach(),b.$slidesCache.filter(a).appendTo(b.$slideTrack),b.reinit())},b.prototype.focusHandler=function(){var b=this;b.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick","*:not(.slick-arrow)",function(c){c.stopImmediatePropagation();var d=a(this);setTimeout(function(){b.options.pauseOnFocus&&(b.focussed=d.is(":focus"),b.autoPlay())},0)})},b.prototype.getCurrent=b.prototype.slickCurrentSlide=function(){var a=this;return a.currentSlide},b.prototype.getDotCount=function(){var a=this,b=0,c=0,d=0;if(a.options.infinite===!0)for(;b<a.slideCount;)++d,b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;else if(a.options.centerMode===!0)d=a.slideCount;else if(a.options.asNavFor)for(;b<a.slideCount;)++d,b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;else d=1+Math.ceil((a.slideCount-a.options.slidesToShow)/a.options.slidesToScroll);return d-1},b.prototype.getLeft=function(a){var c,d,f,b=this,e=0;return b.slideOffset=0,d=b.$slides.first().outerHeight(!0),b.options.infinite===!0?(b.slideCount>b.options.slidesToShow&&(b.slideOffset=b.slideWidth*b.options.slidesToShow*-1,e=d*b.options.slidesToShow*-1),b.slideCount%b.options.slidesToScroll!==0&&a+b.options.slidesToScroll>b.slideCount&&b.slideCount>b.options.slidesToShow&&(a>b.slideCount?(b.slideOffset=(b.options.slidesToShow-(a-b.slideCount))*b.slideWidth*-1,e=(b.options.slidesToShow-(a-b.slideCount))*d*-1):(b.slideOffset=b.slideCount%b.options.slidesToScroll*b.slideWidth*-1,e=b.slideCount%b.options.slidesToScroll*d*-1))):a+b.options.slidesToShow>b.slideCount&&(b.slideOffset=(a+b.options.slidesToShow-b.slideCount)*b.slideWidth,e=(a+b.options.slidesToShow-b.slideCount)*d),b.slideCount<=b.options.slidesToShow&&(b.slideOffset=0,e=0),b.options.centerMode===!0&&b.options.infinite===!0?b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)-b.slideWidth:b.options.centerMode===!0&&(b.slideOffset=0,b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)),c=b.options.vertical===!1?a*b.slideWidth*-1+b.slideOffset:a*d*-1+e,b.options.variableWidth===!0&&(f=b.slideCount<=b.options.slidesToShow||b.options.infinite===!1?b.$slideTrack.children(".slick-slide").eq(a):b.$slideTrack.children(".slick-slide").eq(a+b.options.slidesToShow),c=b.options.rtl===!0?f[0]?-1*(b.$slideTrack.width()-f[0].offsetLeft-f.width()):0:f[0]?-1*f[0].offsetLeft:0,b.options.centerMode===!0&&(f=b.slideCount<=b.options.slidesToShow||b.options.infinite===!1?b.$slideTrack.children(".slick-slide").eq(a):b.$slideTrack.children(".slick-slide").eq(a+b.options.slidesToShow+1),c=b.options.rtl===!0?f[0]?-1*(b.$slideTrack.width()-f[0].offsetLeft-f.width()):0:f[0]?-1*f[0].offsetLeft:0,c+=(b.$list.width()-f.outerWidth())/2)),c},b.prototype.getOption=b.prototype.slickGetOption=function(a){var b=this;return b.options[a]},b.prototype.getNavigableIndexes=function(){var e,a=this,b=0,c=0,d=[];for(a.options.infinite===!1?e=a.slideCount:(b=-1*a.options.slidesToScroll,c=-1*a.options.slidesToScroll,e=2*a.slideCount);e>b;)d.push(b),b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;return d},b.prototype.getSlick=function(){return this},b.prototype.getSlideCount=function(){var c,d,e,b=this;return e=b.options.centerMode===!0?b.slideWidth*Math.floor(b.options.slidesToShow/2):0,b.options.swipeToSlide===!0?(b.$slideTrack.find(".slick-slide").each(function(c,f){return f.offsetLeft-e+a(f).outerWidth()/2>-1*b.swipeLeft?(d=f,!1):void 0}),c=Math.abs(a(d).attr("data-slick-index")-b.currentSlide)||1):b.options.slidesToScroll},b.prototype.goTo=b.prototype.slickGoTo=function(a,b){var c=this;c.changeSlide({data:{message:"index",index:parseInt(a)}},b)},b.prototype.init=function(b){var c=this;a(c.$slider).hasClass("slick-initialized")||(a(c.$slider).addClass("slick-initialized"),c.buildRows(),c.buildOut(),c.setProps(),c.startLoad(),c.loadSlider(),c.initializeEvents(),c.updateArrows(),c.updateDots(),c.checkResponsive(!0),c.focusHandler()),b&&c.$slider.trigger("init",[c]),c.options.accessibility===!0&&c.initADA(),c.options.autoplay&&(c.paused=!1,c.autoPlay())},b.prototype.initADA=function(){var b=this;b.$slides.add(b.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),b.$slideTrack.attr("role","listbox"),b.$slides.not(b.$slideTrack.find(".slick-cloned")).each(function(c){a(this).attr({role:"option","aria-describedby":"slick-slide"+b.instanceUid+c})}),null!==b.$dots&&b.$dots.attr("role","tablist").find("li").each(function(c){a(this).attr({role:"presentation","aria-selected":"false","aria-controls":"navigation"+b.instanceUid+c,id:"slick-slide"+b.instanceUid+c})}).first().attr("aria-selected","true").end().find("button").attr("role","button").end().closest("div").attr("role","toolbar"),b.activateADA()},b.prototype.initArrowEvents=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.off("click.slick").on("click.slick",{message:"previous"},a.changeSlide),a.$nextArrow.off("click.slick").on("click.slick",{message:"next"},a.changeSlide))},b.prototype.initDotEvents=function(){var b=this;b.options.dots===!0&&b.slideCount>b.options.slidesToShow&&a("li",b.$dots).on("click.slick",{message:"index"},b.changeSlide),b.options.dots===!0&&b.options.pauseOnDotsHover===!0&&a("li",b.$dots).on("mouseenter.slick",a.proxy(b.interrupt,b,!0)).on("mouseleave.slick",a.proxy(b.interrupt,b,!1))},b.prototype.initSlideEvents=function(){var b=this;b.options.pauseOnHover&&(b.$list.on("mouseenter.slick",a.proxy(b.interrupt,b,!0)),b.$list.on("mouseleave.slick",a.proxy(b.interrupt,b,!1)))},b.prototype.initializeEvents=function(){var b=this;b.initArrowEvents(),b.initDotEvents(),b.initSlideEvents(),b.$list.on("touchstart.slick mousedown.slick",{action:"start"},b.swipeHandler),b.$list.on("touchmove.slick mousemove.slick",{action:"move"},b.swipeHandler),b.$list.on("touchend.slick mouseup.slick",{action:"end"},b.swipeHandler),b.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},b.swipeHandler),b.$list.on("click.slick",b.clickHandler),a(document).on(b.visibilityChange,a.proxy(b.visibility,b)),b.options.accessibility===!0&&b.$list.on("keydown.slick",b.keyHandler),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().on("click.slick",b.selectHandler),a(window).on("orientationchange.slick.slick-"+b.instanceUid,a.proxy(b.orientationChange,b)),a(window).on("resize.slick.slick-"+b.instanceUid,a.proxy(b.resize,b)),a("[draggable!=true]",b.$slideTrack).on("dragstart",b.preventDefault),a(window).on("load.slick.slick-"+b.instanceUid,b.setPosition),a(document).on("ready.slick.slick-"+b.instanceUid,b.setPosition)},b.prototype.initUI=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.show(),a.$nextArrow.show()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.show()},b.prototype.keyHandler=function(a){var b=this;a.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===a.keyCode&&b.options.accessibility===!0?b.changeSlide({data:{message:b.options.rtl===!0?"next":"previous"}}):39===a.keyCode&&b.options.accessibility===!0&&b.changeSlide({data:{message:b.options.rtl===!0?"previous":"next"}}))},b.prototype.lazyLoad=function(){function g(c){a("img[data-lazy]",c).each(function(){var c=a(this),d=a(this).attr("data-lazy"),e=document.createElement("img");e.onload=function(){c.animate({opacity:0},100,function(){c.attr("src",d).animate({opacity:1},200,function(){c.removeAttr("data-lazy").removeClass("slick-loading")}),b.$slider.trigger("lazyLoaded",[b,c,d])})},e.onerror=function(){c.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),b.$slider.trigger("lazyLoadError",[b,c,d])},e.src=d})}var c,d,e,f,b=this;b.options.centerMode===!0?b.options.infinite===!0?(e=b.currentSlide+(b.options.slidesToShow/2+1),f=e+b.options.slidesToShow+2):(e=Math.max(0,b.currentSlide-(b.options.slidesToShow/2+1)),f=2+(b.options.slidesToShow/2+1)+b.currentSlide):(e=b.options.infinite?b.options.slidesToShow+b.currentSlide:b.currentSlide,f=Math.ceil(e+b.options.slidesToShow),b.options.fade===!0&&(e>0&&e--,f<=b.slideCount&&f++)),c=b.$slider.find(".slick-slide").slice(e,f),g(c),b.slideCount<=b.options.slidesToShow?(d=b.$slider.find(".slick-slide"),g(d)):b.currentSlide>=b.slideCount-b.options.slidesToShow?(d=b.$slider.find(".slick-cloned").slice(0,b.options.slidesToShow),g(d)):0===b.currentSlide&&(d=b.$slider.find(".slick-cloned").slice(-1*b.options.slidesToShow),g(d))},b.prototype.loadSlider=function(){var a=this;a.setPosition(),a.$slideTrack.css({opacity:1}),a.$slider.removeClass("slick-loading"),a.initUI(),"progressive"===a.options.lazyLoad&&a.progressiveLazyLoad()},b.prototype.next=b.prototype.slickNext=function(){var a=this;a.changeSlide({data:{message:"next"}})},b.prototype.orientationChange=function(){var a=this;a.checkResponsive(),a.setPosition()},b.prototype.pause=b.prototype.slickPause=function(){var a=this;a.autoPlayClear(),a.paused=!0},b.prototype.play=b.prototype.slickPlay=function(){var a=this;a.autoPlay(),a.options.autoplay=!0,a.paused=!1,a.focussed=!1,a.interrupted=!1},b.prototype.postSlide=function(a){var b=this;b.unslicked||(b.$slider.trigger("afterChange",[b,a]),b.animating=!1,b.setPosition(),b.swipeLeft=null,b.options.autoplay&&b.autoPlay(),b.options.accessibility===!0&&b.initADA())},b.prototype.prev=b.prototype.slickPrev=function(){var a=this;a.changeSlide({data:{message:"previous"}})},b.prototype.preventDefault=function(a){a.preventDefault()},b.prototype.progressiveLazyLoad=function(b){b=b||1;var e,f,g,c=this,d=a("img[data-lazy]",c.$slider);d.length?(e=d.first(),f=e.attr("data-lazy"),g=document.createElement("img"),g.onload=function(){e.attr("src",f).removeAttr("data-lazy").removeClass("slick-loading"),c.options.adaptiveHeight===!0&&c.setPosition(),c.$slider.trigger("lazyLoaded",[c,e,f]),c.progressiveLazyLoad()},g.onerror=function(){3>b?setTimeout(function(){c.progressiveLazyLoad(b+1)},500):(e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),c.$slider.trigger("lazyLoadError",[c,e,f]),c.progressiveLazyLoad())},g.src=f):c.$slider.trigger("allImagesLoaded",[c])},b.prototype.refresh=function(b){var d,e,c=this;e=c.slideCount-c.options.slidesToShow,!c.options.infinite&&c.currentSlide>e&&(c.currentSlide=e),c.slideCount<=c.options.slidesToShow&&(c.currentSlide=0),d=c.currentSlide,c.destroy(!0),a.extend(c,c.initials,{currentSlide:d}),c.init(),b||c.changeSlide({data:{message:"index",index:d}},!1)},b.prototype.registerBreakpoints=function(){var c,d,e,b=this,f=b.options.responsive||null;if("array"===a.type(f)&&f.length){b.respondTo=b.options.respondTo||"window";for(c in f)if(e=b.breakpoints.length-1,d=f[c].breakpoint,f.hasOwnProperty(c)){for(;e>=0;)b.breakpoints[e]&&b.breakpoints[e]===d&&b.breakpoints.splice(e,1),e--;b.breakpoints.push(d),b.breakpointSettings[d]=f[c].settings}b.breakpoints.sort(function(a,c){return b.options.mobileFirst?a-c:c-a})}},b.prototype.reinit=function(){var b=this;b.$slides=b.$slideTrack.children(b.options.slide).addClass("slick-slide"),b.slideCount=b.$slides.length,b.currentSlide>=b.slideCount&&0!==b.currentSlide&&(b.currentSlide=b.currentSlide-b.options.slidesToScroll),b.slideCount<=b.options.slidesToShow&&(b.currentSlide=0),b.registerBreakpoints(),b.setProps(),b.setupInfinite(),b.buildArrows(),b.updateArrows(),b.initArrowEvents(),b.buildDots(),b.updateDots(),b.initDotEvents(),b.cleanUpSlideEvents(),b.initSlideEvents(),b.checkResponsive(!1,!0),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().on("click.slick",b.selectHandler),b.setSlideClasses("number"==typeof b.currentSlide?b.currentSlide:0),b.setPosition(),b.focusHandler(),b.paused=!b.options.autoplay,b.autoPlay(),b.$slider.trigger("reInit",[b])},b.prototype.resize=function(){var b=this;a(window).width()!==b.windowWidth&&(clearTimeout(b.windowDelay),b.windowDelay=window.setTimeout(function(){b.windowWidth=a(window).width(),b.checkResponsive(),b.unslicked||b.setPosition()},50))},b.prototype.removeSlide=b.prototype.slickRemove=function(a,b,c){var d=this;return"boolean"==typeof a?(b=a,a=b===!0?0:d.slideCount-1):a=b===!0?--a:a,d.slideCount<1||0>a||a>d.slideCount-1?!1:(d.unload(),c===!0?d.$slideTrack.children().remove():d.$slideTrack.children(this.options.slide).eq(a).remove(),d.$slides=d.$slideTrack.children(this.options.slide),d.$slideTrack.children(this.options.slide).detach(),d.$slideTrack.append(d.$slides),d.$slidesCache=d.$slides,void d.reinit())},b.prototype.setCSS=function(a){var d,e,b=this,c={};b.options.rtl===!0&&(a=-a),d="left"==b.positionProp?Math.ceil(a)+"px":"0px",e="top"==b.positionProp?Math.ceil(a)+"px":"0px",c[b.positionProp]=a,b.transformsEnabled===!1?b.$slideTrack.css(c):(c={},b.cssTransitions===!1?(c[b.animType]="translate("+d+", "+e+")",b.$slideTrack.css(c)):(c[b.animType]="translate3d("+d+", "+e+", 0px)",b.$slideTrack.css(c)))},b.prototype.setDimensions=function(){var a=this;a.options.vertical===!1?a.options.centerMode===!0&&a.$list.css({padding:"0px "+a.options.centerPadding}):(a.$list.height(a.$slides.first().outerHeight(!0)*a.options.slidesToShow),a.options.centerMode===!0&&a.$list.css({padding:a.options.centerPadding+" 0px"})),a.listWidth=a.$list.width(),a.listHeight=a.$list.height(),a.options.vertical===!1&&a.options.variableWidth===!1?(a.slideWidth=Math.ceil(a.listWidth/a.options.slidesToShow),a.$slideTrack.width(Math.ceil(a.slideWidth*a.$slideTrack.children(".slick-slide").length))):a.options.variableWidth===!0?a.$slideTrack.width(5e3*a.slideCount):(a.slideWidth=Math.ceil(a.listWidth),a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0)*a.$slideTrack.children(".slick-slide").length)));var b=a.$slides.first().outerWidth(!0)-a.$slides.first().width();a.options.variableWidth===!1&&a.$slideTrack.children(".slick-slide").width(a.slideWidth-b)},b.prototype.setFade=function(){var c,b=this;b.$slides.each(function(d,e){c=b.slideWidth*d*-1,b.options.rtl===!0?a(e).css({position:"relative",right:c,top:0,zIndex:b.options.zIndex-2,opacity:0}):a(e).css({position:"relative",left:c,top:0,zIndex:b.options.zIndex-2,opacity:0})}),b.$slides.eq(b.currentSlide).css({zIndex:b.options.zIndex-1,opacity:1})},b.prototype.setHeight=function(){var a=this;if(1===a.options.slidesToShow&&a.options.adaptiveHeight===!0&&a.options.vertical===!1){var b=a.$slides.eq(a.currentSlide).outerHeight(!0);a.$list.css("height",b)}},b.prototype.setOption=b.prototype.slickSetOption=function(){var c,d,e,f,h,b=this,g=!1;if("object"===a.type(arguments[0])?(e=arguments[0],g=arguments[1],h="multiple"):"string"===a.type(arguments[0])&&(e=arguments[0],f=arguments[1],g=arguments[2],"responsive"===arguments[0]&&"array"===a.type(arguments[1])?h="responsive":"undefined"!=typeof arguments[1]&&(h="single")),"single"===h)b.options[e]=f;else if("multiple"===h)a.each(e,function(a,c){b.options[a]=c});else if("responsive"===h)for(d in f)if("array"!==a.type(b.options.responsive))b.options.responsive=[f[d]];else{for(c=b.options.responsive.length-1;c>=0;)b.options.responsive[c].breakpoint===f[d].breakpoint&&b.options.responsive.splice(c,1),c--;b.options.responsive.push(f[d])}g&&(b.unload(),b.reinit())},b.prototype.setPosition=function(){var a=this;a.setDimensions(),a.setHeight(),a.options.fade===!1?a.setCSS(a.getLeft(a.currentSlide)):a.setFade(),a.$slider.trigger("setPosition",[a])},b.prototype.setProps=function(){var a=this,b=document.body.style;a.positionProp=a.options.vertical===!0?"top":"left","top"===a.positionProp?a.$slider.addClass("slick-vertical"):a.$slider.removeClass("slick-vertical"),(void 0!==b.WebkitTransition||void 0!==b.MozTransition||void 0!==b.msTransition)&&a.options.useCSS===!0&&(a.cssTransitions=!0),a.options.fade&&("number"==typeof a.options.zIndex?a.options.zIndex<3&&(a.options.zIndex=3):a.options.zIndex=a.defaults.zIndex),void 0!==b.OTransform&&(a.animType="OTransform",a.transformType="-o-transform",a.transitionType="OTransition",void 0===b.perspectiveProperty&&void 0===b.webkitPerspective&&(a.animType=!1)),void 0!==b.MozTransform&&(a.animType="MozTransform",a.transformType="-moz-transform",a.transitionType="MozTransition",void 0===b.perspectiveProperty&&void 0===b.MozPerspective&&(a.animType=!1)),void 0!==b.webkitTransform&&(a.animType="webkitTransform",a.transformType="-webkit-transform",a.transitionType="webkitTransition",void 0===b.perspectiveProperty&&void 0===b.webkitPerspective&&(a.animType=!1)),void 0!==b.msTransform&&(a.animType="msTransform",a.transformType="-ms-transform",a.transitionType="msTransition",void 0===b.msTransform&&(a.animType=!1)),void 0!==b.transform&&a.animType!==!1&&(a.animType="transform",a.transformType="transform",a.transitionType="transition"),a.transformsEnabled=a.options.useTransform&&null!==a.animType&&a.animType!==!1},b.prototype.setSlideClasses=function(a){var c,d,e,f,b=this;d=b.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),b.$slides.eq(a).addClass("slick-current"),b.options.centerMode===!0?(c=Math.floor(b.options.slidesToShow/2),b.options.infinite===!0&&(a>=c&&a<=b.slideCount-1-c?b.$slides.slice(a-c,a+c+1).addClass("slick-active").attr("aria-hidden","false"):(e=b.options.slidesToShow+a,
  d.slice(e-c+1,e+c+2).addClass("slick-active").attr("aria-hidden","false")),0===a?d.eq(d.length-1-b.options.slidesToShow).addClass("slick-center"):a===b.slideCount-1&&d.eq(b.options.slidesToShow).addClass("slick-center")),b.$slides.eq(a).addClass("slick-center")):a>=0&&a<=b.slideCount-b.options.slidesToShow?b.$slides.slice(a,a+b.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):d.length<=b.options.slidesToShow?d.addClass("slick-active").attr("aria-hidden","false"):(f=b.slideCount%b.options.slidesToShow,e=b.options.infinite===!0?b.options.slidesToShow+a:a,b.options.slidesToShow==b.options.slidesToScroll&&b.slideCount-a<b.options.slidesToShow?d.slice(e-(b.options.slidesToShow-f),e+f).addClass("slick-active").attr("aria-hidden","false"):d.slice(e,e+b.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false")),"ondemand"===b.options.lazyLoad&&b.lazyLoad()},b.prototype.setupInfinite=function(){var c,d,e,b=this;if(b.options.fade===!0&&(b.options.centerMode=!1),b.options.infinite===!0&&b.options.fade===!1&&(d=null,b.slideCount>b.options.slidesToShow)){for(e=b.options.centerMode===!0?b.options.slidesToShow+1:b.options.slidesToShow,c=b.slideCount;c>b.slideCount-e;c-=1)d=c-1,a(b.$slides[d]).clone(!0).attr("id","").attr("data-slick-index",d-b.slideCount).prependTo(b.$slideTrack).addClass("slick-cloned");for(c=0;e>c;c+=1)d=c,a(b.$slides[d]).clone(!0).attr("id","").attr("data-slick-index",d+b.slideCount).appendTo(b.$slideTrack).addClass("slick-cloned");b.$slideTrack.find(".slick-cloned").find("[id]").each(function(){a(this).attr("id","")})}},b.prototype.interrupt=function(a){var b=this;a||b.autoPlay(),b.interrupted=a},b.prototype.selectHandler=function(b){var c=this,d=a(b.target).is(".slick-slide")?a(b.target):a(b.target).parents(".slick-slide"),e=parseInt(d.attr("data-slick-index"));return e||(e=0),c.slideCount<=c.options.slidesToShow?(c.setSlideClasses(e),void c.asNavFor(e)):void c.slideHandler(e)},b.prototype.slideHandler=function(a,b,c){var d,e,f,g,j,h=null,i=this;return b=b||!1,i.animating===!0&&i.options.waitForAnimate===!0||i.options.fade===!0&&i.currentSlide===a||i.slideCount<=i.options.slidesToShow?void 0:(b===!1&&i.asNavFor(a),d=a,h=i.getLeft(d),g=i.getLeft(i.currentSlide),i.currentLeft=null===i.swipeLeft?g:i.swipeLeft,i.options.infinite===!1&&i.options.centerMode===!1&&(0>a||a>i.getDotCount()*i.options.slidesToScroll)?void(i.options.fade===!1&&(d=i.currentSlide,c!==!0?i.animateSlide(g,function(){i.postSlide(d)}):i.postSlide(d))):i.options.infinite===!1&&i.options.centerMode===!0&&(0>a||a>i.slideCount-i.options.slidesToScroll)?void(i.options.fade===!1&&(d=i.currentSlide,c!==!0?i.animateSlide(g,function(){i.postSlide(d)}):i.postSlide(d))):(i.options.autoplay&&clearInterval(i.autoPlayTimer),e=0>d?i.slideCount%i.options.slidesToScroll!==0?i.slideCount-i.slideCount%i.options.slidesToScroll:i.slideCount+d:d>=i.slideCount?i.slideCount%i.options.slidesToScroll!==0?0:d-i.slideCount:d,i.animating=!0,i.$slider.trigger("beforeChange",[i,i.currentSlide,e]),f=i.currentSlide,i.currentSlide=e,i.setSlideClasses(i.currentSlide),i.options.asNavFor&&(j=i.getNavTarget(),j=j.slick("getSlick"),j.slideCount<=j.options.slidesToShow&&j.setSlideClasses(i.currentSlide)),i.updateDots(),i.updateArrows(),i.options.fade===!0?(c!==!0?(i.fadeSlideOut(f),i.fadeSlide(e,function(){i.postSlide(e)})):i.postSlide(e),void i.animateHeight()):void(c!==!0?i.animateSlide(h,function(){i.postSlide(e)}):i.postSlide(e))))},b.prototype.startLoad=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.hide(),a.$nextArrow.hide()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.hide(),a.$slider.addClass("slick-loading")},b.prototype.swipeDirection=function(){var a,b,c,d,e=this;return a=e.touchObject.startX-e.touchObject.curX,b=e.touchObject.startY-e.touchObject.curY,c=Math.atan2(b,a),d=Math.round(180*c/Math.PI),0>d&&(d=360-Math.abs(d)),45>=d&&d>=0?e.options.rtl===!1?"left":"right":360>=d&&d>=315?e.options.rtl===!1?"left":"right":d>=135&&225>=d?e.options.rtl===!1?"right":"left":e.options.verticalSwiping===!0?d>=35&&135>=d?"down":"up":"vertical"},b.prototype.swipeEnd=function(a){var c,d,b=this;if(b.dragging=!1,b.interrupted=!1,b.shouldClick=b.touchObject.swipeLength>10?!1:!0,void 0===b.touchObject.curX)return!1;if(b.touchObject.edgeHit===!0&&b.$slider.trigger("edge",[b,b.swipeDirection()]),b.touchObject.swipeLength>=b.touchObject.minSwipe){switch(d=b.swipeDirection()){case"left":case"down":c=b.options.swipeToSlide?b.checkNavigable(b.currentSlide+b.getSlideCount()):b.currentSlide+b.getSlideCount(),b.currentDirection=0;break;case"right":case"up":c=b.options.swipeToSlide?b.checkNavigable(b.currentSlide-b.getSlideCount()):b.currentSlide-b.getSlideCount(),b.currentDirection=1}"vertical"!=d&&(b.slideHandler(c),b.touchObject={},b.$slider.trigger("swipe",[b,d]))}else b.touchObject.startX!==b.touchObject.curX&&(b.slideHandler(b.currentSlide),b.touchObject={})},b.prototype.swipeHandler=function(a){var b=this;if(!(b.options.swipe===!1||"ontouchend"in document&&b.options.swipe===!1||b.options.draggable===!1&&-1!==a.type.indexOf("mouse")))switch(b.touchObject.fingerCount=a.originalEvent&&void 0!==a.originalEvent.touches?a.originalEvent.touches.length:1,b.touchObject.minSwipe=b.listWidth/b.options.touchThreshold,b.options.verticalSwiping===!0&&(b.touchObject.minSwipe=b.listHeight/b.options.touchThreshold),a.data.action){case"start":b.swipeStart(a);break;case"move":b.swipeMove(a);break;case"end":b.swipeEnd(a)}},b.prototype.swipeMove=function(a){var d,e,f,g,h,b=this;return h=void 0!==a.originalEvent?a.originalEvent.touches:null,!b.dragging||h&&1!==h.length?!1:(d=b.getLeft(b.currentSlide),b.touchObject.curX=void 0!==h?h[0].pageX:a.clientX,b.touchObject.curY=void 0!==h?h[0].pageY:a.clientY,b.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(b.touchObject.curX-b.touchObject.startX,2))),b.options.verticalSwiping===!0&&(b.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(b.touchObject.curY-b.touchObject.startY,2)))),e=b.swipeDirection(),"vertical"!==e?(void 0!==a.originalEvent&&b.touchObject.swipeLength>4&&a.preventDefault(),g=(b.options.rtl===!1?1:-1)*(b.touchObject.curX>b.touchObject.startX?1:-1),b.options.verticalSwiping===!0&&(g=b.touchObject.curY>b.touchObject.startY?1:-1),f=b.touchObject.swipeLength,b.touchObject.edgeHit=!1,b.options.infinite===!1&&(0===b.currentSlide&&"right"===e||b.currentSlide>=b.getDotCount()&&"left"===e)&&(f=b.touchObject.swipeLength*b.options.edgeFriction,b.touchObject.edgeHit=!0),b.options.vertical===!1?b.swipeLeft=d+f*g:b.swipeLeft=d+f*(b.$list.height()/b.listWidth)*g,b.options.verticalSwiping===!0&&(b.swipeLeft=d+f*g),b.options.fade===!0||b.options.touchMove===!1?!1:b.animating===!0?(b.swipeLeft=null,!1):void b.setCSS(b.swipeLeft)):void 0)},b.prototype.swipeStart=function(a){var c,b=this;return b.interrupted=!0,1!==b.touchObject.fingerCount||b.slideCount<=b.options.slidesToShow?(b.touchObject={},!1):(void 0!==a.originalEvent&&void 0!==a.originalEvent.touches&&(c=a.originalEvent.touches[0]),b.touchObject.startX=b.touchObject.curX=void 0!==c?c.pageX:a.clientX,b.touchObject.startY=b.touchObject.curY=void 0!==c?c.pageY:a.clientY,void(b.dragging=!0))},b.prototype.unfilterSlides=b.prototype.slickUnfilter=function(){var a=this;null!==a.$slidesCache&&(a.unload(),a.$slideTrack.children(this.options.slide).detach(),a.$slidesCache.appendTo(a.$slideTrack),a.reinit())},b.prototype.unload=function(){var b=this;a(".slick-cloned",b.$slider).remove(),b.$dots&&b.$dots.remove(),b.$prevArrow&&b.htmlExpr.test(b.options.prevArrow)&&b.$prevArrow.remove(),b.$nextArrow&&b.htmlExpr.test(b.options.nextArrow)&&b.$nextArrow.remove(),b.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},b.prototype.unslick=function(a){var b=this;b.$slider.trigger("unslick",[b,a]),b.destroy()},b.prototype.updateArrows=function(){var b,a=this;b=Math.floor(a.options.slidesToShow/2),a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&!a.options.infinite&&(a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===a.currentSlide?(a.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):a.currentSlide>=a.slideCount-a.options.slidesToShow&&a.options.centerMode===!1?(a.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):a.currentSlide>=a.slideCount-1&&a.options.centerMode===!0&&(a.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},b.prototype.updateDots=function(){var a=this;null!==a.$dots&&(a.$dots.find("li").removeClass("slick-active").attr("aria-hidden","true"),a.$dots.find("li").eq(Math.floor(a.currentSlide/a.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden","false"))},b.prototype.visibility=function(){var a=this;a.options.autoplay&&(document[a.hidden]?a.interrupted=!0:a.interrupted=!1)},a.fn.slick=function(){var f,g,a=this,c=arguments[0],d=Array.prototype.slice.call(arguments,1),e=a.length;for(f=0;e>f;f++)if("object"==typeof c||"undefined"==typeof c?a[f].slick=new b(a[f],c):g=a[f].slick[c].apply(a[f].slick,d),"undefined"!=typeof g)return g;return a}});

;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jcf = factory(jQuery);
  }
}(this, function($) {
  'use strict';

  // define version
  var version = '1.1.3';

  // private variables
  var customInstances = [];

  // default global options
  var commonOptions = {
    optionsKey: 'jcf',
    dataKey: 'jcf-instance',
    rtlClass: 'jcf-rtl',
    focusClass: 'jcf-focus',
    pressedClass: 'jcf-pressed',
    disabledClass: 'jcf-disabled',
    hiddenClass: 'jcf-hidden',
    resetAppearanceClass: 'jcf-reset-appearance',
    unselectableClass: 'jcf-unselectable'
  };

  // detect device type
  var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
  isWinPhoneDevice = /Windows Phone/.test(navigator.userAgent);
  commonOptions.isMobileDevice = !!(isTouchDevice || isWinPhoneDevice);
  
  var isIOS = /(iPad|iPhone).*OS ([0-9_]*) .*/.exec(navigator.userAgent);
  if(isIOS) isIOS = parseFloat(isIOS[2].replace(/_/g, '.'));
  commonOptions.ios = isIOS;

  // create global stylesheet if custom forms are used
  var createStyleSheet = function() {
    var styleTag = $('<style>').appendTo('head'),
    styleSheet = styleTag.prop('sheet') || styleTag.prop('styleSheet');

    // crossbrowser style handling
    var addCSSRule = function(selector, rules, index) {
      if (styleSheet.insertRule) {
        styleSheet.insertRule(selector + '{' + rules + '}', index);
      } else {
        styleSheet.addRule(selector, rules, index);
      }
    };

    // add special rules
    addCSSRule('.' + commonOptions.hiddenClass, 'position:absolute !important;left:-9999px !important;height:1px !important;width:1px !important;margin:0 !important;border-width:0 !important;-webkit-appearance:none;-moz-appearance:none;appearance:none');
    addCSSRule('.' + commonOptions.rtlClass + ' .' + commonOptions.hiddenClass, 'right:-9999px !important; left: auto !important');
    addCSSRule('.' + commonOptions.unselectableClass, '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0);');
    addCSSRule('.' + commonOptions.resetAppearanceClass, 'background: none; border: none; -webkit-appearance: none; appearance: none; opacity: 0; filter: alpha(opacity=0);');

    // detect rtl pages
    var html = $('html'), body = $('body');
    if (html.css('direction') === 'rtl' || body.css('direction') === 'rtl') {
      html.addClass(commonOptions.rtlClass);
    }

    // handle form reset event
    html.on('reset', function() {
      setTimeout(function() {
        api.refreshAll();
      }, 0);
    });

    // mark stylesheet as created
    commonOptions.styleSheetCreated = true;
  };

  // simplified pointer events handler
  (function() {
    var pointerEventsSupported = navigator.pointerEnabled || navigator.msPointerEnabled,
    touchEventsSupported = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
    eventList, eventMap = {}, eventPrefix = 'jcf-';

    // detect events to attach
    if (pointerEventsSupported) {
      eventList = {
        pointerover: navigator.pointerEnabled ? 'pointerover' : 'MSPointerOver',
        pointerdown: navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown',
        pointermove: navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove',
        pointerup: navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp'
      };
    } else {
      eventList = {
        pointerover: 'mouseover',
        pointerdown: 'mousedown' + (touchEventsSupported ? ' touchstart' : ''),
        pointermove: 'mousemove' + (touchEventsSupported ? ' touchmove' : ''),
        pointerup: 'mouseup' + (touchEventsSupported ? ' touchend' : '')
      };
    }

    // create event map
    $.each(eventList, function(targetEventName, fakeEventList) {
      $.each(fakeEventList.split(' '), function(index, fakeEventName) {
        eventMap[fakeEventName] = targetEventName;
      });
    });

    // jQuery event hooks
    $.each(eventList, function(eventName, eventHandlers) {
      eventHandlers = eventHandlers.split(' ');
      $.event.special[eventPrefix + eventName] = {
        setup: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, commonOptions.isMobileDevice ? {passive: false} : false);
            else self['on' + fallbackEvent] = fixEvent;
          });
        },
        teardown: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, commonOptions.isMobileDevice ? {passive: false} : false);
            else self['on' + fallbackEvent] = null;
          });
        }
      };
    });

    // check that mouse event are not simulated by mobile browsers
    var lastTouch = null;
    var mouseEventSimulated = function(e) {
      var dx = Math.abs(e.pageX - lastTouch.x),
      dy = Math.abs(e.pageY - lastTouch.y),
      rangeDistance = 25;

      if (dx <= rangeDistance && dy <= rangeDistance) {
        return true;
      }
    };

    // normalize event
    var fixEvent = function(e) {
      var origEvent = e || window.event,
      touchEventData = null,
      targetEventName = eventMap[origEvent.type];

      e = $.event.fix(origEvent);
      e.type = eventPrefix + targetEventName;

      if (origEvent.pointerType) {
        switch (origEvent.pointerType) {
          case 2: e.pointerType = 'touch'; break;
          case 3: e.pointerType = 'pen'; break;
          case 4: e.pointerType = 'mouse'; break;
          default: e.pointerType = origEvent.pointerType;
        }
      } else {
        e.pointerType = origEvent.type.substr(0, 5); // "mouse" or "touch" word length
      }

      if (!e.pageX && !e.pageY) {
        touchEventData = origEvent.changedTouches ? origEvent.changedTouches[0] : origEvent;
        e.pageX = touchEventData.pageX;
        e.pageY = touchEventData.pageY;
      }

      if (origEvent.type === 'touchend') {
        lastTouch = { x: e.pageX, y: e.pageY };
      }
      if (e.pointerType === 'mouse' && lastTouch && mouseEventSimulated(e)) {
        return;
      } else {
        return ($.event.dispatch || $.event.handle).call(this, e);
      }
    };
  }());

  // custom mousewheel/trackpad handler
  (function() {
    var wheelEvents = ('onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel DOMMouseScroll').split(' '),
    shimEventName = 'jcf-mousewheel';

    $.event.special[shimEventName] = {
      setup: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = fixEvent;
        });
      },
      teardown: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = null;
        });
      }
    };

    var fixEvent = function(e) {
      var origEvent = e || window.event;
      e = $.event.fix(origEvent);
      e.type = shimEventName;

      // old wheel events handler
      if ('detail'      in origEvent) { e.deltaY = -origEvent.detail;      }
      if ('wheelDelta'  in origEvent) { e.deltaY = -origEvent.wheelDelta;  }
      if ('wheelDeltaY' in origEvent) { e.deltaY = -origEvent.wheelDeltaY; }
      if ('wheelDeltaX' in origEvent) { e.deltaX = -origEvent.wheelDeltaX; }

      // modern wheel event handler
      if ('deltaY' in origEvent) {
        e.deltaY = origEvent.deltaY;
      }
      if ('deltaX' in origEvent) {
        e.deltaX = origEvent.deltaX;
      }

      // handle deltaMode for mouse wheel
      e.delta = e.deltaY || e.deltaX;
      if (origEvent.deltaMode === 1) {
        var lineHeight = 16;
        e.delta *= lineHeight;
        e.deltaY *= lineHeight;
        e.deltaX *= lineHeight;
      }

      return ($.event.dispatch || $.event.handle).call(this, e);
    };
  }());

  // extra module methods
  var moduleMixin = {
    // provide function for firing native events
    fireNativeEvent: function(elements, eventName) {
      $(elements).each(function() {
        var element = this, eventObject;
        if (element.dispatchEvent) {
          eventObject = document.createEvent('HTMLEvents');
          eventObject.initEvent(eventName, true, true);
          element.dispatchEvent(eventObject);
        } else if (document.createEventObject) {
          eventObject = document.createEventObject();
          eventObject.target = element;
          element.fireEvent('on' + eventName, eventObject);
        }
      });
    },
    // bind event handlers for module instance (functions beggining with "on")
    bindHandlers: function() {
      var self = this;
      $.each(self, function(propName, propValue) {
        if (propName.indexOf('on') === 0 && $.isFunction(propValue)) {
          // dont use $.proxy here because it doesn't create unique handler
          self[propName] = function() {
            return propValue.apply(self, arguments);
          };
        }
      });
    }
  };

  // public API
  var api = {
    version: version,
    modules: {},
    getOptions: function() {
      return $.extend({}, commonOptions);
    },
    setOptions: function(moduleName, moduleOptions) {
      if (arguments.length > 1) {
        // set module options
        if (this.modules[moduleName]) {
          $.extend(this.modules[moduleName].prototype.options, moduleOptions);
        }
      } else {
        // set common options
        $.extend(commonOptions, moduleName);
      }
    },
    addModule: function(proto) {
      // add module to list
      var Module = function(options) {
        // save instance to collection
        if (!options.element.data(commonOptions.dataKey)) {
          options.element.data(commonOptions.dataKey, this);
        }
        customInstances.push(this);

        // save options
        this.options = $.extend({}, commonOptions, this.options, getInlineOptions(options.element), options);

        // bind event handlers to instance
        this.bindHandlers();

        // call constructor
        this.init.apply(this, arguments);
      };

      // parse options from HTML attribute
      var getInlineOptions = function(element) {
        var dataOptions = element.data(commonOptions.optionsKey),
        attrOptions = element.attr(commonOptions.optionsKey);

        if (dataOptions) {
          return dataOptions;
        } else if (attrOptions) {
          try {
            return $.parseJSON(attrOptions);
          } catch (e) {
            // ignore invalid attributes
          }
        }
      };

      // set proto as prototype for new module
      Module.prototype = proto;

      // add mixin methods to module proto
      $.extend(proto, moduleMixin);
      if (proto.plugins) {
        $.each(proto.plugins, function(pluginName, plugin) {
          $.extend(plugin.prototype, moduleMixin);
        });
      }

      // override destroy method
      var originalDestroy = Module.prototype.destroy;
      Module.prototype.destroy = function() {
        this.options.element.removeData(this.options.dataKey);

        for (var i = customInstances.length - 1; i >= 0; i--) {
          if (customInstances[i] === this) {
            customInstances.splice(i, 1);
            break;
          }
        }

        if (originalDestroy) {
          originalDestroy.apply(this, arguments);
        }
      };

      // save module to list
      this.modules[proto.name] = Module;
    },
    getInstance: function(element) {
      return $(element).data(commonOptions.dataKey);
    },
    replace: function(elements, moduleName, customOptions) {
      var self = this,
      instance;

      if (!commonOptions.styleSheetCreated) {
        createStyleSheet();
      }

      $(elements).each(function() {
        var moduleOptions,
        element = $(this);

        instance = element.data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        } else {
          if (!moduleName) {
            $.each(self.modules, function(currentModuleName, module) {
              if (module.prototype.matchElement.call(module.prototype, element)) {
                moduleName = currentModuleName;
                return false;
              }
            });
          }
          if (moduleName) {
            moduleOptions = $.extend({ element: element }, customOptions);
            instance = new self.modules[moduleName](moduleOptions);
          }
        }
      });
      return instance;
    },
    refresh: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        }
      });
    },
    destroy: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.destroy();
        }
      });
    },
    replaceAll: function(context) {
      var self = this;
      $.each(this.modules, function(moduleName, module) {
        $(module.prototype.selector, context).each(function() {
          if (this.className.indexOf('jcf-ignore') < 0) {
            self.replace(this, moduleName);
          }
        });
      });
    },
    refreshAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function() {
            var instance = $(this).data(commonOptions.dataKey);
            if (instance) {
              instance.refresh();
            }
          });
        });
      } else {
        for (var i = customInstances.length - 1; i >= 0; i--) {
          customInstances[i].refresh();
        }
      }
    },
    destroyAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function(index, element) {
            var instance = $(element).data(commonOptions.dataKey);
            if (instance) {
              instance.destroy();
            }
          });
        });
      } else {
        while (customInstances.length) {
          customInstances[0].destroy();
        }
      }
    }
  };

  // always export API to the global window object
  window.jcf = api;

  return api;
})); 



;(function($) {
  function MobileNav(options) {
    this.options = $.extend({
      container: null,
      hideOnClickOutside: false,
      menuActiveClass: 'nav-active',
      menuOpener: '.nav-opener',
      menuDrop: '.nav-drop',
      toggleEvent: 'click',
      outsideClickEvent: 'click touchstart pointerdown MSPointerDown'
    }, options);
    this.initStructure();
    this.attachEvents();
  }
  MobileNav.prototype = {
    initStructure: function() {
      this.page = $('html');
      this.container = $(this.options.container);
      this.opener = this.container.find(this.options.menuOpener);
      this.drop = this.container.find(this.options.menuDrop);
    },
    attachEvents: function() {
      var self = this;

      if(activateResizeHandler) {
        activateResizeHandler();
        activateResizeHandler = null;
      }

      this.outsideClickHandler = function(e) {
        if(self.isOpened()) {
          var target = $(e.target);
          if(!target.closest(self.opener).length && !target.closest(self.drop).length) {
            self.hide();
          }
        }
      };

      this.openerClickHandler = function(e) {
        e.preventDefault();
        self.toggle();
      };

      this.opener.on(this.options.toggleEvent, this.openerClickHandler);
    },
    isOpened: function() {
      return this.container.hasClass(this.options.menuActiveClass);
    },
    show: function() {
      this.container.addClass(this.options.menuActiveClass);
      if(this.options.hideOnClickOutside) {
        this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);
      }
    },
    hide: function() {
      this.container.removeClass(this.options.menuActiveClass);
      if(this.options.hideOnClickOutside) {
        this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
      }
    },
    toggle: function() {
      if(this.isOpened()) {
        this.hide();
      } else {
        this.show();
      }
    },
    destroy: function() {
      this.container.removeClass(this.options.menuActiveClass);
      this.opener.off(this.options.toggleEvent, this.clickHandler);
      this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
    }
  };

  var activateResizeHandler = function() {
    var win = $(window),
      doc = $('html'),
      resizeClass = 'resize-active',
      flag, timer;
    var removeClassHandler = function() {
      flag = false;
      doc.removeClass(resizeClass);
    };
    var resizeHandler = function() {
      if(!flag) {
        flag = true;
        doc.addClass(resizeClass);
      }
      clearTimeout(timer);
      timer = setTimeout(removeClassHandler, 500);
    };
    win.on('resize orientationchange', resizeHandler);
  };

  $.fn.mobileNav = function(options) {
    return this.each(function() {
      var params = $.extend({}, options, {container: this}),
        instance = new MobileNav(params);
      $.data(this, 'MobileNav', instance);
    });
  };
}(jQuery));


/*!
 * JavaScript Custom Forms
 *
 
 *
 * Version: 1.1.3
 */
;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jcf = factory(jQuery);
  }
}(this, function($) {
  'use strict';

  // define version
  var version = '1.1.3';

  // private variables
  var customInstances = [];

  // default global options
  var commonOptions = {
    optionsKey: 'jcf',
    dataKey: 'jcf-instance',
    rtlClass: 'jcf-rtl',
    focusClass: 'jcf-focus',
    pressedClass: 'jcf-pressed',
    disabledClass: 'jcf-disabled',
    hiddenClass: 'jcf-hidden',
    resetAppearanceClass: 'jcf-reset-appearance',
    unselectableClass: 'jcf-unselectable'
  };

  // detect device type
  var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
    isWinPhoneDevice = /Windows Phone/.test(navigator.userAgent);
  commonOptions.isMobileDevice = !!(isTouchDevice || isWinPhoneDevice);
  
  var isIOS = /(iPad|iPhone).*OS ([0-9_]*) .*/.exec(navigator.userAgent);
  if(isIOS) isIOS = parseFloat(isIOS[2].replace(/_/g, '.'));
  commonOptions.ios = isIOS;

  // create global stylesheet if custom forms are used
  var createStyleSheet = function() {
    var styleTag = $('<style>').appendTo('head'),
      styleSheet = styleTag.prop('sheet') || styleTag.prop('styleSheet');

    // crossbrowser style handling
    var addCSSRule = function(selector, rules, index) {
      if (styleSheet.insertRule) {
        styleSheet.insertRule(selector + '{' + rules + '}', index);
      } else {
        styleSheet.addRule(selector, rules, index);
      }
    };

    // add special rules
    addCSSRule('.' + commonOptions.hiddenClass, 'position:absolute !important;left:-9999px !important;height:1px !important;width:1px !important;margin:0 !important;border-width:0 !important;-webkit-appearance:none;-moz-appearance:none;appearance:none');
    addCSSRule('.' + commonOptions.rtlClass + ' .' + commonOptions.hiddenClass, 'right:-9999px !important; left: auto !important');
    addCSSRule('.' + commonOptions.unselectableClass, '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0);');
    addCSSRule('.' + commonOptions.resetAppearanceClass, 'background: none; border: none; -webkit-appearance: none; appearance: none; opacity: 0; filter: alpha(opacity=0);');

    // detect rtl pages
    var html = $('html'), body = $('body');
    if (html.css('direction') === 'rtl' || body.css('direction') === 'rtl') {
      html.addClass(commonOptions.rtlClass);
    }

    // handle form reset event
    html.on('reset', function() {
      setTimeout(function() {
        api.refreshAll();
      }, 0);
    });

    // mark stylesheet as created
    commonOptions.styleSheetCreated = true;
  };

  // simplified pointer events handler
  (function() {
    var pointerEventsSupported = navigator.pointerEnabled || navigator.msPointerEnabled,
      touchEventsSupported = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
      eventList, eventMap = {}, eventPrefix = 'jcf-';

    // detect events to attach
    if (pointerEventsSupported) {
      eventList = {
        pointerover: navigator.pointerEnabled ? 'pointerover' : 'MSPointerOver',
        pointerdown: navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown',
        pointermove: navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove',
        pointerup: navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp'
      };
    } else {
      eventList = {
        pointerover: 'mouseover',
        pointerdown: 'mousedown' + (touchEventsSupported ? ' touchstart' : ''),
        pointermove: 'mousemove' + (touchEventsSupported ? ' touchmove' : ''),
        pointerup: 'mouseup' + (touchEventsSupported ? ' touchend' : '')
      };
    }

    // create event map
    $.each(eventList, function(targetEventName, fakeEventList) {
      $.each(fakeEventList.split(' '), function(index, fakeEventName) {
        eventMap[fakeEventName] = targetEventName;
      });
    });

    // jQuery event hooks
    $.each(eventList, function(eventName, eventHandlers) {
      eventHandlers = eventHandlers.split(' ');
      $.event.special[eventPrefix + eventName] = {
        setup: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, commonOptions.isMobileDevice ? {passive: false} : false);
            else self['on' + fallbackEvent] = fixEvent;
          });
        },
        teardown: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, commonOptions.isMobileDevice ? {passive: false} : false);
            else self['on' + fallbackEvent] = null;
          });
        }
      };
    });

    // check that mouse event are not simulated by mobile browsers
    var lastTouch = null;
    var mouseEventSimulated = function(e) {
      var dx = Math.abs(e.pageX - lastTouch.x),
        dy = Math.abs(e.pageY - lastTouch.y),
        rangeDistance = 25;

      if (dx <= rangeDistance && dy <= rangeDistance) {
        return true;
      }
    };

    // normalize event
    var fixEvent = function(e) {
      var origEvent = e || window.event,
        touchEventData = null,
        targetEventName = eventMap[origEvent.type];

      e = $.event.fix(origEvent);
      e.type = eventPrefix + targetEventName;

      if (origEvent.pointerType) {
        switch (origEvent.pointerType) {
          case 2: e.pointerType = 'touch'; break;
          case 3: e.pointerType = 'pen'; break;
          case 4: e.pointerType = 'mouse'; break;
          default: e.pointerType = origEvent.pointerType;
        }
      } else {
        e.pointerType = origEvent.type.substr(0, 5); // "mouse" or "touch" word length
      }

      if (!e.pageX && !e.pageY) {
        touchEventData = origEvent.changedTouches ? origEvent.changedTouches[0] : origEvent;
        e.pageX = touchEventData.pageX;
        e.pageY = touchEventData.pageY;
      }

      if (origEvent.type === 'touchend') {
        lastTouch = { x: e.pageX, y: e.pageY };
      }
      if (e.pointerType === 'mouse' && lastTouch && mouseEventSimulated(e)) {
        return;
      } else {
        return ($.event.dispatch || $.event.handle).call(this, e);
      }
    };
  }());

  // custom mousewheel/trackpad handler
  (function() {
    var wheelEvents = ('onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel DOMMouseScroll').split(' '),
      shimEventName = 'jcf-mousewheel';

    $.event.special[shimEventName] = {
      setup: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = fixEvent;
        });
      },
      teardown: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = null;
        });
      }
    };

    var fixEvent = function(e) {
      var origEvent = e || window.event;
      e = $.event.fix(origEvent);
      e.type = shimEventName;

      // old wheel events handler
      if ('detail'      in origEvent) { e.deltaY = -origEvent.detail;      }
      if ('wheelDelta'  in origEvent) { e.deltaY = -origEvent.wheelDelta;  }
      if ('wheelDeltaY' in origEvent) { e.deltaY = -origEvent.wheelDeltaY; }
      if ('wheelDeltaX' in origEvent) { e.deltaX = -origEvent.wheelDeltaX; }

      // modern wheel event handler
      if ('deltaY' in origEvent) {
        e.deltaY = origEvent.deltaY;
      }
      if ('deltaX' in origEvent) {
        e.deltaX = origEvent.deltaX;
      }

      // handle deltaMode for mouse wheel
      e.delta = e.deltaY || e.deltaX;
      if (origEvent.deltaMode === 1) {
        var lineHeight = 16;
        e.delta *= lineHeight;
        e.deltaY *= lineHeight;
        e.deltaX *= lineHeight;
      }

      return ($.event.dispatch || $.event.handle).call(this, e);
    };
  }());

  // extra module methods
  var moduleMixin = {
    // provide function for firing native events
    fireNativeEvent: function(elements, eventName) {
      $(elements).each(function() {
        var element = this, eventObject;
        if (element.dispatchEvent) {
          eventObject = document.createEvent('HTMLEvents');
          eventObject.initEvent(eventName, true, true);
          element.dispatchEvent(eventObject);
        } else if (document.createEventObject) {
          eventObject = document.createEventObject();
          eventObject.target = element;
          element.fireEvent('on' + eventName, eventObject);
        }
      });
    },
    // bind event handlers for module instance (functions beggining with "on")
    bindHandlers: function() {
      var self = this;
      $.each(self, function(propName, propValue) {
        if (propName.indexOf('on') === 0 && $.isFunction(propValue)) {
          // dont use $.proxy here because it doesn't create unique handler
          self[propName] = function() {
            return propValue.apply(self, arguments);
          };
        }
      });
    }
  };

  // public API
  var api = {
    version: version,
    modules: {},
    getOptions: function() {
      return $.extend({}, commonOptions);
    },
    setOptions: function(moduleName, moduleOptions) {
      if (arguments.length > 1) {
        // set module options
        if (this.modules[moduleName]) {
          $.extend(this.modules[moduleName].prototype.options, moduleOptions);
        }
      } else {
        // set common options
        $.extend(commonOptions, moduleName);
      }
    },
    addModule: function(proto) {
      // add module to list
      var Module = function(options) {
        // save instance to collection
        if (!options.element.data(commonOptions.dataKey)) {
          options.element.data(commonOptions.dataKey, this);
        }
        customInstances.push(this);

        // save options
        this.options = $.extend({}, commonOptions, this.options, getInlineOptions(options.element), options);

        // bind event handlers to instance
        this.bindHandlers();

        // call constructor
        this.init.apply(this, arguments);
      };

      // parse options from HTML attribute
      var getInlineOptions = function(element) {
        var dataOptions = element.data(commonOptions.optionsKey),
          attrOptions = element.attr(commonOptions.optionsKey);

        if (dataOptions) {
          return dataOptions;
        } else if (attrOptions) {
          try {
            return $.parseJSON(attrOptions);
          } catch (e) {
            // ignore invalid attributes
          }
        }
      };

      // set proto as prototype for new module
      Module.prototype = proto;

      // add mixin methods to module proto
      $.extend(proto, moduleMixin);
      if (proto.plugins) {
        $.each(proto.plugins, function(pluginName, plugin) {
          $.extend(plugin.prototype, moduleMixin);
        });
      }

      // override destroy method
      var originalDestroy = Module.prototype.destroy;
      Module.prototype.destroy = function() {
        this.options.element.removeData(this.options.dataKey);

        for (var i = customInstances.length - 1; i >= 0; i--) {
          if (customInstances[i] === this) {
            customInstances.splice(i, 1);
            break;
          }
        }

        if (originalDestroy) {
          originalDestroy.apply(this, arguments);
        }
      };

      // save module to list
      this.modules[proto.name] = Module;
    },
    getInstance: function(element) {
      return $(element).data(commonOptions.dataKey);
    },
    replace: function(elements, moduleName, customOptions) {
      var self = this,
        instance;

      if (!commonOptions.styleSheetCreated) {
        createStyleSheet();
      }

      $(elements).each(function() {
        var moduleOptions,
          element = $(this);

        instance = element.data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        } else {
          if (!moduleName) {
            $.each(self.modules, function(currentModuleName, module) {
              if (module.prototype.matchElement.call(module.prototype, element)) {
                moduleName = currentModuleName;
                return false;
              }
            });
          }
          if (moduleName) {
            moduleOptions = $.extend({ element: element }, customOptions);
            instance = new self.modules[moduleName](moduleOptions);
          }
        }
      });
      return instance;
    },
    refresh: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        }
      });
    },
    destroy: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.destroy();
        }
      });
    },
    replaceAll: function(context) {
      var self = this;
      $.each(this.modules, function(moduleName, module) {
        $(module.prototype.selector, context).each(function() {
          if (this.className.indexOf('jcf-ignore') < 0) {
            self.replace(this, moduleName);
          }
        });
      });
    },
    refreshAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function() {
            var instance = $(this).data(commonOptions.dataKey);
            if (instance) {
              instance.refresh();
            }
          });
        });
      } else {
        for (var i = customInstances.length - 1; i >= 0; i--) {
          customInstances[i].refresh();
        }
      }
    },
    destroyAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function(index, element) {
            var instance = $(element).data(commonOptions.dataKey);
            if (instance) {
              instance.destroy();
            }
          });
        });
      } else {
        while (customInstances.length) {
          customInstances[0].destroy();
        }
      }
    }
  };

  // always export API to the global window object
  window.jcf = api;

  return api;
})); 

 /*!
 * JavaScript Custom Forms : Select Module
 *
 
 *
 * Version: 1.1.3
 */
;(function($, window) {
  'use strict';

  jcf.addModule({
    name: 'Select',
    selector: 'select',
    options: {
      element: null,
      multipleCompactStyle: false
    },
    plugins: {
      ListBox: ListBox,
      ComboBox: ComboBox,
      SelectList: SelectList
    },
    matchElement: function(element) {
      return element.is('select');
    },
    init: function() {
      this.element = $(this.options.element);
      this.createInstance();
    },
    isListBox: function() {
      return this.element.is('[size]:not([jcf-size]), [multiple]');
    },
    createInstance: function() {
      if (this.instance) {
        this.instance.destroy();
      }
      if (this.isListBox() && !this.options.multipleCompactStyle) {
        this.instance = new ListBox(this.options);
      } else {
        this.instance = new ComboBox(this.options);
      }
    },
    refresh: function() {
      var typeMismatch = (this.isListBox() && this.instance instanceof ComboBox) ||
                (!this.isListBox() && this.instance instanceof ListBox);

      if (typeMismatch) {
        this.createInstance();
      } else {
        this.instance.refresh();
      }
    },
    destroy: function() {
      this.instance.destroy();
    }
  });

  // combobox module
  function ComboBox(options) {
    this.options = $.extend({
      wrapNative: true,
      wrapNativeOnMobile: true,
      fakeDropInBody: true,
      useCustomScroll: true,
      flipDropToFit: true,
      maxVisibleItems: 10,
      fakeAreaStructure: '<span class="jcf-select"><span class="jcf-select-text"></span><span class="jcf-select-opener"></span></span>',
      fakeDropStructure: '<div class="jcf-select-drop"><div class="jcf-select-drop-content"></div></div>',
      optionClassPrefix: 'jcf-option-',
      selectClassPrefix: 'jcf-select-',
      dropContentSelector: '.jcf-select-drop-content',
      selectTextSelector: '.jcf-select-text',
      dropActiveClass: 'jcf-drop-active',
      flipDropClass: 'jcf-drop-flipped'
    }, options);
    this.init();
  }
  $.extend(ComboBox.prototype, {
    init: function() {
      this.initStructure();
      this.bindHandlers();
      this.attachEvents();
      this.refresh();
    },
    initStructure: function() {
      // prepare structure
      this.win = $(window);
      this.doc = $(document);
      this.realElement = $(this.options.element);
      this.fakeElement = $(this.options.fakeAreaStructure).insertAfter(this.realElement);
      this.selectTextContainer = this.fakeElement.find(this.options.selectTextSelector);
      this.selectText = $('<span></span>').appendTo(this.selectTextContainer);
      makeUnselectable(this.fakeElement);

      // copy classes from original select
      this.fakeElement.addClass(getPrefixedClasses(this.realElement.prop('className'), this.options.selectClassPrefix));

      // handle compact multiple style
      if (this.realElement.prop('multiple')) {
        this.fakeElement.addClass('jcf-compact-multiple');
      }

      // detect device type and dropdown behavior
      if (this.options.isMobileDevice && this.options.wrapNativeOnMobile && !this.options.wrapNative) {
        this.options.wrapNative = true;
      }

      if (this.options.wrapNative) {
        // wrap native select inside fake block
        this.realElement.prependTo(this.fakeElement).css({
          position: 'absolute',
          height: '100%',
          width: '100%'
        }).addClass(this.options.resetAppearanceClass);
      } else {
        // just hide native select
        this.realElement.addClass(this.options.hiddenClass);
        this.fakeElement.attr('title', this.realElement.attr('title'));
        this.fakeDropTarget = this.options.fakeDropInBody ? $('body') : this.fakeElement;
      }
    },
    attachEvents: function() {
      // delayed refresh handler
      var self = this;
      this.delayedRefresh = function() {
        setTimeout(function() {
          self.refresh();
          if (self.list) {
            self.list.refresh();
            self.list.scrollToActiveOption();
          }
        }, 1);
      };

      // native dropdown event handlers
      if (this.options.wrapNative) {
        this.realElement.on({
          focus: this.onFocus,
          change: this.onChange,
          click: this.onChange,
          keydown: this.onChange
        });
      } else {
        // custom dropdown event handlers
        this.realElement.on({
          focus: this.onFocus,
          change: this.onChange,
          keydown: this.onKeyDown
        });
        this.fakeElement.on({
          'jcf-pointerdown': this.onSelectAreaPress
        });
      }
    },
    onKeyDown: function(e) {
      if (e.which === 13) {
        this.toggleDropdown();
      } else if (this.dropActive) {
        this.delayedRefresh();
      }
    },
    onChange: function() {
      this.refresh();
    },
    onFocus: function() {
      if (!this.pressedFlag || !this.focusedFlag) {
        this.fakeElement.addClass(this.options.focusClass);
        this.realElement.on('blur', this.onBlur);
        this.toggleListMode(true);
        this.focusedFlag = true;
      }
    },
    onBlur: function() {
      if (!this.pressedFlag) {
        this.fakeElement.removeClass(this.options.focusClass);
        this.realElement.off('blur', this.onBlur);
        this.toggleListMode(false);
        this.focusedFlag = false;
      }
    },
    onResize: function() {
      if (this.dropActive) {
        this.hideDropdown();
      }
    },
    onSelectDropPress: function() {
      this.pressedFlag = true;
    },
    onSelectDropRelease: function(e, pointerEvent) {
      this.pressedFlag = false;
      if (pointerEvent.pointerType === 'mouse') {
        this.realElement.focus();
      }
    },
    onSelectAreaPress: function(e) {
      // skip click if drop inside fake element or real select is disabled
      var dropClickedInsideFakeElement = !this.options.fakeDropInBody && $(e.target).closest(this.dropdown).length;
      if (dropClickedInsideFakeElement || e.button > 1 || this.realElement.is(':disabled')) {
        return;
      }

      // toggle dropdown visibility
      this.selectOpenedByEvent = e.pointerType;
      this.toggleDropdown();

      // misc handlers
      if (!this.focusedFlag) {
        if (e.pointerType === 'mouse') {
          this.realElement.focus();
        } else {
          this.onFocus(e);
        }
      }
      this.pressedFlag = true;
      this.fakeElement.addClass(this.options.pressedClass);
      this.doc.on('jcf-pointerup', this.onSelectAreaRelease);
    },
    onSelectAreaRelease: function(e) {
      if (this.focusedFlag && e.pointerType === 'mouse') {
        this.realElement.focus();
      }
      this.pressedFlag = false;
      this.fakeElement.removeClass(this.options.pressedClass);
      this.doc.off('jcf-pointerup', this.onSelectAreaRelease);
    },
    onOutsideClick: function(e) {
      var target = $(e.target),
        clickedInsideSelect = target.closest(this.fakeElement).length || target.closest(this.dropdown).length;

      if (!clickedInsideSelect) {
        this.hideDropdown();
      }
    },
    onSelect: function() {
      this.refresh();

      if (this.realElement.prop('multiple')) {
        this.repositionDropdown();
      } else {
        this.hideDropdown();
      }

      this.fireNativeEvent(this.realElement, 'change');
    },
    toggleListMode: function(state) {
      if (!this.options.wrapNative) {
        if (state) {
          // temporary change select to list to avoid appearing of native dropdown
          this.realElement.attr({
            size: 4,
            'jcf-size': ''
          });
        } else {
          // restore select from list mode to dropdown select
          if (!this.options.wrapNative) {
            this.realElement.removeAttr('size jcf-size');
          }
        }
      }
    },
    createDropdown: function() {
      // destroy previous dropdown if needed
      if (this.dropdown) {
        this.list.destroy();
        this.dropdown.remove();
      }

      // create new drop container
      this.dropdown = $(this.options.fakeDropStructure).appendTo(this.fakeDropTarget);
      this.dropdown.addClass(getPrefixedClasses(this.realElement.prop('className'), this.options.selectClassPrefix));
      makeUnselectable(this.dropdown);

      // handle compact multiple style
      if (this.realElement.prop('multiple')) {
        this.dropdown.addClass('jcf-compact-multiple');
      }

      // set initial styles for dropdown in body
      if (this.options.fakeDropInBody) {
        this.dropdown.css({
          position: 'absolute',
          top: -9999
        });
      }

      // create new select list instance
      this.list = new SelectList({
        useHoverClass: true,
        handleResize: false,
        alwaysPreventMouseWheel: true,
        maxVisibleItems: this.options.maxVisibleItems,
        useCustomScroll: this.options.useCustomScroll,
        holder: this.dropdown.find(this.options.dropContentSelector),
        multipleSelectWithoutKey: this.realElement.prop('multiple'),
        element: this.realElement
      });
      $(this.list).on({
        select: this.onSelect,
        press: this.onSelectDropPress,
        release: this.onSelectDropRelease
      });
    },
    repositionDropdown: function() {
      var selectOffset = this.fakeElement.offset(),
        selectWidth = this.fakeElement.outerWidth(),
        selectHeight = this.fakeElement.outerHeight(),
        dropHeight = this.dropdown.css('width', selectWidth).outerHeight(),
        winScrollTop = this.win.scrollTop(),
        winHeight = this.win.height(),
        calcTop, calcLeft, bodyOffset, needFlipDrop = false;

      // check flip drop position
      if (selectOffset.top + selectHeight + dropHeight > winScrollTop + winHeight && selectOffset.top - dropHeight > winScrollTop) {
        needFlipDrop = true;
      }

      if (this.options.fakeDropInBody) {
        bodyOffset = this.fakeDropTarget.css('position') !== 'static' ? this.fakeDropTarget.offset().top : 0;
        if (this.options.flipDropToFit && needFlipDrop) {
          // calculate flipped dropdown position
          calcLeft = selectOffset.left;
          calcTop = selectOffset.top - dropHeight - bodyOffset;
        } else {
          // calculate default drop position
          calcLeft = selectOffset.left;
          calcTop = selectOffset.top + selectHeight - bodyOffset;
        }

        // update drop styles
        this.dropdown.css({
          width: selectWidth,
          left: calcLeft,
          top: calcTop
        });
      }

      // refresh flipped class
      this.dropdown.add(this.fakeElement).toggleClass(this.options.flipDropClass, this.options.flipDropToFit && needFlipDrop);
    },
    showDropdown: function() {
      // do not show empty custom dropdown
      if (!this.realElement.prop('options').length) {
        return;
      }

      // create options list if not created
      if (!this.dropdown) {
        this.createDropdown();
      }

      // show dropdown
      this.dropActive = true;
      this.dropdown.appendTo(this.fakeDropTarget);
      this.fakeElement.addClass(this.options.dropActiveClass);
      this.refreshSelectedText();
      this.repositionDropdown();
      this.list.setScrollTop(this.savedScrollTop);
      this.list.refresh();

      // add temporary event handlers
      this.win.on('resize', this.onResize);
      this.doc.on('jcf-pointerdown', this.onOutsideClick);
    },
    hideDropdown: function() {
      if (this.dropdown) {
        this.savedScrollTop = this.list.getScrollTop();
        this.fakeElement.removeClass(this.options.dropActiveClass + ' ' + this.options.flipDropClass);
        this.dropdown.removeClass(this.options.flipDropClass).detach();
        this.doc.off('jcf-pointerdown', this.onOutsideClick);
        this.win.off('resize', this.onResize);
        this.dropActive = false;
        if (this.selectOpenedByEvent === 'touch') {
          this.onBlur();
        }
      }
    },
    toggleDropdown: function() {
      if (this.dropActive) {
        this.hideDropdown();
      } else {
        this.showDropdown();
      }
    },
    refreshSelectedText: function() {
      // redraw selected area
      var selectedIndex = this.realElement.prop('selectedIndex'),
        selectedOption = this.realElement.prop('options')[selectedIndex],
        selectedOptionImage = selectedOption ? selectedOption.getAttribute('data-image') : null,
        selectedOptionText = '',
        selectedOptionClasses,
        self = this;

      if (this.realElement.prop('multiple')) {
        $.each(this.realElement.prop('options'), function(index, option) {
          if (option.selected) {
            selectedOptionText += (selectedOptionText ? ', ' : '') + option.innerHTML;
          }
        });
        if (!selectedOptionText) {
          selectedOptionText = self.realElement.attr('placeholder') || '';
        }
        this.selectText.removeAttr('class').html(selectedOptionText);
      } else if (!selectedOption) {
        if (this.selectImage) {
          this.selectImage.hide();
        }
        this.selectText.removeAttr('class').empty();
      } else if (this.currentSelectedText !== selectedOption.innerHTML || this.currentSelectedImage !== selectedOptionImage) {
        selectedOptionClasses = getPrefixedClasses(selectedOption.className, this.options.optionClassPrefix);
        this.selectText.attr('class', selectedOptionClasses).html(selectedOption.innerHTML);

        if (selectedOptionImage) {
          if (!this.selectImage) {
            this.selectImage = $('<img>').prependTo(this.selectTextContainer).hide();
          }
          this.selectImage.attr('src', selectedOptionImage).show();
        } else if (this.selectImage) {
          this.selectImage.hide();
        }

        this.currentSelectedText = selectedOption.innerHTML;
        this.currentSelectedImage = selectedOptionImage;
      }
    },
    refresh: function() {
      // refresh fake select visibility
      if (this.realElement.prop('style').display === 'none') {
        this.fakeElement.hide();
      } else {
        this.fakeElement.show();
      }

      // refresh selected text
      this.refreshSelectedText();

      // handle disabled state
      this.fakeElement.toggleClass(this.options.disabledClass, this.realElement.is(':disabled'));
    },
    destroy: function() {
      // restore structure
      if (this.options.wrapNative) {
        this.realElement.insertBefore(this.fakeElement).css({
          position: '',
          height: '',
          width: ''
        }).removeClass(this.options.resetAppearanceClass);
      } else {
        this.realElement.removeClass(this.options.hiddenClass);
        if (this.realElement.is('[jcf-size]')) {
          this.realElement.removeAttr('size jcf-size');
        }
      }

      // removing element will also remove its event handlers
      this.fakeElement.remove();

      // remove other event handlers
      this.doc.off('jcf-pointerup', this.onSelectAreaRelease);
      this.realElement.off({
        focus: this.onFocus
      });
    }
  });

  // listbox module
  function ListBox(options) {
    this.options = $.extend({
      wrapNative: true,
      useCustomScroll: true,
      fakeStructure: '<span class="jcf-list-box"><span class="jcf-list-wrapper"></span></span>',
      selectClassPrefix: 'jcf-select-',
      listHolder: '.jcf-list-wrapper'
    }, options);
    this.init();
  }
  $.extend(ListBox.prototype, {
    init: function() {
      this.bindHandlers();
      this.initStructure();
      this.attachEvents();
    },
    initStructure: function() {
      this.realElement = $(this.options.element);
      this.fakeElement = $(this.options.fakeStructure).insertAfter(this.realElement);
      this.listHolder = this.fakeElement.find(this.options.listHolder);
      makeUnselectable(this.fakeElement);

      // copy classes from original select
      this.fakeElement.addClass(getPrefixedClasses(this.realElement.prop('className'), this.options.selectClassPrefix));
      this.realElement.addClass(this.options.hiddenClass);

      this.list = new SelectList({
        useCustomScroll: this.options.useCustomScroll,
        holder: this.listHolder,
        selectOnClick: false,
        element: this.realElement
      });
    },
    attachEvents: function() {
      // delayed refresh handler
      var self = this;
      this.delayedRefresh = function(e) {
        if (e && e.which === 16) {
          // ignore SHIFT key
          return;
        } else {
          clearTimeout(self.refreshTimer);
          self.refreshTimer = setTimeout(function() {
            self.refresh();
            self.list.scrollToActiveOption();
          }, 1);
        }
      };

      // other event handlers
      this.realElement.on({
        focus: this.onFocus,
        click: this.delayedRefresh,
        keydown: this.delayedRefresh
      });

      // select list event handlers
      $(this.list).on({
        select: this.onSelect,
        press: this.onFakeOptionsPress,
        release: this.onFakeOptionsRelease
      });
    },
    onFakeOptionsPress: function(e, pointerEvent) {
      this.pressedFlag = true;
      if (pointerEvent.pointerType === 'mouse') {
        this.realElement.focus();
      }
    },
    onFakeOptionsRelease: function(e, pointerEvent) {
      this.pressedFlag = false;
      if (pointerEvent.pointerType === 'mouse') {
        this.realElement.focus();
      }
    },
    onSelect: function() {
      this.fireNativeEvent(this.realElement, 'change');
      this.fireNativeEvent(this.realElement, 'click');
    },
    onFocus: function() {
      if (!this.pressedFlag || !this.focusedFlag) {
        this.fakeElement.addClass(this.options.focusClass);
        this.realElement.on('blur', this.onBlur);
        this.focusedFlag = true;
      }
    },
    onBlur: function() {
      if (!this.pressedFlag) {
        this.fakeElement.removeClass(this.options.focusClass);
        this.realElement.off('blur', this.onBlur);
        this.focusedFlag = false;
      }
    },
    refresh: function() {
      this.fakeElement.toggleClass(this.options.disabledClass, this.realElement.is(':disabled'));
      this.list.refresh();
    },
    destroy: function() {
      this.list.destroy();
      this.realElement.insertBefore(this.fakeElement).removeClass(this.options.hiddenClass);
      this.fakeElement.remove();
    }
  });

  // options list module
  function SelectList(options) {
    this.options = $.extend({
      holder: null,
      maxVisibleItems: 10,
      selectOnClick: true,
      useHoverClass: false,
      useCustomScroll: false,
      handleResize: true,
      multipleSelectWithoutKey: false,
      alwaysPreventMouseWheel: false,
      indexAttribute: 'data-index',
      cloneClassPrefix: 'jcf-option-',
      containerStructure: '<span class="jcf-list"><span class="jcf-list-content"></span></span>',
      containerSelector: '.jcf-list-content',
      captionClass: 'jcf-optgroup-caption',
      disabledClass: 'jcf-disabled',
      optionClass: 'jcf-option',
      groupClass: 'jcf-optgroup',
      hoverClass: 'jcf-hover',
      selectedClass: 'jcf-selected',
      scrollClass: 'jcf-scroll-active'
    }, options);
    this.init();
  }
  $.extend(SelectList.prototype, {
    init: function() {
      this.initStructure();
      this.refreshSelectedClass();
      this.attachEvents();
    },
    initStructure: function() {
      this.element = $(this.options.element);
      this.indexSelector = '[' + this.options.indexAttribute + ']';
      this.container = $(this.options.containerStructure).appendTo(this.options.holder);
      this.listHolder = this.container.find(this.options.containerSelector);
      this.lastClickedIndex = this.element.prop('selectedIndex');
      this.rebuildList();
    },
    attachEvents: function() {
      this.bindHandlers();
      this.listHolder.on('jcf-pointerdown', this.indexSelector, this.onItemPress);
      this.listHolder.on('jcf-pointerdown', this.onPress);

      if (this.options.useHoverClass) {
        this.listHolder.on('jcf-pointerover', this.indexSelector, this.onHoverItem);
      }
    },
    onPress: function(e) {
      $(this).trigger('press', e);
      this.listHolder.on('jcf-pointerup', this.onRelease);
    },
    onRelease: function(e) {
      $(this).trigger('release', e);
      this.listHolder.off('jcf-pointerup', this.onRelease);
    },
    onHoverItem: function(e) {
      var hoverIndex = parseFloat(e.currentTarget.getAttribute(this.options.indexAttribute));
      this.fakeOptions.removeClass(this.options.hoverClass).eq(hoverIndex).addClass(this.options.hoverClass);
    },
    onItemPress: function(e) {
      if (e.pointerType === 'touch' || this.options.selectOnClick) {
        // select option after "click"
        this.tmpListOffsetTop = this.list.offset().top;
        this.listHolder.on('jcf-pointerup', this.indexSelector, this.onItemRelease);
      } else {
        // select option immediately
        this.onSelectItem(e);
      }
    },
    onItemRelease: function(e) {
      // remove event handlers and temporary data
      this.listHolder.off('jcf-pointerup', this.indexSelector, this.onItemRelease);

      // simulate item selection
      if (this.tmpListOffsetTop === this.list.offset().top) {
        this.listHolder.on('click', this.indexSelector, { savedPointerType: e.pointerType }, this.onSelectItem);
      }
      delete this.tmpListOffsetTop;
    },
    onSelectItem: function(e) {
      var clickedIndex = parseFloat(e.currentTarget.getAttribute(this.options.indexAttribute)),
        pointerType = e.data && e.data.savedPointerType || e.pointerType || 'mouse',
        range;

      // remove click event handler
      this.listHolder.off('click', this.indexSelector, this.onSelectItem);

      // ignore clicks on disabled options
      if (e.button > 1 || this.realOptions[clickedIndex].disabled) {
        return;
      }

      if (this.element.prop('multiple')) {
        if (e.metaKey || e.ctrlKey || pointerType === 'touch' || this.options.multipleSelectWithoutKey) {
          // if CTRL/CMD pressed or touch devices - toggle selected option
          this.realOptions[clickedIndex].selected = !this.realOptions[clickedIndex].selected;
        } else if (e.shiftKey) {
          // if SHIFT pressed - update selection
          range = [this.lastClickedIndex, clickedIndex].sort(function(a, b) {
            return a - b;
          });
          this.realOptions.each(function(index, option) {
            option.selected = (index >= range[0] && index <= range[1]);
          });
        } else {
          // set single selected index
          this.element.prop('selectedIndex', clickedIndex);
        }
      } else {
        this.element.prop('selectedIndex', clickedIndex);
      }

      // save last clicked option
      if (!e.shiftKey) {
        this.lastClickedIndex = clickedIndex;
      }

      // refresh classes
      this.refreshSelectedClass();

      // scroll to active item in desktop browsers
      if (pointerType === 'mouse') {
        this.scrollToActiveOption();
      }

      // make callback when item selected
      $(this).trigger('select');
    },
    rebuildList: function() {
      // rebuild options
      var self = this,
        rootElement = this.element[0];

      // recursively create fake options
      this.storedSelectHTML = rootElement.innerHTML;
      this.optionIndex = 0;
      this.list = $(this.createOptionsList(rootElement));
      this.listHolder.empty().append(this.list);
      this.realOptions = this.element.find('option');
      this.fakeOptions = this.list.find(this.indexSelector);
      this.fakeListItems = this.list.find('.' + this.options.captionClass + ',' + this.indexSelector);
      delete this.optionIndex;

      // detect max visible items
      var maxCount = this.options.maxVisibleItems,
        sizeValue = this.element.prop('size');
      if (sizeValue > 1 && !this.element.is('[jcf-size]')) {
        maxCount = sizeValue;
      }

      // handle scrollbar
      var needScrollBar = this.fakeOptions.length > maxCount;
      this.container.toggleClass(this.options.scrollClass, needScrollBar);
      if (needScrollBar) {
        // change max-height
        this.listHolder.css({
          maxHeight: this.getOverflowHeight(maxCount),
          overflow: 'auto'
        });

        if (this.options.useCustomScroll && jcf.modules.Scrollable) {
          // add custom scrollbar if specified in options
          jcf.replace(this.listHolder, 'Scrollable', {
            handleResize: this.options.handleResize,
            alwaysPreventMouseWheel: this.options.alwaysPreventMouseWheel
          });
          return;
        }
      }

      // disable edge wheel scrolling
      if (this.options.alwaysPreventMouseWheel) {
        this.preventWheelHandler = function(e) {
          var currentScrollTop = self.listHolder.scrollTop(),
            maxScrollTop = self.listHolder.prop('scrollHeight') - self.listHolder.innerHeight();

          // check edge cases
          if ((currentScrollTop <= 0 && e.deltaY < 0) || (currentScrollTop >= maxScrollTop && e.deltaY > 0)) {
            e.preventDefault();
          }
        };
        this.listHolder.on('jcf-mousewheel', this.preventWheelHandler);
      }
    },
    refreshSelectedClass: function() {
      var self = this,
        selectedItem,
        isMultiple = this.element.prop('multiple'),
        selectedIndex = this.element.prop('selectedIndex');

      if (isMultiple) {
        this.realOptions.each(function(index, option) {
          self.fakeOptions.eq(index).toggleClass(self.options.selectedClass, !!option.selected);
        });
      } else {
        this.fakeOptions.removeClass(this.options.selectedClass + ' ' + this.options.hoverClass);
        selectedItem = this.fakeOptions.eq(selectedIndex).addClass(this.options.selectedClass);
        if (this.options.useHoverClass) {
          selectedItem.addClass(this.options.hoverClass);
        }
      }
    },
    scrollToActiveOption: function() {
      // scroll to target option
      var targetOffset = this.getActiveOptionOffset();
      if (typeof targetOffset === 'number') {
        this.listHolder.prop('scrollTop', targetOffset);
      }
    },
    getSelectedIndexRange: function() {
      var firstSelected = -1, lastSelected = -1;
      this.realOptions.each(function(index, option) {
        if (option.selected) {
          if (firstSelected < 0) {
            firstSelected = index;
          }
          lastSelected = index;
        }
      });
      return [firstSelected, lastSelected];
    },
    getChangedSelectedIndex: function() {
      var selectedIndex = this.element.prop('selectedIndex'),
        targetIndex;

      if (this.element.prop('multiple')) {
        // multiple selects handling
        if (!this.previousRange) {
          this.previousRange = [selectedIndex, selectedIndex];
        }
        this.currentRange = this.getSelectedIndexRange();
        targetIndex = this.currentRange[this.currentRange[0] !== this.previousRange[0] ? 0 : 1];
        this.previousRange = this.currentRange;
        return targetIndex;
      } else {
        // single choice selects handling
        return selectedIndex;
      }
    },
    getActiveOptionOffset: function() {
      // calc values
      var dropHeight = this.listHolder.height(),
        dropScrollTop = this.listHolder.prop('scrollTop'),
        currentIndex = this.getChangedSelectedIndex(),
        fakeOption = this.fakeOptions.eq(currentIndex),
        fakeOptionOffset = fakeOption.offset().top - this.list.offset().top,
        fakeOptionHeight = fakeOption.innerHeight();

      // scroll list
      if (fakeOptionOffset + fakeOptionHeight >= dropScrollTop + dropHeight) {
        // scroll down (always scroll to option)
        return fakeOptionOffset - dropHeight + fakeOptionHeight;
      } else if (fakeOptionOffset < dropScrollTop) {
        // scroll up to option
        return fakeOptionOffset;
      }
    },
    getOverflowHeight: function(sizeValue) {
      var item = this.fakeListItems.eq(sizeValue - 1),
        listOffset = this.list.offset().top,
        itemOffset = item.offset().top,
        itemHeight = item.innerHeight();

      return itemOffset + itemHeight - listOffset;
    },
    getScrollTop: function() {
      return this.listHolder.scrollTop();
    },
    setScrollTop: function(value) {
      this.listHolder.scrollTop(value);
    },
    createOption: function(option) {
      var newOption = document.createElement('span');
      newOption.className = this.options.optionClass;
      newOption.innerHTML = option.innerHTML;
      newOption.setAttribute(this.options.indexAttribute, this.optionIndex++);

      var optionImage, optionImageSrc = option.getAttribute('data-image');
      if (optionImageSrc) {
        optionImage = document.createElement('img');
        optionImage.src = optionImageSrc;
        newOption.insertBefore(optionImage, newOption.childNodes[0]);
      }
      if (option.disabled) {
        newOption.className += ' ' + this.options.disabledClass;
      }
      if (option.className) {
        newOption.className += ' ' + getPrefixedClasses(option.className, this.options.cloneClassPrefix);
      }
      return newOption;
    },
    createOptGroup: function(optgroup) {
      var optGroupContainer = document.createElement('span'),
        optGroupName = optgroup.getAttribute('label'),
        optGroupCaption, optGroupList;

      // create caption
      optGroupCaption = document.createElement('span');
      optGroupCaption.className = this.options.captionClass;
      optGroupCaption.innerHTML = optGroupName;
      optGroupContainer.appendChild(optGroupCaption);

      // create list of options
      if (optgroup.children.length) {
        optGroupList = this.createOptionsList(optgroup);
        optGroupContainer.appendChild(optGroupList);
      }

      optGroupContainer.className = this.options.groupClass;
      return optGroupContainer;
    },
    createOptionContainer: function() {
      var optionContainer = document.createElement('li');
      return optionContainer;
    },
    createOptionsList: function(container) {
      var self = this,
        list = document.createElement('ul');

      $.each(container.children, function(index, currentNode) {
        var item = self.createOptionContainer(currentNode),
          newNode;

        switch (currentNode.tagName.toLowerCase()) {
          case 'option': newNode = self.createOption(currentNode); break;
          case 'optgroup': newNode = self.createOptGroup(currentNode); break;
        }
        list.appendChild(item).appendChild(newNode);
      });
      return list;
    },
    refresh: function() {
      // check for select innerHTML changes
      if (this.storedSelectHTML !== this.element.prop('innerHTML')) {
        this.rebuildList();
      }

      // refresh custom scrollbar
      var scrollInstance = jcf.getInstance(this.listHolder);
      if (scrollInstance) {
        scrollInstance.refresh();
      }

      // refresh selectes classes
      this.refreshSelectedClass();
    },
    destroy: function() {
      this.listHolder.off('jcf-mousewheel', this.preventWheelHandler);
      this.listHolder.off('jcf-pointerdown', this.indexSelector, this.onSelectItem);
      this.listHolder.off('jcf-pointerover', this.indexSelector, this.onHoverItem);
      this.listHolder.off('jcf-pointerdown', this.onPress);
    }
  });

  // helper functions
  var getPrefixedClasses = function(className, prefixToAdd) {
    return className ? className.replace(/[\s]*([\S]+)+[\s]*/gi, prefixToAdd + '$1 ') : '';
  };
  var makeUnselectable = (function() {
    var unselectableClass = jcf.getOptions().unselectableClass;
    function preventHandler(e) {
      e.preventDefault();
    }
    return function(node) {
      node.addClass(unselectableClass).on('selectstart', preventHandler);
    };
  }());

}(jQuery, this));
 

 /*!
 * JavaScript Custom Forms : Scrollbar Module
 *
 
 *
 * Version: 1.1.3
 */
;(function($, window) {
  'use strict';

  jcf.addModule({
    name: 'Scrollable',
    selector: '.jcf-scrollable',
    plugins: {
      ScrollBar: ScrollBar
    },
    options: {
      mouseWheelStep: 150,
      handleResize: true,
      alwaysShowScrollbars: false,
      alwaysPreventMouseWheel: false,
      scrollAreaStructure: '<div class="jcf-scrollable-wrapper"></div>'
    },
    matchElement: function(element) {
      return element.is('.jcf-scrollable');
    },
    init: function() {
      this.initStructure();
      this.attachEvents();
      this.rebuildScrollbars();
    },
    initStructure: function() {
      // prepare structure
      this.doc = $(document);
      this.win = $(window);
      this.realElement = $(this.options.element);
      this.scrollWrapper = $(this.options.scrollAreaStructure).insertAfter(this.realElement);

      // set initial styles
      this.scrollWrapper.css('position', 'relative');
      this.realElement.css('overflow', 'hidden');
      this.vBarEdge = 0;
    },
    attachEvents: function() {
      // create scrollbars
      var self = this;
      this.vBar = new ScrollBar({
        holder: this.scrollWrapper,
        vertical: true,
        onScroll: function(scrollTop) {
          self.realElement.scrollTop(scrollTop);
        }
      });
      this.hBar = new ScrollBar({
        holder: this.scrollWrapper,
        vertical: false,
        onScroll: function(scrollLeft) {
          self.realElement.scrollLeft(scrollLeft);
        }
      });

      // add event handlers
      this.realElement.on('scroll', this.onScroll);
      if (this.options.handleResize) {
        this.win.on('resize orientationchange load', this.onResize);
      }

      // add pointer/wheel event handlers
      this.realElement.on('jcf-mousewheel', this.onMouseWheel);
      this.realElement.on('jcf-pointerdown', this.onTouchBody);
    },
    onScroll: function() {
      this.redrawScrollbars();
    },
    onResize: function() {
      // do not rebuild scrollbars if form field is in focus
      if (!$(document.activeElement).is(':input')) {
        this.rebuildScrollbars();
      }
    },
    onTouchBody: function(e) {
      if (e.pointerType === 'touch') {
        this.touchData = {
          scrollTop: this.realElement.scrollTop(),
          scrollLeft: this.realElement.scrollLeft(),
          left: e.pageX,
          top: e.pageY
        };
        this.doc.on({
          'jcf-pointermove': this.onMoveBody,
          'jcf-pointerup': this.onReleaseBody
        });
      }
    },
    onMoveBody: function(e) {
      var targetScrollTop,
        targetScrollLeft,
        verticalScrollAllowed = this.verticalScrollActive,
        horizontalScrollAllowed = this.horizontalScrollActive;

      if (e.pointerType === 'touch') {
        targetScrollTop = this.touchData.scrollTop - e.pageY + this.touchData.top;
        targetScrollLeft = this.touchData.scrollLeft - e.pageX + this.touchData.left;

        // check that scrolling is ended and release outer scrolling
        if (this.verticalScrollActive && (targetScrollTop < 0 || targetScrollTop > this.vBar.maxValue)) {
          verticalScrollAllowed = false;
        }
        if (this.horizontalScrollActive && (targetScrollLeft < 0 || targetScrollLeft > this.hBar.maxValue)) {
          horizontalScrollAllowed = false;
        }

        this.realElement.scrollTop(targetScrollTop);
        this.realElement.scrollLeft(targetScrollLeft);

        if (verticalScrollAllowed || horizontalScrollAllowed) {
          e.preventDefault();
        } else {
          this.onReleaseBody(e);
        }
      }
    },
    onReleaseBody: function(e) {
      if (e.pointerType === 'touch') {
        delete this.touchData;
        this.doc.off({
          'jcf-pointermove': this.onMoveBody,
          'jcf-pointerup': this.onReleaseBody
        });
      }
    },
    onMouseWheel: function(e) {
      var currentScrollTop = this.realElement.scrollTop(),
        currentScrollLeft = this.realElement.scrollLeft(),
        maxScrollTop = this.realElement.prop('scrollHeight') - this.embeddedDimensions.innerHeight,
        maxScrollLeft = this.realElement.prop('scrollWidth') - this.embeddedDimensions.innerWidth,
        extraLeft, extraTop, preventFlag;

      // check edge cases
      if (!this.options.alwaysPreventMouseWheel) {
        if (this.verticalScrollActive && e.deltaY) {
          if (!(currentScrollTop <= 0 && e.deltaY < 0) && !(currentScrollTop >= maxScrollTop && e.deltaY > 0)) {
            preventFlag = true;
          }
        }
        if (this.horizontalScrollActive && e.deltaX) {
          if (!(currentScrollLeft <= 0 && e.deltaX < 0) && !(currentScrollLeft >= maxScrollLeft && e.deltaX > 0)) {
            preventFlag = true;
          }
        }
        if (!this.verticalScrollActive && !this.horizontalScrollActive) {
          return;
        }
      }

      // prevent default action and scroll item
      if (preventFlag || this.options.alwaysPreventMouseWheel) {
        e.preventDefault();
      } else {
        return;
      }

      extraLeft = e.deltaX / 100 * this.options.mouseWheelStep;
      extraTop = e.deltaY / 100 * this.options.mouseWheelStep;

      this.realElement.scrollTop(currentScrollTop + extraTop);
      this.realElement.scrollLeft(currentScrollLeft + extraLeft);
    },
    setScrollBarEdge: function(edgeSize) {
      this.vBarEdge = edgeSize || 0;
      this.redrawScrollbars();
    },
    saveElementDimensions: function() {
      this.savedDimensions = {
        top: this.realElement.width(),
        left: this.realElement.height()
      };
      return this;
    },
    restoreElementDimensions: function() {
      if (this.savedDimensions) {
        this.realElement.css({
          width: this.savedDimensions.width,
          height: this.savedDimensions.height
        });
      }
      return this;
    },
    saveScrollOffsets: function() {
      this.savedOffsets = {
        top: this.realElement.scrollTop(),
        left: this.realElement.scrollLeft()
      };
      return this;
    },
    restoreScrollOffsets: function() {
      if (this.savedOffsets) {
        this.realElement.scrollTop(this.savedOffsets.top);
        this.realElement.scrollLeft(this.savedOffsets.left);
      }
      return this;
    },
    getContainerDimensions: function() {
      // save current styles
      var desiredDimensions,
        currentStyles,
        currentHeight,
        currentWidth;

      if (this.isModifiedStyles) {
        desiredDimensions = {
          width: this.realElement.innerWidth() + this.vBar.getThickness(),
          height: this.realElement.innerHeight() + this.hBar.getThickness()
        };
      } else {
        // unwrap real element and measure it according to CSS
        this.saveElementDimensions().saveScrollOffsets();
        this.realElement.insertAfter(this.scrollWrapper);
        this.scrollWrapper.detach();

        // measure element
        currentStyles = this.realElement.prop('style');
        currentWidth = parseFloat(currentStyles.width);
        currentHeight = parseFloat(currentStyles.height);

        // reset styles if needed
        if (this.embeddedDimensions && currentWidth && currentHeight) {
          this.isModifiedStyles |= (currentWidth !== this.embeddedDimensions.width || currentHeight !== this.embeddedDimensions.height);
          this.realElement.css({
            overflow: '',
            width: '',
            height: ''
          });
        }

        // calculate desired dimensions for real element
        desiredDimensions = {
          width: this.realElement.outerWidth(),
          height: this.realElement.outerHeight()
        };

        // restore structure and original scroll offsets
        this.scrollWrapper.insertAfter(this.realElement);
        this.realElement.css('overflow', 'hidden').prependTo(this.scrollWrapper);
        this.restoreElementDimensions().restoreScrollOffsets();
      }

      return desiredDimensions;
    },
    getEmbeddedDimensions: function(dimensions) {
      // handle scrollbars cropping
      var fakeBarWidth = this.vBar.getThickness(),
        fakeBarHeight = this.hBar.getThickness(),
        paddingWidth = this.realElement.outerWidth() - this.realElement.width(),
        paddingHeight = this.realElement.outerHeight() - this.realElement.height(),
        resultDimensions;

      if (this.options.alwaysShowScrollbars) {
        // simply return dimensions without custom scrollbars
        this.verticalScrollActive = true;
        this.horizontalScrollActive = true;
        resultDimensions = {
          innerWidth: dimensions.width - fakeBarWidth,
          innerHeight: dimensions.height - fakeBarHeight
        };
      } else {
        // detect when to display each scrollbar
        this.saveElementDimensions();
        this.verticalScrollActive = false;
        this.horizontalScrollActive = false;

        // fill container with full size
        this.realElement.css({
          width: dimensions.width - paddingWidth,
          height: dimensions.height - paddingHeight
        });

        this.horizontalScrollActive = this.realElement.prop('scrollWidth') > this.containerDimensions.width;
        this.verticalScrollActive = this.realElement.prop('scrollHeight') > this.containerDimensions.height;

        this.restoreElementDimensions();
        resultDimensions = {
          innerWidth: dimensions.width - (this.verticalScrollActive ? fakeBarWidth : 0),
          innerHeight: dimensions.height - (this.horizontalScrollActive ? fakeBarHeight : 0)
        };
      }
      $.extend(resultDimensions, {
        width: resultDimensions.innerWidth - paddingWidth,
        height: resultDimensions.innerHeight - paddingHeight
      });
      return resultDimensions;
    },
    rebuildScrollbars: function() {
      // resize wrapper according to real element styles
      this.containerDimensions = this.getContainerDimensions();
      this.embeddedDimensions = this.getEmbeddedDimensions(this.containerDimensions);

      // resize wrapper to desired dimensions
      this.scrollWrapper.css({
        width: this.containerDimensions.width,
        height: this.containerDimensions.height
      });

      // resize element inside wrapper excluding scrollbar size
      this.realElement.css({
        overflow: 'hidden',
        width: this.embeddedDimensions.width,
        height: this.embeddedDimensions.height
      });

      // redraw scrollbar offset
      this.redrawScrollbars();
    },
    redrawScrollbars: function() {
      var viewSize, maxScrollValue;

      // redraw vertical scrollbar
      if (this.verticalScrollActive) {
        viewSize = this.vBarEdge ? this.containerDimensions.height - this.vBarEdge : this.embeddedDimensions.innerHeight;
        maxScrollValue = Math.max(this.realElement.prop('offsetHeight'), this.realElement.prop('scrollHeight')) - this.vBarEdge;

        this.vBar.show().setMaxValue(maxScrollValue - viewSize).setRatio(viewSize / maxScrollValue).setSize(viewSize);
        this.vBar.setValue(this.realElement.scrollTop());
      } else {
        this.vBar.hide();
      }

      // redraw horizontal scrollbar
      if (this.horizontalScrollActive) {
        viewSize = this.embeddedDimensions.innerWidth;
        maxScrollValue = this.realElement.prop('scrollWidth');

        if (maxScrollValue === viewSize) {
          this.horizontalScrollActive = false;
        }
        this.hBar.show().setMaxValue(maxScrollValue - viewSize).setRatio(viewSize / maxScrollValue).setSize(viewSize);
        this.hBar.setValue(this.realElement.scrollLeft());
      } else {
        this.hBar.hide();
      }

      // set "touch-action" style rule
      var touchAction = '';
      if (this.verticalScrollActive && this.horizontalScrollActive) {
        touchAction = 'none';
      } else if (this.verticalScrollActive) {
        touchAction = 'pan-x';
      } else if (this.horizontalScrollActive) {
        touchAction = 'pan-y';
      }
      // this.realElement.css('touchAction', touchAction);
    },
    refresh: function() {
      this.rebuildScrollbars();
    },
    destroy: function() {
      // remove event listeners
      this.win.off('resize orientationchange load', this.onResize);
      this.realElement.off({
        'jcf-mousewheel': this.onMouseWheel,
        'jcf-pointerdown': this.onTouchBody
      });
      this.doc.off({
        'jcf-pointermove': this.onMoveBody,
        'jcf-pointerup': this.onReleaseBody
      });

      // restore structure
      this.saveScrollOffsets();
      this.vBar.destroy();
      this.hBar.destroy();
      this.realElement.insertAfter(this.scrollWrapper).css({
        touchAction: '',
        overflow: '',
        width: '',
        height: ''
      });
      this.scrollWrapper.remove();
      this.restoreScrollOffsets();
    }
  });

  // custom scrollbar
  function ScrollBar(options) {
    this.options = $.extend({
      holder: null,
      vertical: true,
      inactiveClass: 'jcf-inactive',
      verticalClass: 'jcf-scrollbar-vertical',
      horizontalClass: 'jcf-scrollbar-horizontal',
      scrollbarStructure: '<div class="jcf-scrollbar"><div class="jcf-scrollbar-dec"></div><div class="jcf-scrollbar-slider"><div class="jcf-scrollbar-handle"></div></div><div class="jcf-scrollbar-inc"></div></div>',
      btnDecSelector: '.jcf-scrollbar-dec',
      btnIncSelector: '.jcf-scrollbar-inc',
      sliderSelector: '.jcf-scrollbar-slider',
      handleSelector: '.jcf-scrollbar-handle',
      scrollInterval: 300,
      scrollStep: 400 // px/sec
    }, options);
    this.init();
  }
  $.extend(ScrollBar.prototype, {
    init: function() {
      this.initStructure();
      this.attachEvents();
    },
    initStructure: function() {
      // define proporties
      this.doc = $(document);
      this.isVertical = !!this.options.vertical;
      this.sizeProperty = this.isVertical ? 'height' : 'width';
      this.fullSizeProperty = this.isVertical ? 'outerHeight' : 'outerWidth';
      this.invertedSizeProperty = this.isVertical ? 'width' : 'height';
      this.thicknessMeasureMethod = 'outer' + this.invertedSizeProperty.charAt(0).toUpperCase() + this.invertedSizeProperty.substr(1);
      this.offsetProperty = this.isVertical ? 'top' : 'left';
      this.offsetEventProperty = this.isVertical ? 'pageY' : 'pageX';

      // initialize variables
      this.value = this.options.value || 0;
      this.maxValue = this.options.maxValue || 0;
      this.currentSliderSize = 0;
      this.handleSize = 0;

      // find elements
      this.holder = $(this.options.holder);
      this.scrollbar = $(this.options.scrollbarStructure).appendTo(this.holder);
      this.btnDec = this.scrollbar.find(this.options.btnDecSelector);
      this.btnInc = this.scrollbar.find(this.options.btnIncSelector);
      this.slider = this.scrollbar.find(this.options.sliderSelector);
      this.handle = this.slider.find(this.options.handleSelector);

      // set initial styles
      this.scrollbar.addClass(this.isVertical ? this.options.verticalClass : this.options.horizontalClass).css({
        touchAction: this.isVertical ? 'pan-x' : 'pan-y',
        position: 'absolute'
      });
      this.slider.css({
        position: 'relative'
      });
      this.handle.css({
        touchAction: 'none',
        position: 'absolute'
      });
    },
    attachEvents: function() {
      this.bindHandlers();
      this.handle.on('jcf-pointerdown', this.onHandlePress);
      this.slider.add(this.btnDec).add(this.btnInc).on('jcf-pointerdown', this.onButtonPress);
    },
    onHandlePress: function(e) {
      if (e.pointerType === 'mouse' && e.button > 1) {
        return;
      } else {
        e.preventDefault();
        this.handleDragActive = true;
        this.sliderOffset = this.slider.offset()[this.offsetProperty];
        this.innerHandleOffset = e[this.offsetEventProperty] - this.handle.offset()[this.offsetProperty];

        this.doc.on('jcf-pointermove', this.onHandleDrag);
        this.doc.on('jcf-pointerup', this.onHandleRelease);
      }
    },
    onHandleDrag: function(e) {
      e.preventDefault();
      this.calcOffset = e[this.offsetEventProperty] - this.sliderOffset - this.innerHandleOffset;
      this.setValue(this.calcOffset / (this.currentSliderSize - this.handleSize) * this.maxValue);
      this.triggerScrollEvent(this.value);
    },
    onHandleRelease: function() {
      this.handleDragActive = false;
      this.doc.off('jcf-pointermove', this.onHandleDrag);
      this.doc.off('jcf-pointerup', this.onHandleRelease);
    },
    onButtonPress: function(e) {
      var direction, clickOffset;
      if (e.pointerType === 'mouse' && e.button > 1) {
        return;
      } else {
        e.preventDefault();
        if (!this.handleDragActive) {
          if (this.slider.is(e.currentTarget)) {
            // slider pressed
            direction = this.handle.offset()[this.offsetProperty] > e[this.offsetEventProperty] ? -1 : 1;
            clickOffset = e[this.offsetEventProperty] - this.slider.offset()[this.offsetProperty];
            this.startPageScrolling(direction, clickOffset);
          } else {
            // scrollbar buttons pressed
            direction = this.btnDec.is(e.currentTarget) ? -1 : 1;
            this.startSmoothScrolling(direction);
          }
          this.doc.on('jcf-pointerup', this.onButtonRelease);
        }
      }
    },
    onButtonRelease: function() {
      this.stopPageScrolling();
      this.stopSmoothScrolling();
      this.doc.off('jcf-pointerup', this.onButtonRelease);
    },
    startPageScrolling: function(direction, clickOffset) {
      var self = this,
        stepValue = direction * self.currentSize;

      // limit checker
      var isFinishedScrolling = function() {
        var handleTop = (self.value / self.maxValue) * (self.currentSliderSize - self.handleSize);

        if (direction > 0) {
          return handleTop + self.handleSize >= clickOffset;
        } else {
          return handleTop <= clickOffset;
        }
      };

      // scroll by page when track is pressed
      var doPageScroll = function() {
        self.value += stepValue;
        self.setValue(self.value);
        self.triggerScrollEvent(self.value);

        if (isFinishedScrolling()) {
          clearInterval(self.pageScrollTimer);
        }
      };

      // start scrolling
      this.pageScrollTimer = setInterval(doPageScroll, this.options.scrollInterval);
      doPageScroll();
    },
    stopPageScrolling: function() {
      clearInterval(this.pageScrollTimer);
    },
    startSmoothScrolling: function(direction) {
      var self = this, dt;
      this.stopSmoothScrolling();

      // simple animation functions
      var raf = window.requestAnimationFrame || function(func) {
        setTimeout(func, 16);
      };
      var getTimestamp = function() {
        return Date.now ? Date.now() : new Date().getTime();
      };

      // set animation limit
      var isFinishedScrolling = function() {
        if (direction > 0) {
          return self.value >= self.maxValue;
        } else {
          return self.value <= 0;
        }
      };

      // animation step
      var doScrollAnimation = function() {
        var stepValue = (getTimestamp() - dt) / 1000 * self.options.scrollStep;

        if (self.smoothScrollActive) {
          self.value += stepValue * direction;
          self.setValue(self.value);
          self.triggerScrollEvent(self.value);

          if (!isFinishedScrolling()) {
            dt = getTimestamp();
            raf(doScrollAnimation);
          }
        }
      };

      // start animation
      self.smoothScrollActive = true;
      dt = getTimestamp();
      raf(doScrollAnimation);
    },
    stopSmoothScrolling: function() {
      this.smoothScrollActive = false;
    },
    triggerScrollEvent: function(scrollValue) {
      if (this.options.onScroll) {
        this.options.onScroll(scrollValue);
      }
    },
    getThickness: function() {
      return this.scrollbar[this.thicknessMeasureMethod]();
    },
    setSize: function(size) {
      // resize scrollbar
      var btnDecSize = this.btnDec[this.fullSizeProperty](),
        btnIncSize = this.btnInc[this.fullSizeProperty]();

      // resize slider
      this.currentSize = size;
      this.currentSliderSize = size - btnDecSize - btnIncSize;
      this.scrollbar.css(this.sizeProperty, size);
      this.slider.css(this.sizeProperty, this.currentSliderSize);
      this.currentSliderSize = this.slider[this.sizeProperty]();

      // resize handle
      this.handleSize = Math.round(this.currentSliderSize * this.ratio);
      this.handle.css(this.sizeProperty, this.handleSize);
      this.handleSize = this.handle[this.fullSizeProperty]();

      return this;
    },
    setRatio: function(ratio) {
      this.ratio = ratio;
      return this;
    },
    setMaxValue: function(maxValue) {
      this.maxValue = maxValue;
      this.setValue(Math.min(this.value, this.maxValue));
      return this;
    },
    setValue: function(value) {
      this.value = value;
      if (this.value < 0) {
        this.value = 0;
      } else if (this.value > this.maxValue) {
        this.value = this.maxValue;
      }
      this.refresh();
    },
    setPosition: function(styles) {
      this.scrollbar.css(styles);
      return this;
    },
    hide: function() {
      this.scrollbar.detach();
      return this;
    },
    show: function() {
      this.scrollbar.appendTo(this.holder);
      return this;
    },
    refresh: function() {
      // recalculate handle position
      if (this.value === 0 || this.maxValue === 0) {
        this.calcOffset = 0;
      } else {
        this.calcOffset = (this.value / this.maxValue) * (this.currentSliderSize - this.handleSize);
      }
      this.handle.css(this.offsetProperty, this.calcOffset);

      // toggle inactive classes
      this.btnDec.toggleClass(this.options.inactiveClass, this.value === 0);
      this.btnInc.toggleClass(this.options.inactiveClass, this.value === this.maxValue);
      this.scrollbar.toggleClass(this.options.inactiveClass, this.maxValue === 0);
    },
    destroy: function() {
      // remove event handlers and scrollbar block itself
      this.btnDec.add(this.btnInc).off('jcf-pointerdown', this.onButtonPress);
      this.handle.off('jcf-pointerdown', this.onHandlePress);
      this.doc.off('jcf-pointermove', this.onHandleDrag);
      this.doc.off('jcf-pointerup', this.onHandleRelease);
      this.doc.off('jcf-pointerup', this.onButtonRelease);
      this.stopSmoothScrolling();
      this.stopPageScrolling();
      this.scrollbar.remove();
    }
  });

}(jQuery, this));
 

 /*!
 * JavaScript Custom Forms : Range Module
 *
 
 *
 * Version: 1.1.3
 */
;(function($) {
  'use strict';

  jcf.addModule({
    name: 'Range',
    selector: 'input[type="range"]',
    options: {
      realElementClass: 'jcf-real-element',
      fakeStructure: '<span class="jcf-range"><span class="jcf-range-wrapper"><span class="jcf-range-track"><span class="jcf-range-handle"></span></span></span></span>',
      dataListMark: '<span class="jcf-range-mark"></span>',
      rangeDisplayWrapper: '<span class="jcf-range-display-wrapper"></span>',
      rangeDisplay: '<span class="jcf-range-display"></span>',
      handleSelector: '.jcf-range-handle',
      trackSelector: '.jcf-range-track',
      activeHandleClass: 'jcf-active-handle',
      verticalClass: 'jcf-vertical',
      orientation: 'horizontal',
      range: false, // or "min", "max", "all"
      dragHandleCenter: true,
      snapToMarks: true,
      snapRadius: 5
    },
    matchElement: function(element) {
      return element.is(this.selector);
    },
    init: function() {
      this.initStructure();
      this.attachEvents();
      this.refresh();
    },
    initStructure: function() {
      this.page = $('html');
      this.realElement = $(this.options.element).addClass(this.options.hiddenClass);
      this.fakeElement = $(this.options.fakeStructure).insertBefore(this.realElement).prepend(this.realElement);
      this.track = this.fakeElement.find(this.options.trackSelector);
      this.trackHolder = this.track.parent();
      this.handle = this.fakeElement.find(this.options.handleSelector);
      this.createdHandleCount = 0;
      this.activeDragHandleIndex = 0;
      this.isMultiple = this.realElement.prop('multiple') || typeof this.realElement.attr('multiple') === 'string';
      this.values = this.isMultiple ? this.realElement.attr('value').split(',') : [this.realElement.val()];
      this.handleCount = this.isMultiple ? this.values.length : 1;

      // create range display
      this.rangeDisplayWrapper = $(this.options.rangeDisplayWrapper).insertBefore(this.track);
      if (this.options.range === 'min' || this.options.range === 'all') {
        this.rangeMin = $(this.options.rangeDisplay).addClass('jcf-range-min').prependTo(this.rangeDisplayWrapper);
      }
      if (this.options.range === 'max' || this.options.range === 'all') {
        this.rangeMax = $(this.options.rangeDisplay).addClass('jcf-range-max').prependTo(this.rangeDisplayWrapper);
      }

      // clone handles if needed
      while (this.createdHandleCount < this.handleCount) {
        this.createdHandleCount++;
        this.handle.clone().addClass('jcf-index-' + this.createdHandleCount).insertBefore(this.handle);

        // create mid ranges
        if (this.createdHandleCount > 1) {
          if (!this.rangeMid) {
            this.rangeMid = $();
          }
          this.rangeMid = this.rangeMid.add($(this.options.rangeDisplay).addClass('jcf-range-mid').prependTo(this.rangeDisplayWrapper));
        }
      }

      // grab all handles
      this.handle.detach();
      this.handle = null;
      this.handles = this.fakeElement.find(this.options.handleSelector);
      this.handles.eq(0).addClass(this.options.activeHandleClass);

      // handle orientation
      this.isVertical = (this.options.orientation === 'vertical');
      this.directionProperty = this.isVertical ? 'top' : 'left';
      this.offsetProperty = this.isVertical ? 'bottom' : 'left';
      this.eventProperty = this.isVertical ? 'pageY' : 'pageX';
      this.sizeProperty = this.isVertical ? 'height' : 'width';
      this.sizeMethod = this.isVertical ? 'innerHeight' : 'innerWidth';
      this.fakeElement.css('touchAction', this.isVertical ? 'pan-x' : 'pan-y');
      if (this.isVertical) {
        this.fakeElement.addClass(this.options.verticalClass);
      }

      // set initial values
      this.minValue = parseFloat(this.realElement.attr('min'));
      this.maxValue = parseFloat(this.realElement.attr('max'));
      this.stepValue = parseFloat(this.realElement.attr('step')) || 1;

      // check attribute values
      this.minValue = isNaN(this.minValue) ? 0 : this.minValue;
      this.maxValue = isNaN(this.maxValue) ? 100 : this.maxValue;

      // handle range
      if (this.stepValue !== 1) {
        this.maxValue -= (this.maxValue - this.minValue) % this.stepValue;
      }
      this.stepsCount = (this.maxValue - this.minValue) / this.stepValue;
      this.createDataList();
    },
    attachEvents: function() {
      this.realElement.on({
        focus: this.onFocus
      });
      this.trackHolder.on('jcf-pointerdown', this.onTrackPress);
      this.handles.on('jcf-pointerdown', this.onHandlePress);
    },
    createDataList: function() {
      var self = this,
        dataValues = [],
        dataListId = this.realElement.attr('list');

      if (dataListId) {
        $('#' + dataListId).find('option').each(function() {
          var itemValue = parseFloat(this.value || this.innerHTML),
            mark, markOffset;

          if (!isNaN(itemValue)) {
            markOffset = self.valueToOffset(itemValue);
            dataValues.push({
              value: itemValue,
              offset: markOffset
            });
            mark = $(self.options.dataListMark).text(itemValue).attr({
              'data-mark-value': itemValue
            }).css(self.offsetProperty, markOffset + '%').appendTo(self.track);
          }
        });
        if (dataValues.length) {
          self.dataValues = dataValues;
        }
      }
    },
    getDragHandleRange: function(handleIndex) {
      // calculate range for slider with multiple handles
      var minStep = -Infinity,
        maxStep = Infinity;

      if (handleIndex > 0) {
        minStep = this.valueToStepIndex(this.values[handleIndex - 1]);
      }
      if (handleIndex < this.handleCount - 1) {
        maxStep = this.valueToStepIndex(this.values[handleIndex + 1]);
      }

      return {
        minStepIndex: minStep,
        maxStepIndex: maxStep
      };
    },
    getNearestHandle: function(percent) {
      // handle vertical sliders
      if (this.isVertical) {
        percent = 1 - percent;
      }

      // detect closest handle when track is pressed
      var closestHandle = this.handles.eq(0),
        closestDistance = Infinity,
        self = this;

      if (this.handleCount > 1) {
        this.handles.each(function() {
          var handleOffset = parseFloat(this.style[self.offsetProperty]) / 100,
            handleDistance = Math.abs(handleOffset - percent);

          if (handleDistance < closestDistance) {
            closestDistance = handleDistance;
            closestHandle = $(this);
          }
        });
      }
      return closestHandle;
    },
    onTrackPress: function(e) {
      var trackSize, trackOffset, innerOffset;

      e.preventDefault();
      if (!this.realElement.is(':disabled') && !this.activeDragHandle) {
        trackSize = this.track[this.sizeMethod]();
        trackOffset = this.track.offset()[this.directionProperty];
        this.activeDragHandle = this.getNearestHandle((e[this.eventProperty] - trackOffset) / this.trackHolder[this.sizeMethod]());
        this.activeDragHandleIndex = this.handles.index(this.activeDragHandle);
        this.handles.removeClass(this.options.activeHandleClass).eq(this.activeDragHandleIndex).addClass(this.options.activeHandleClass);
        innerOffset = this.activeDragHandle[this.sizeMethod]() / 2;

        this.dragData = {
          trackSize: trackSize,
          innerOffset: innerOffset,
          trackOffset: trackOffset,
          min: trackOffset,
          max: trackOffset + trackSize
        };
        this.page.on({
          'jcf-pointermove': this.onHandleMove,
          'jcf-pointerup': this.onHandleRelease
        });

        if (e.pointerType === 'mouse') {
          this.realElement.focus();
        }

        this.onHandleMove(e);
      }
    },
    onHandlePress: function(e) {
      var trackSize, trackOffset, innerOffset;

      e.preventDefault();
      if (!this.realElement.is(':disabled') && !this.activeDragHandle) {
        this.activeDragHandle = $(e.currentTarget);
        this.activeDragHandleIndex = this.handles.index(this.activeDragHandle);
        this.handles.removeClass(this.options.activeHandleClass).eq(this.activeDragHandleIndex).addClass(this.options.activeHandleClass);
        trackSize = this.track[this.sizeMethod]();
        trackOffset = this.track.offset()[this.directionProperty];
        innerOffset = this.options.dragHandleCenter ? this.activeDragHandle[this.sizeMethod]() / 2 : e[this.eventProperty] - this.handle.offset()[this.directionProperty];

        this.dragData = {
          trackSize: trackSize,
          innerOffset: innerOffset,
          trackOffset: trackOffset,
          min: trackOffset,
          max: trackOffset + trackSize
        };
        this.page.on({
          'jcf-pointermove': this.onHandleMove,
          'jcf-pointerup': this.onHandleRelease
        });

        if (e.pointerType === 'mouse') {
          this.realElement.focus();
        }
      }
    },
    onHandleMove: function(e) {
      var self = this,
        newOffset, dragPercent, stepIndex, valuePercent, handleDragRange;

      // calculate offset
      if (this.isVertical) {
        newOffset = this.dragData.max + (this.dragData.min - e[this.eventProperty]) - this.dragData.innerOffset;
      } else {
        newOffset = e[this.eventProperty] - this.dragData.innerOffset;
      }

      // fit in range
      if (newOffset < this.dragData.min) {
        newOffset = this.dragData.min;
      } else if (newOffset > this.dragData.max) {
        newOffset = this.dragData.max;
      }

      e.preventDefault();
      if (this.options.snapToMarks && this.dataValues) {
        // snap handle to marks
        var dragOffset = newOffset - this.dragData.trackOffset;
        dragPercent = (newOffset - this.dragData.trackOffset) / this.dragData.trackSize * 100;

        $.each(this.dataValues, function(index, item) {
          var markOffset = item.offset / 100 * self.dragData.trackSize,
            markMin = markOffset - self.options.snapRadius,
            markMax = markOffset + self.options.snapRadius;

          if (dragOffset >= markMin && dragOffset <= markMax) {
            dragPercent = item.offset;
            return false;
          }
        });
      } else {
        // snap handle to steps
        dragPercent = (newOffset - this.dragData.trackOffset) / this.dragData.trackSize * 100;
      }

      // move handle only in range
      stepIndex = Math.round(dragPercent * this.stepsCount / 100);
      if (this.handleCount > 1) {
        handleDragRange = this.getDragHandleRange(this.activeDragHandleIndex);
        if (stepIndex < handleDragRange.minStepIndex) {
          stepIndex = Math.max(handleDragRange.minStepIndex, stepIndex);
        } else if (stepIndex > handleDragRange.maxStepIndex) {
          stepIndex = Math.min(handleDragRange.maxStepIndex, stepIndex);
        }
      }
      valuePercent = stepIndex * (100 / this.stepsCount);

      if (this.dragData.stepIndex !== stepIndex) {
        this.dragData.stepIndex = stepIndex;
        this.dragData.offset = valuePercent;
        this.activeDragHandle.css(this.offsetProperty, this.dragData.offset + '%');

        // update value(s) and trigger "input" event
        this.values[this.activeDragHandleIndex] = '' + this.stepIndexToValue(stepIndex);
        this.updateValues();
        this.realElement.trigger('input');
      }
    },
    onHandleRelease: function() {
      var newValue;
      if (typeof this.dragData.offset === 'number') {
        newValue = this.stepIndexToValue(this.dragData.stepIndex);
        this.realElement.val(newValue).trigger('change');
      }

      this.page.off({
        'jcf-pointermove': this.onHandleMove,
        'jcf-pointerup': this.onHandleRelease
      });
      delete this.activeDragHandle;
      delete this.dragData;
    },
    onFocus: function() {
      if (!this.fakeElement.hasClass(this.options.focusClass)) {
        this.fakeElement.addClass(this.options.focusClass);
        this.realElement.on({
          blur: this.onBlur,
          keydown: this.onKeyPress
        });
      }
    },
    onBlur: function() {
      this.fakeElement.removeClass(this.options.focusClass);
      this.realElement.off({
        blur: this.onBlur,
        keydown: this.onKeyPress
      });
    },
    onKeyPress: function(e) {
      var incValue = (e.which === 38 || e.which === 39),
        decValue = (e.which === 37 || e.which === 40);

      // handle TAB key in slider with multiple handles
      if (e.which === 9 && this.handleCount > 1) {
        if (e.shiftKey && this.activeDragHandleIndex > 0) {
          this.activeDragHandleIndex--;
        } else if (!e.shiftKey && this.activeDragHandleIndex < this.handleCount - 1) {
          this.activeDragHandleIndex++;
        } else {
          return;
        }
        e.preventDefault();
        this.handles.removeClass(this.options.activeHandleClass).eq(this.activeDragHandleIndex).addClass(this.options.activeHandleClass);
      }

      // handle cursor keys
      if (decValue || incValue) {
        e.preventDefault();
        this.step(incValue ? this.stepValue : -this.stepValue);
      }
    },
    updateValues: function() {
      var value = this.values.join(',');
      if (this.values.length > 1) {
        this.realElement.prop('valueLow', this.values[0]);
        this.realElement.prop('valueHigh', this.values[this.values.length - 1]);
        this.realElement.val(value);

        // if browser does not accept multiple values set only one
        if (this.realElement.val() !== value) {
          this.realElement.val(this.values[this.values.length - 1]);
        }
      } else {
        this.realElement.val(value);
      }

      this.updateRanges();
    },
    updateRanges: function() {
      // update display ranges
      var self = this,
        handle;

      if (this.rangeMin) {
        handle = this.handles[0];
        this.rangeMin.css(this.offsetProperty, 0).css(this.sizeProperty, handle.style[this.offsetProperty]);
      }
      if (this.rangeMax) {
        handle = this.handles[this.handles.length - 1];
        this.rangeMax.css(this.offsetProperty, handle.style[this.offsetProperty]).css(this.sizeProperty, 100 - parseFloat(handle.style[this.offsetProperty]) + '%');
      }
      if (this.rangeMid) {
        this.handles.each(function(index, curHandle) {
          var prevHandle, midBox;
          if (index > 0) {
            prevHandle = self.handles[index - 1];
            midBox = self.rangeMid[index - 1];
            midBox.style[self.offsetProperty] = prevHandle.style[self.offsetProperty];
            midBox.style[self.sizeProperty] = parseFloat(curHandle.style[self.offsetProperty]) - parseFloat(prevHandle.style[self.offsetProperty]) + '%';
          }
        });
      }
    },
    step: function(changeValue) {
      var originalValue = parseFloat(this.values[this.activeDragHandleIndex || 0]),
        newValue = originalValue,
        minValue = this.minValue,
        maxValue = this.maxValue;

      if (isNaN(originalValue)) {
        newValue = 0;
      }

      newValue += changeValue;

      if (this.handleCount > 1) {
        if (this.activeDragHandleIndex > 0) {
          minValue = parseFloat(this.values[this.activeDragHandleIndex - 1]);
        }
        if (this.activeDragHandleIndex < this.handleCount - 1) {
          maxValue = parseFloat(this.values[this.activeDragHandleIndex + 1]);
        }
      }

      if (newValue > maxValue) {
        newValue = maxValue;
      } else if (newValue < minValue) {
        newValue = minValue;
      }

      if (newValue !== originalValue) {
        this.values[this.activeDragHandleIndex || 0] = '' + newValue;
        this.updateValues();
        this.realElement.trigger('input').trigger('change');
        this.setSliderValue(this.values);
      }
    },
    valueToStepIndex: function(value) {
      return (value - this.minValue) / this.stepValue;
    },
    stepIndexToValue: function(stepIndex) {
      return this.minValue + this.stepValue * stepIndex;
    },
    valueToOffset: function(value) {
      var range = this.maxValue - this.minValue,
        percent = (value - this.minValue) / range;

      return percent * 100;
    },
    getSliderValue: function() {
      return $.map(this.values, function(value) {
        return parseFloat(value) || 0;
      });
    },
    setSliderValue: function(values) {
      // set handle position accordion according to value
      var self = this;
      this.handles.each(function(index, handle) {
        handle.style[self.offsetProperty] = self.valueToOffset(values[index]) + '%';
      });
    },
    refresh: function() {
      // handle disabled state
      var isDisabled = this.realElement.is(':disabled');
      this.fakeElement.toggleClass(this.options.disabledClass, isDisabled);

      // refresh handle position according to current value
      this.setSliderValue(this.getSliderValue());
      this.updateRanges();
    },
    destroy: function() {
      this.realElement.removeClass(this.options.hiddenClass).insertBefore(this.fakeElement);
      this.fakeElement.remove();

      this.realElement.off({
        keydown: this.onKeyPress,
        focus: this.onFocus,
        blur: this.onBlur
      });
    }
  });

}(jQuery));
 

 /*!
 * JavaScript Custom Forms : Number Module
 *
 
 *
 * Version: 1.1.3
 */
;(function($) {
  'use strict';

  jcf.addModule({
    name: 'Number',
    selector: 'input[type="number"]',
    options: {
      realElementClass: 'jcf-real-element',
      fakeStructure: '<span class="jcf-number"><span class="jcf-btn-inc"></span><span class="jcf-btn-dec"></span></span>',
      btnIncSelector: '.jcf-btn-inc',
      btnDecSelector: '.jcf-btn-dec',
      pressInterval: 150
    },
    matchElement: function(element) {
      return element.is(this.selector);
    },
    init: function() {
      this.initStructure();
      this.attachEvents();
      this.refresh();
    },
    initStructure: function() {
      this.page = $('html');
      this.realElement = $(this.options.element).addClass(this.options.realElementClass);
      this.fakeElement = $(this.options.fakeStructure).insertBefore(this.realElement).prepend(this.realElement);
      this.btnDec = this.fakeElement.find(this.options.btnDecSelector);
      this.btnInc = this.fakeElement.find(this.options.btnIncSelector);

      // set initial values
      this.initialValue = parseFloat(this.realElement.val()) || 0;
      this.minValue = parseFloat(this.realElement.attr('min'));
      this.maxValue = parseFloat(this.realElement.attr('max'));
      this.stepValue = parseFloat(this.realElement.attr('step')) || 1;

      // check attribute values
      this.minValue = isNaN(this.minValue) ? -Infinity : this.minValue;
      this.maxValue = isNaN(this.maxValue) ? Infinity : this.maxValue;

      // handle range
      if (isFinite(this.maxValue)) {
        this.maxValue -= (this.maxValue - this.minValue) % this.stepValue;
      }
    },
    attachEvents: function() {
      this.realElement.on({
        focus: this.onFocus
      });
      this.btnDec.add(this.btnInc).on('jcf-pointerdown', this.onBtnPress);
    },
    onBtnPress: function(e) {
      var self = this,
        increment;

      if (!this.realElement.is(':disabled')) {
        increment = this.btnInc.is(e.currentTarget);

        self.step(increment);
        clearInterval(this.stepTimer);
        this.stepTimer = setInterval(function() {
          self.step(increment);
        }, this.options.pressInterval);

        this.page.on('jcf-pointerup', this.onBtnRelease);
      }
    },
    onBtnRelease: function() {
      clearInterval(this.stepTimer);
      this.page.off('jcf-pointerup', this.onBtnRelease);
    },
    onFocus: function() {
      this.fakeElement.addClass(this.options.focusClass);
      this.realElement.on({
        blur: this.onBlur,
        keydown: this.onKeyPress
      });
    },
    onBlur: function() {
      this.fakeElement.removeClass(this.options.focusClass);
      this.realElement.off({
        blur: this.onBlur,
        keydown: this.onKeyPress
      });
    },
    onKeyPress: function(e) {
      if (e.which === 38 || e.which === 40) {
        e.preventDefault();
        this.step(e.which === 38);
      }
    },
    step: function(increment) {
      var originalValue = parseFloat(this.realElement.val()),
        newValue = originalValue || 0,
        addValue = this.stepValue * (increment ? 1 : -1),
        edgeNumber = isFinite(this.minValue) ? this.minValue : this.initialValue - Math.abs(newValue * this.stepValue),
        diff = Math.abs(edgeNumber - newValue) % this.stepValue;

      // handle step diff
      if (diff) {
        if (increment) {
          newValue += addValue - diff;
        } else {
          newValue -= diff;
        }
      } else {
        newValue += addValue;
      }

      // handle min/max limits
      if (newValue < this.minValue) {
        newValue = this.minValue;
      } else if (newValue > this.maxValue) {
        newValue = this.maxValue;
      }

      // update value in real input if its changed
      if (newValue !== originalValue) {
        this.realElement.val(newValue).trigger('change');
        this.refresh();
      }
    },
    refresh: function() {
      var isDisabled = this.realElement.is(':disabled'),
        currentValue = parseFloat(this.realElement.val());

      // handle disabled state
      this.fakeElement.toggleClass(this.options.disabledClass, isDisabled);

      // refresh button classes
      this.btnDec.toggleClass(this.options.disabledClass, currentValue === this.minValue);
      this.btnInc.toggleClass(this.options.disabledClass, currentValue === this.maxValue);
    },
    destroy: function() {
      // restore original structure
      this.realElement.removeClass(this.options.realElementClass).insertBefore(this.fakeElement);
      this.fakeElement.remove();
      clearInterval(this.stepTimer);

      // remove event handlers
      this.page.off('jcf-pointerup', this.onBtnRelease);
      this.realElement.off({
        keydown: this.onKeyPress,
        focus: this.onFocus,
        blur: this.onBlur
      });
    }
  });

}(jQuery));
 

 /*!
 * JavaScript Custom Forms : Textarea Module
 *
 
 *
 * Version: 1.1.3
 */
;(function($) {
  'use strict';

  jcf.addModule({
    name: 'Textarea',
    selector: 'textarea',
    options: {
      resize: true,
      resizerStructure: '<span class="jcf-resize"></span>',
      fakeStructure: '<span class="jcf-textarea"></span>'
    },
    matchElement: function(element) {
      return element.is('textarea');
    },
    init: function() {
      this.initStructure();
      this.attachEvents();
      this.refresh();
    },
    initStructure: function() {
      // prepare structure
      this.doc = $(document);
      this.realElement = $(this.options.element);
      this.fakeElement = $(this.options.fakeStructure).insertAfter(this.realElement);
      this.resizer = $(this.options.resizerStructure).appendTo(this.fakeElement);

      // add custom scrollbar
      if (jcf.modules.Scrollable) {
        this.realElement.prependTo(this.fakeElement).addClass().css({
          overflow: 'hidden',
          resize: 'none'
        });

        this.scrollable = new jcf.modules.Scrollable({
          element: this.realElement,
          alwaysShowScrollbars: true
        });
        this.scrollable.setScrollBarEdge(this.resizer.outerHeight());
      }
    },
    attachEvents: function() {
      // add event handlers
      this.realElement.on({
        focus: this.onFocus,
        keyup: this.onChange,
        change: this.onChange
      });

      this.resizer.on('jcf-pointerdown', this.onResizePress);
    },
    onResizePress: function(e) {
      var resizerOffset = this.resizer.offset(),
        areaOffset = this.fakeElement.offset();

      e.preventDefault();
      this.dragData = {
        areaOffset: areaOffset,
        innerOffsetLeft: e.pageX - resizerOffset.left,
        innerOffsetTop: e.pageY - resizerOffset.top
      };
      this.doc.on({
        'jcf-pointermove': this.onResizeMove,
        'jcf-pointerup': this.onResizeRelease
      });

      // restore focus
      if (this.isFocused) {
        this.focusedDrag = true;
        this.realElement.focus();
      }
    },
    onResizeMove: function(e) {
      var newWidth = e.pageX + this.dragData.innerOffsetLeft - this.dragData.areaOffset.left,
        newHeight = e.pageY + this.dragData.innerOffsetTop - this.dragData.areaOffset.top,
        widthDiff = this.fakeElement.innerWidth() - this.realElement.innerWidth();

      // prevent text selection or page scroll on touch devices
      e.preventDefault();

      // resize textarea and refresh scrollbars
      this.realElement.innerWidth(newWidth - widthDiff).innerHeight(newHeight);

      if (this.scrollable) {
        this.scrollable.rebuildScrollbars();
      }

      // restore focus
      if (this.focusedDrag) {
        this.realElement.focus();
      }
    },
    onResizeRelease: function() {
      this.doc.off({
        'jcf-pointermove': this.onResizeMove,
        'jcf-pointerup': this.onResizeRelease
      });

      delete this.focusedDrag;
    },
    onFocus: function() {
      this.isFocused = true;
      this.fakeElement.addClass(this.options.focusClass);
      this.realElement.on('blur', this.onBlur);
    },
    onBlur: function() {
      this.isFocused = false;
      this.fakeElement.removeClass(this.options.focusClass);
      this.realElement.off('blur', this.onBlur);
    },
    onChange: function() {
      this.refreshCustomScrollbars();
    },
    refreshCustomScrollbars: function() {
      if (this.scrollable) {
        if (this.isFocused) {
          this.scrollable.redrawScrollbars();
        } else {
          this.scrollable.rebuildScrollbars();
        }
      }
    },
    refresh: function() {
      // refresh custom scroll position
      var isDisabled = this.realElement.is(':disabled');
      this.fakeElement.toggleClass(this.options.disabledClass, isDisabled);
      this.refreshCustomScrollbars();
    },
    destroy: function() {
      // destroy custom scrollbar
      this.scrollable.destroy();

      // restore styles and remove event listeners
      this.realElement.css({
        overflow: '',
        resize: ''
      }).insertBefore(this.fakeElement).off({
        focus: this.onFocus,
        blur: this.onBlur
      });

      // remove scrollbar and fake wrapper
      this.fakeElement.remove();
    }
  });

}(jQuery));



// navigation accesibility module
function TouchNav(opt) {
  this.options = {
    hoverClass: 'hover',
    menuItems: 'li',
    menuOpener: 'a',
    menuDrop: 'ul',
    navBlock: null
  };
  for(var p in opt) {
    if(opt.hasOwnProperty(p)) {
      this.options[p] = opt[p];
    }
  }
  this.init();
}
TouchNav.isActiveOn = function(elem) {
  return elem && elem.touchNavActive;
};
TouchNav.prototype = {
  init: function() {
    if(typeof this.options.navBlock === 'string') {
      this.menu = document.getElementById(this.options.navBlock);
    } else if(typeof this.options.navBlock === 'object') {
      this.menu = this.options.navBlock;
    }
    if(this.menu) {
      this.addEvents();
    }
  },
  addEvents: function() {
    // attach event handlers
    var self = this;
    var touchEvent = (navigator.pointerEnabled && 'pointerdown') || (navigator.msPointerEnabled && 'MSPointerDown') || (this.isTouchDevice && 'touchstart');
    this.menuItems = lib.queryElementsBySelector(this.options.menuItems, this.menu);

    var initMenuItem = function(item) {
      var currentDrop = lib.queryElementsBySelector(self.options.menuDrop, item)[0],
      currentOpener = lib.queryElementsBySelector(self.options.menuOpener, item)[0];

      // only for touch input devices
      if( currentDrop && currentOpener && (self.isTouchDevice || self.isPointerDevice) ) {
        lib.event.add(currentOpener, 'click', lib.bind(self.clickHandler, self));
        lib.event.add(currentOpener, 'mousedown', lib.bind(self.mousedownHandler, self));
        lib.event.add(currentOpener, touchEvent, function(e){
          if( !self.isTouchPointerEvent(e) ) {
            self.preventCurrentClick = false;
            return;
          }
          self.touchFlag = true;
          self.currentItem = item;
          self.currentLink = currentOpener;
          self.pressHandler.apply(self, arguments);
        });
      }
      // for desktop computers and touch devices
      lib.event.add(item, 'mouseover', function(){
        if(!self.touchFlag) {
          self.currentItem = item;
          self.mouseoverHandler();
        }
      });
      lib.event.add(item, 'mouseout', function(){
        if(!self.touchFlag) {
          self.currentItem = item;
          self.mouseoutHandler();
        }
      });
      item.touchNavActive = true;
    };

    // addd handlers for all menu items
    for(var i = 0; i < this.menuItems.length; i++) {
      initMenuItem(self.menuItems[i]);
    }

    // hide dropdowns when clicking outside navigation
    if(this.isTouchDevice || this.isPointerDevice) {
      lib.event.add(document.documentElement, 'mousedown', lib.bind(this.clickOutsideHandler, this));
      lib.event.add(document.documentElement, touchEvent, lib.bind(this.clickOutsideHandler, this));
    }
  },
  mousedownHandler: function(e) {
    if(this.touchFlag) {
      e.preventDefault();
      this.touchFlag = false;
      this.preventCurrentClick = false;
    }
  },
  mouseoverHandler: function() {
    lib.addClass(this.currentItem, this.options.hoverClass);
  },
  mouseoutHandler: function() {
    lib.removeClass(this.currentItem, this.options.hoverClass);
  },
  hideActiveDropdown: function() {
    for(var i = 0; i < this.menuItems.length; i++) {
      if(lib.hasClass(this.menuItems[i], this.options.hoverClass)) {
        lib.removeClass(this.menuItems[i], this.options.hoverClass);
      }
    }
    this.activeParent = null;
  },
  pressHandler: function(e) {
    // hide previous drop (if active)
    if(this.currentItem !== this.activeParent) {
      if(this.activeParent && this.currentItem.parentNode === this.activeParent.parentNode) {
        lib.removeClass(this.activeParent, this.options.hoverClass);
      } else if(!this.isParent(this.activeParent, this.currentLink)) {
        this.hideActiveDropdown();
      }
    }
    // handle current drop
    this.activeParent = this.currentItem;
    if(lib.hasClass(this.currentItem, this.options.hoverClass)) {
      this.preventCurrentClick = false;
    } else {
      e.preventDefault();
      this.preventCurrentClick = true;
      lib.addClass(this.currentItem, this.options.hoverClass);
    }
  },
  clickHandler: function(e) {
    // prevent first click on link
    if(this.preventCurrentClick) {
      e.preventDefault();
    }
  },
  clickOutsideHandler: function(event) {
    var e = event.changedTouches ? event.changedTouches[0] : event;
    if(this.activeParent && !this.isParent(this.menu, e.target)) {
      this.hideActiveDropdown();
      this.touchFlag = false;
    }
  },
  isParent: function(parent, child) {
    while(child.parentNode) {
      if(child.parentNode == parent) {
        return true;
      }
      child = child.parentNode;
    }
    return false;
  },
  isTouchPointerEvent: function(e) {
    return (e.type.indexOf('touch') > -1) ||
    (navigator.pointerEnabled && e.pointerType === 'touch') ||
    (navigator.msPointerEnabled && e.pointerType == e.MSPOINTER_TYPE_TOUCH);
  },
  isPointerDevice: (function() {
    return !!(navigator.pointerEnabled || navigator.msPointerEnabled);
  }()),
  isTouchDevice: (function() {
    return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
  }())
};

/*
 * Utility module
 */
 lib = {
  hasClass: function(el,cls) {
    return el && el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
  },
  addClass: function(el,cls) {
    if (el && !this.hasClass(el,cls)) el.className += " "+cls;
  },
  removeClass: function(el,cls) {
    if (el && this.hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
  },
  extend: function(obj) {
    for(var i = 1; i < arguments.length; i++) {
      for(var p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p)) {
          obj[p] = arguments[i][p];
        }
      }
    }
    return obj;
  },
  each: function(obj, callback) {
    var property, len;
    if(typeof obj.length === 'number') {
      for(property = 0, len = obj.length; property < len; property++) {
        if(callback.call(obj[property], property, obj[property]) === false) {
          break;
        }
      }
    } else {
      for(property in obj) {
        if(obj.hasOwnProperty(property)) {
          if(callback.call(obj[property], property, obj[property]) === false) {
            break;
          }
        }
      }
    }
  },
  event: (function() {
    var fixEvent = function(e) {
      e = e || window.event;
      if(e.isFixed) return e; else e.isFixed = true;
      if(!e.target) e.target = e.srcElement;
      e.preventDefault = e.preventDefault || function() {this.returnValue = false;};
      e.stopPropagation = e.stopPropagation || function() {this.cancelBubble = true;};
      return e;
    };
    return {
      add: function(elem, event, handler) {
        if(!elem.events) {
          elem.events = {};
          elem.handle = function(e) {
            var ret, handlers = elem.events[e.type];
            e = fixEvent(e);
            for(var i = 0, len = handlers.length; i < len; i++) {
              if(handlers[i]) {
                ret = handlers[i].call(elem, e);
                if(ret === false) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            }
          };
        }
        if(!elem.events[event]) {
          elem.events[event] = [];
          if(elem.addEventListener) elem.addEventListener(event, elem.handle, false);
          else if(elem.attachEvent) elem.attachEvent('on'+event, elem.handle);
        }
        elem.events[event].push(handler);
      },
      remove: function(elem, event, handler) {
        var handlers = elem.events[event];
        for(var i = handlers.length - 1; i >= 0; i--) {
          if(handlers[i] === handler) {
            handlers.splice(i,1);
          }
        }
        if(!handlers.length) {
          delete elem.events[event];
          if(elem.removeEventListener) elem.removeEventListener(event, elem.handle, false);
          else if(elem.detachEvent) elem.detachEvent('on'+event, elem.handle);
        }
      }
    };
  }()),
  queryElementsBySelector: function(selector, scope) {
    scope = scope || document;
    if(!selector) return [];
    if(selector === '>*') return scope.children;
    if(typeof document.querySelectorAll === 'function') {
      return scope.querySelectorAll(selector);
    }
    var selectors = selector.split(',');
    var resultList = [];
    for(var s = 0; s < selectors.length; s++) {
      var currentContext = [scope || document];
      var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
      for (var i = 0; i < tokens.length; i++) {
        token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
        if (token.indexOf('#') > -1) {
          var bits = token.split('#'), tagName = bits[0], id = bits[1];
          var element = document.getElementById(id);
          if (element && tagName && element.nodeName.toLowerCase() != tagName) {
            return [];
          }
          currentContext = element ? [element] : [];
          continue;
        }
        if (token.indexOf('.') > -1) {
          var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
          for (var h = 0; h < currentContext.length; h++) {
            var elements;
            if (tagName == '*') {
              elements = currentContext[h].getElementsByTagName('*');
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (var j = 0; j < elements.length; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          var currentContextIndex = 0;
          for (var k = 0; k < found.length; k++) {
            if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        }
        if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
          var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
          if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
            attrName = 'htmlFor';
          }
          var found = [], foundCount = 0;
          for (var h = 0; h < currentContext.length; h++) {
            var elements;
            if (tagName == '*') {
              elements = currentContext[h].getElementsByTagName('*');
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (var j = 0; elements[j]; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          var currentContextIndex = 0, checkFunction;
          switch (attrOperator) {
            case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
            case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
            case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
            case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
            case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
            case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
            default : checkFunction = function(e) { return e.getAttribute(attrName) };
          }
          currentContext = [];
          var currentContextIndex = 0;
          for (var k = 0; k < found.length; k++) {
            if (checkFunction(found[k])) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        }
        tagName = token;
        var found = [], foundCount = 0;
        for (var h = 0; h < currentContext.length; h++) {
          var elements = currentContext[h].getElementsByTagName(tagName);
          for (var j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = found;
      }
      resultList = [].concat(resultList,currentContext);
    }
    return resultList;
  },
  trim: function (str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  },
  bind: function(f, scope, forceArgs){
    return function() {return f.apply(scope, typeof forceArgs !== 'undefined' ? [forceArgs] : arguments);};
  }
};

// DOM ready handler
function bindReady(handler){
  var called = false;
  var ready = function() {
    if (called) return;
    called = true;
    handler();
  };
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', ready, false);
  } else if (document.attachEvent) {
    if (document.documentElement.doScroll && window == window.top) {
      var tryScroll = function(){
        if (called) return;
        if (!document.body) return;
        try {
          document.documentElement.doScroll('left');
          ready();
        } catch(e) {
          setTimeout(tryScroll, 0);
        }
      };
      tryScroll();
    }
    document.attachEvent('onreadystatechange', function(){
      if (document.readyState === 'complete') {
        ready();
      }
    });
  }
  if (window.addEventListener) window.addEventListener('load', ready, false);
  else if (window.attachEvent) window.attachEvent('onload', ready);
}

/*
 * Utility module
 */
 lib = {
  hasClass: function(el,cls) {
    return el && el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
  },
  addClass: function(el,cls) {
    if (el && !this.hasClass(el,cls)) el.className += " "+cls;
  },
  removeClass: function(el,cls) {
    if (el && this.hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
  },
  extend: function(obj) {
    for(var i = 1; i < arguments.length; i++) {
      for(var p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p)) {
          obj[p] = arguments[i][p];
        }
      }
    }
    return obj;
  },
  each: function(obj, callback) {
    var property, len;
    if(typeof obj.length === 'number') {
      for(property = 0, len = obj.length; property < len; property++) {
        if(callback.call(obj[property], property, obj[property]) === false) {
          break;
        }
      }
    } else {
      for(property in obj) {
        if(obj.hasOwnProperty(property)) {
          if(callback.call(obj[property], property, obj[property]) === false) {
            break;
          }
        }
      }
    }
  },
  event: (function() {
    var fixEvent = function(e) {
      e = e || window.event;
      if(e.isFixed) return e; else e.isFixed = true;
      if(!e.target) e.target = e.srcElement;
      e.preventDefault = e.preventDefault || function() {this.returnValue = false;};
      e.stopPropagation = e.stopPropagation || function() {this.cancelBubble = true;};
      return e;
    };
    return {
      add: function(elem, event, handler) {
        if(!elem.events) {
          elem.events = {};
          elem.handle = function(e) {
            var ret, handlers = elem.events[e.type];
            e = fixEvent(e);
            for(var i = 0, len = handlers.length; i < len; i++) {
              if(handlers[i]) {
                ret = handlers[i].call(elem, e);
                if(ret === false) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            }
          };
        }
        if(!elem.events[event]) {
          elem.events[event] = [];
          if(elem.addEventListener) elem.addEventListener(event, elem.handle, false);
          else if(elem.attachEvent) elem.attachEvent('on'+event, elem.handle);
        }
        elem.events[event].push(handler);
      },
      remove: function(elem, event, handler) {
        var handlers = elem.events[event];
        for(var i = handlers.length - 1; i >= 0; i--) {
          if(handlers[i] === handler) {
            handlers.splice(i,1);
          }
        }
        if(!handlers.length) {
          delete elem.events[event];
          if(elem.removeEventListener) elem.removeEventListener(event, elem.handle, false);
          else if(elem.detachEvent) elem.detachEvent('on'+event, elem.handle);
        }
      }
    };
  }()),
  queryElementsBySelector: function(selector, scope) {
    scope = scope || document;
    if(!selector) return [];
    if(selector === '>*') return scope.children;
    if(typeof document.querySelectorAll === 'function') {
      return scope.querySelectorAll(selector);
    }
    var selectors = selector.split(',');
    var resultList = [];
    for(var s = 0; s < selectors.length; s++) {
      var currentContext = [scope || document];
      var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
      for (var i = 0; i < tokens.length; i++) {
        token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
        if (token.indexOf('#') > -1) {
          var bits = token.split('#'), tagName = bits[0], id = bits[1];
          var element = document.getElementById(id);
          if (element && tagName && element.nodeName.toLowerCase() != tagName) {
            return [];
          }
          currentContext = element ? [element] : [];
          continue;
        }
        if (token.indexOf('.') > -1) {
          var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
          for (var h = 0; h < currentContext.length; h++) {
            var elements;
            if (tagName == '*') {
              elements = currentContext[h].getElementsByTagName('*');
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (var j = 0; j < elements.length; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          var currentContextIndex = 0;
          for (var k = 0; k < found.length; k++) {
            if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        }
        if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
          var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
          if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
            attrName = 'htmlFor';
          }
          var found = [], foundCount = 0;
          for (var h = 0; h < currentContext.length; h++) {
            var elements;
            if (tagName == '*') {
              elements = currentContext[h].getElementsByTagName('*');
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (var j = 0; elements[j]; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          var currentContextIndex = 0, checkFunction;
          switch (attrOperator) {
            case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
            case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
            case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
            case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
            case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
            case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
            default : checkFunction = function(e) { return e.getAttribute(attrName) };
          }
          currentContext = [];
          var currentContextIndex = 0;
          for (var k = 0; k < found.length; k++) {
            if (checkFunction(found[k])) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        }
        tagName = token;
        var found = [], foundCount = 0;
        for (var h = 0; h < currentContext.length; h++) {
          var elements = currentContext[h].getElementsByTagName(tagName);
          for (var j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = found;
      }
      resultList = [].concat(resultList,currentContext);
    }
    return resultList;
  },
  trim: function (str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  },
  bind: function(f, scope, forceArgs){
    return function() {return f.apply(scope, typeof forceArgs !== 'undefined' ? [forceArgs] : arguments);};
  }
};

// DOM ready handler
function bindReady(handler){
  var called = false;
  var ready = function() {
    if (called) return;
    called = true;
    handler();
  };
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', ready, false);
  } else if (document.attachEvent) {
    if (document.documentElement.doScroll && window == window.top) {
      var tryScroll = function(){
        if (called) return;
        if (!document.body) return;
        try {
          document.documentElement.doScroll('left');
          ready();
        } catch(e) {
          setTimeout(tryScroll, 0);
        }
      };
      tryScroll();
    }
    document.attachEvent('onreadystatechange', function(){
      if (document.readyState === 'complete') {
        ready();
      }
    });
  }
  if (window.addEventListener) window.addEventListener('load', ready, false);
  else if (window.attachEvent) window.attachEvent('onload', ready);
}