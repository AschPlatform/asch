; (function () {
	var $doc = $(document),
		$body = $doc.find('body'),
		$toast, $text, timer;

	function init() {
		var toastTpl =
			'<div class="toast-base">' +
			'<div class="toast-background"></div>' +
			'<div class="toast-content">' +
			'<i class="toast-icon"></i>' +
			'<p class="toast-text"></p>' +
			'</div>' +
			'</div>';

		$body.append(toastTpl);
		$toast = $('.toast-base');
		$text = $('.toast-text');
	}

	/**
		* text: 提示语句
		* type: ‘success’ - 成功 ‘error’ － 失败 ‘warn’ － 提示
		* ms: 显示毫秒
		* callback: 回调函数
		*/
	function show(opt) {
		if (timer) {
			clearTimeout(timer);
		}

		var typeClass,
			option = {
				type: 'success',
				text: '',
				ms: 1500,
				callback: undefined
			};

		option = $.extend(option, opt)

		if (!$toast || $toast.length == 0) {
			init();
		}

		if (option.type == 'warn') {
			typeClass = 'toast-warn';
		} else if (option.type == 'error') {
			typeClass = 'toast-error';
		} else {
			typeClass = 'toast-success';
		}

		$toast.css('visibility', 'hidden').show();
		$text.css('width', (option.text.length > 17 ? '250' : '220') + 'px');
		$text.text(option.text);
		$toast.attr('class', 'toast-base').addClass(typeClass)
			.css('margin', '-' + $toast.height() / 2 + 'px 0 0 -' + $toast.width() / 2 + 'px')
			.css('visibility', 'visible');

		timer = setTimeout(function () {
			$toast.hide();
			timer = null;
			option.callback && option.callback();
		}, option.ms);
	}

	window.toast = window.toastSuccess = function (input, callback) {
		var opt;
		if (typeof input == 'string') {
			opt = {
				text: input,
				callback: callback
			}
		} else {
			opt = input;
		}
		show(opt);
	}

	window.toastError = function (input, callback) {
		var opt;
		if (typeof input == 'string') {
			opt = {
				text: input,
				type: 'error',
				callback: callback
			}
		} else {
			opt = input;
			opt.type = 'error';
		}
		show(opt);
	}
})();