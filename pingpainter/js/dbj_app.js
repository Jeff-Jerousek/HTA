
this.dbj || (this.dbj = {});

if ( roleof (dbj.err2str) != "Function" ) dbj.err2str = function (eo) {

    if (roleof(eo) != "Error") eo = new Error(0, "" + eo);

    return "Error Code: {0} Facility Code: {1}, Error Message: {2}, Error Name: {3}".format(
    e.number & 0xFFFF,
    e.number >> 16 & 0x1FFF,
    e.message,
    e.name
    );
    
}

window.onerror = function dbj_hta_err_handler (message, url, line) {
    alert("ONERROR event caught!\n\nmessage: " + message + "\nurl: " + url + "\nline: " + line);
    debugger;
    return true;
}

/**
 * basically an hta app 
 */
this.dbj.app = {

    trace_hide: function (newval) {
        hide_trace_ = true; // default

        this.trace_hide = function ( newval ) {
            returun ( newval ? hide_trace_ = !hide_trace_ : hide_trace_ );
        }
        return this.trace_hide(newval);
    },
    err_handler : dbj_hta_err_handler,

    fullpath : function (commandLine) {
        var cmdline_ = commandLine;
        // whatever is the cl args situation full script path comes allways in double quotes
        // on the beggining
        var fullpath_ = cmdline_.split("\"")[1];

        dbj.app.fullpath = function () {
            return fullpath_ ;
        }
        return dbj.app.fullpath();
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
        dbj.app.shell = function (runarg) {
            if (isArray(runarg)) {
                try {
                    shell_(runarg[0], runarg[1] || 0, runarg[2] || false); // async run by default!
                } catch (x) {
                    dbj.trace("dbj.app.shell() run failed with: " + dbj.err2str(x));
                }
            }
            return shell_;
        }
        return dbj.app.shell( runarg);
    },
    /**
     * emulate the wait by pinging the localhost, 
     *@param {number} miliseconds to wait
     */
    wait: function (milisecs) {
        this.shell(["cmd /c ping localhost -n 1 - w " + (milisecs - 0), 0, true]);
    }

};

/**
 once called this is not a function any more and thus that is a signal it was 
 not initialised when it was supposed to :)
*/
this.dbj.APP = function (hta_app) {

    var dbj_hta_app = dbj.app;

    var fullpathname = dbj_hta_app.fullpath(hta_app.commandLine);

    var cfgfilename = dbj_hta_app.basename(fullpathname).replace(".hta", ".cfg");
    var logfilename = dbj_hta_app.basename(fullpathname).replace(".hta", ".log");
    
    /**
    Synchronous file open. Not using jQuery. tranform the load to the object.
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
            throw retval.error;
        }
            return function () { retval; }
    };

    var log_ = dbj.text_stream(logfilename) ;

    var keeper_ = {
        "cfgfilename" : cfgfilename,
        "logfilename": logfilename,
        "cfg": get_cfg(cfgfilename).load ,
        "log":  function (s_) {
            var tid  = setTimeout( function () {
                try {
                    log_.write(new Date().toLocaleTimeString() + " -- " + s_ );
                } catch(x) {
                    alert("Exception in dbj.print():"+ dbj.err2str(x));
                }
                clearTimeout(tid);
            },1);
        }
    }

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

    keeper_.log(new Date().toLocaleDateString() + " dbj*PINGPAINTER log ");

        return keeper_;
};

/**
 each Time called re-create a file by name given
*/
dbj.text_stream = function (filename ) {

    var ForReading = 1, ForWriting = 2, ForAppending = 8;
    var TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    // Create the file, and obtain a file object for the file.
    // var filename = "c:\\testfile.txt";
    fso.CreateTextFile(filename);
    var fileObj = fso.GetFile(filename);

    return dbj.text_stream = {

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




