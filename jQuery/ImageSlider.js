/**
 * ImageSlider.js
 *
 * Converts div elements containing sequences of images into a sliding image display
 * - requires jQuery
 * - see https://www.organicdesign.co.nz/image_slider for working example
 *
 * Copyright (c) 2012-2015, Aran Dunkley (https://www.organicdesign.co.nz/aran)
 *
 * Released under the GNU General Public Licence 2.0 or later
 *
 */
$(document).ready(function() {

	"use strict";

	/**
	 * Initialise all image-slider elements in the page and start them sliding
	 */
	$('div.image-slider').each(function() {
		var div = $(this), i, j, w, h, img, first, thumb, prev, next;

		// Initialise data structure in this slider element
		div.data({
			images: [],  // array of all the images in this slider (preloaded)
			image:  1,   // the currently displaying image in this slider
			last:   0,   // the previous image transitioning out
			dir:    0,   // the direction of the current transition (-1 or +1)
			width:  0,   // width of this sliders images
			height: 0,   // height of this sliders images
		});

		// Set config defaults if not supplied in html data
		if(!div.data('delay')) div.data('delay', 5);
		if(!div.data('direction')) div.data('direction', 1);
		if(!div.data('duration')) div.data('duration', 1000);
		if(!div.data('thumbs')) div.data('thumbs', 0);

		// Store the images in the slider element's data, and preload each one
		j = $('img', div).get();
		for( i = 0; i < j.length; i++ ) {
			img = $(j[i]);
			img.css('display','none');
			div.data('images').push(img);
			$('<img />').attr('src', img.attr('src'));
		}

		// Function to initialise the div
		function init() {

			// Store the image dimentions in our slider div element's data
			div.data('width', w = $(first).width());
			div.data('height', h = $(first).height());

			// If the slider has thumbs set then create another div with clickable thumbs in it (using the original images for the thumbs)
			if(div.data('thumbs') > 0) {
				thumb = $('<div class="thumbs" />');
				for( i = 0; i < div.data('images').length; i++ ) {
					img = div.data('images')[i];
					img.width(div.data('thumbs'));
					img.height(h*div.data('thumbs')/w);
					img.css({float: 'left', cursor: 'pointer', display: ''});
					img.data('index', i);
					img.click(function() {
						slide($('div.image-slider').has(this), 1, $(this).data('index'));
					});
					thumb.append(img);
				}
			}

			// Restructure the content of this sliders div into layered divs with prev/next buttons and thumbs below
			prev = '<a class="is-prev" href="javascript:">&lt; prev</a>';
			next = '<a class="is-next" href="javascript:">next &gt;</a>';
			div.html( '<div class="is-img1"><div class="is-img2">' + prev + next + '</div></div>' );
			if(thumb) div.append(thumb);
			$('.is-prev', div).click(function() { slide($('div.image-slider').has(this), -1); });
			$('.is-next', div).click(function() { slide($('div.image-slider').has(this), 1); });

			// Set the container size to the image size and other css styles
			$('.is-img1,.is-img2',div).css({ padding: 0, width: w, height: h });
			$('.is-prev',div).css({ float: 'left', 'margin-top': h / 2 });
			$('.is-next',div).css({ float: 'right', 'margin-top': h / 2 });

			// Start the sliding process
			slide(div, div.data('direction'));
		}

		// Only initialise this slider after the first image has loaded so we can get the dimensions
		// (from https://gist.github.com/johnnygreen/4712200)
		first = div.data('images')[0];
		if(first.complete) init();
		$('<img />').one('load readystatechange', function() { init(); } ).attr('src', first.attr('src'));
	});

	/**
	 * Start animating the passed div
	 * - dir is -1 or +1 for the direction to animate (left or right)
	 * - n allows the new image to be specified rather than just next/prev (it will scroll upward)
	 */
	function slide(div, dir, n) {
		var nx = n === undefined,
		    l = div.data('images').length,
		    w = div.data('width'),
		    h = div.data('height'),
		    url1, url2;

		// Bail if already animating, else set animation to start
		if(div.data('dir')) return; else div.data('dir', dir);

		// Set the new image either to the next according to the passed direction, or to n if passed
		div.data('last', div.data('image'));
		div.data('image', nx ? (div.data('image') + dir + l) % l : n);
		url1 = div.data('images')[div.data('image')].attr('src');
		url2 = div.data('images')[div.data('last')].attr('src');

		// Show next image on regular interval
		if(div.data('timer')) clearTimeout(div.data('timer'));
		div.data('timer', setTimeout(function() { slide(div, div.data('direction')); }, div.data('delay') * 1000));

		// Animation the last image out and the new current image in
		div.animate({ t: 1 }, {
			duration: div.data('duration'),
			step: function(now, fx) {
				var div = $(fx.elem), offset, x1, y1, x2, y2;

				// Set an offset in pixels for the transition between the current and last image
				offset = -div.data('dir') * fx.pos * (nx ? w : h);

				// Calculate the positions of the current and last image (images specified with n scroll upward)
				x1 = nx ? offset + w * dir : 0;
				x2 = nx ? offset : 0;
				y1 = nx ? 0 : offset + h * dir;
				y2 = nx ? 0 : offset;

				// Set the positions of the images with CSS
				$('.is-img1', div).css( 'background', 'url("' + url1 + '") no-repeat ' + x1 + 'px ' + y1 + 'px' );
				$('.is-img2', div).css( 'background', 'url("' + url2 + '") no-repeat ' + x2 + 'px ' + y2 + 'px' );
			},
			complete: function(now, fx) {
				$(this).data('dir', 0); // mark current slider as no longer animating
			}
		});
	};
});
