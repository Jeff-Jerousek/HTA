
(function () {

/* 
Ping 
*/
$.extend($, {
	Ping: function Ping(url, timeout) {
		timeout = timeout || 1500;
		var timer = null;

		return $.Deferred(function deferred(defer) {

			var img = new Image();
			img.onload = function () { success("onload"); };
			img.onerror = function () { success("onerror"); };  // onerror is also success, because this means the domain/ip is found, only the image not;

			var start = new Date();
			img.src = url += ("?cache=" + +start);
			
			// the trick is this is not going to be called before img.src returns ...
			// beacuse succes clears this timeout
			timer = window.setTimeout(function timer() { fail(); }, timeout);

			function cleanup() {
				window.clearTimeout(timer);
				timer = img = null;
			}

			function success(on) {
				// so this cleanup stops the possibility of calling time() above
				cleanup();
				defer.resolve(true, url, new Date() - start, on);
			}

			// called only on timeout
			function fail() {
				cleanup();
				defer.reject(false, url, new Date() - start, "timeout");
			}

		}).promise();
	}
});

    /**
     *@param {number} data_ptr is an index on the array of 2D points
     *@param {function} cb is a callback
    */
collect_ping_data = function ( server_, data_ptr, cb ) {

	$.Ping(server_ /*, optional timeout */)
		.done(function (success, url, time, on) {
			cb(data_ptr, time) ;
		})
		.fail(function (failure, url, time, on) {
		    cb(data_ptr, time);
		});
}

// eof closure
}());