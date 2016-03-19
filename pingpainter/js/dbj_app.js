
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
(function () { // closure start
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
if ("undefined" == typeof dbj) {
	alert("Whoa pardner! Where is your dbj?!");
	return ;
}

/**
 * basically an hta app services utils etc.
 */
var htautl = {

    trace_hide: function (newval) {
        hide_trace_ = true; // default

        this.trace_hide = function ( newval ) {
            returun ( newval ? hide_trace_ = !hide_trace_ : hide_trace_ );
        }
        return this.trace_hide(newval);
    },

    err_handler: window.onerror ,
	/*|| (window.onerror = function (message, url, line) {
    	alert("Unahndled HTA ERROR event.\n\nmessage: " + message + "\nurl: " + url + "\nline: " + line);
    	// debugger;
    	return false;
    }),*/
	//hta commandLine is undefined when not called from er "command line" ...
	// thus app name will be whatever is defined in HTA:APPLICATION ... if anything 
	// so this is the safest way to obtain all the names required :)
    fullpath: function (hta_app) {
        // on the beggining
    	var fullpath_ = hta_app.ownerDocument.location.href; 
        this.fullpath = function () {
            return fullpath_ ;
        }
        return this.fullpath();
    },

    basename : function(path_) {
        return (path_).replace(/^.*[\\\/]/, '');
    },
    /**
     * lazy create shell object
     * if argument given use it as shell async+no gui, run argument
     * return the shell object
     *@param {array} command string, windows state, true for sync or false for async
     */
    shell: function ( runarg ) {
        var shell_ = new ActiveXObject("wscript.shell");
        dbj.assert(shell_);
        htautl.shell = function (runarg) {
            if (isArray(runarg)) {
                try {
                    shell_.Run(runarg[0], runarg[1] || 0, runarg[2] || false); // async run by default!
                } catch (x) {
                    dbj.trace("htautl.shell() run failed with: " + dbj.err2str(x));
                }
            }
            return shell_;
        }
        return htautl.shell( runarg);
    },
    /**
     * emulate the wait by pinging the localhost, 
     *@param {number} miliseconds to wait
     */
    wait: function (milisecs) {
        this.shell(["cmd /c ping localhost -n 1 -w " + (milisecs - 0), 0, true]);
    },

    isHTA: function (obj) {
    	if (!obj) return false;
    	if (!obj.nodeName) return false;
    	if ("HTA:APPLICATION" == obj.nodeName) return true; // can happen with VStudio debugging
    	if (!obj.scopeName) return false;
    	if ("HTA" != obj.scopeName) return false;
    	if ("APPLICATION" != obj.nodeName) return false;
    	return true;
    }

};

/**
 once called this is not a function any more and thus that is a signal it was 
 not initialised when it was supposed to :)
*/
HTAAPP = function (hta_app) {

	if (! htautl.isHTA(hta_app)) {
	   throw ("Whoa pardner, this is not an HTA APP?");
	}

	var fullpathname = htautl.fullpath(hta_app);
    var cfgfilename = htautl.basename(fullpathname).replace(".hta", ".cfg");
    var logfilename = htautl.basename(fullpathname).replace(".hta", ".log");
    
    /** Synchronous file open. Not using jQuery.
     */
    function get_cfg(cfg_file_name_) {
        var retval = { load: null, error: null },
            xhttp = dbj.createXHR();
           
        try {
            xhttp.open("GET", cfg_file_name_, false);
            xhttp.send();
            retval.load = dbj.evil(xhttp.responseText);
        } catch (x) {
            retval.error = "Reading from {0} failed. Exception: {1}. XHR status: {2}:{3}, readyState: {4}".format(
                 cfg_file_name_,
                 dbj.err2str( x ),
                 xhttp.status,
                 xhttp.statusText,
                 xhttp.readyState
                );
            throw(retval.error);
        }
            return retval; 
    };
	
	var txt_stream = null ;
	try {
				txt_stream = text_stream(logfilename, false); // keep the previous log
	} catch(x) {
        throw("Error whil creaitng text stream for {0}, {1}:".format( logfilename, dbj.err2str(x)));
	}

    var keeper_ = {
        "cfgfilename" : cfgfilename,
        "logfilename": logfilename,
        "cfg": get_cfg(cfgfilename).load ,
        "log":  function (s_) {
        			try {
        				txt_stream.write(new Date().toLocaleTimeString() + " -- " + s_);
        			} catch (x) {
        				throw ("Exception in the APP.log():" + dbj.err2str(x));
        }
    }};

    /**
    In the context of HTA there is no (easy) console object
    So we shall use the good old log file
    We shall simply overwrite dbj.print and dbj.trace and dbj.assert 
    to target the log file, not a console
    */
    dbj.print = keeper_.log;
    dbj.trace = keeper_.log ;
    dbj.assert = function (x) {
        if (!x) {
            keeper_.log("dbj.assert("+x+") resulted in 'false'!");
            throw "dbj.assert failed for: " + x;
        }
    };

    keeper_.log(new Date().toLocaleDateString() + " dbj*PINGPAINTER log <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

        return keeper_;
};

/**
 each Time called re-create a file by name given
*/
var text_stream = function (filename, overwrite ) {

    var ForReading = 1, ForWriting = 2, ForAppending = 8;
    var TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    fso.CreateTextFile(filename, overwrite || true );
    var fileObj = fso.GetFile(filename);

    text_stream = {

        "filename" : filename,

        "write": function (s_) {
            // Open a text stream for output.
            var ts = fileObj.OpenAsTextStream(ForWriting, TristateUseDefault);
            // make sure it is string and then write to the text stream.
            ts.WriteLine(""+s_);
            ts.Close();
        },

        "read": function (collector_call_back) {
            // Open a text stream for input.
            ts = fileObj.OpenAsTextStream(ForReading, TristateUseDefault);

            dbj.assert(isFunction(collector_call_back));
            // Read from the text stream and collect the result
            while (!ts.AtEndOfStream) {
                var textLine = ts.ReadLine();
                collector_call_backt(textLine);
            }
            ts.Close();
        }
    };

}

}()); // closure end
