; (function ( GLOBAL, undefined ) {
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
if ("undefined" == typeof dbj) {
	alert("Whoa pardner! Where is your dbj?!");
	return ;
}

dbj.wmi = {};


    dbj.wmi.err  = function last_wmi_error () {
    try {
        var ERR = new ActiveXObject("WbemScripting.SWbemLastError");

        return {
            Operation: ERR.Operation,
            Provider: ERR.ProviderName,
            Description: ERR.Description,
            ParameterInfo: ERR.ParameterInfo,
            StatusCode: ERR.StatusCode,
            toString: function () {
                return "Operation: " + this.Operation +
                "Provider: " + this.ProviderName +
                "Description: " + this.Description +
                "ParameterInfo: " + this.ParameterInfo +
                "StatusCode: " + this.StatusCode;
            }
        }
    } catch (x) {
        return null; // "no last WMI error found" ;
    }
}
// 
// 
var swbem_service = function (server_, output_cb ) {
    server_ = server_ || ".";

    var locator = new ActiveXObject("WbemScripting.SWbemLocator");
    var service = locator.ConnectServer(server_, "/root/CIMV2");

    output_cb("server_");
    output_cb("typeof locator", this);
    output_cb("typeof service", this);

    swbem_service = function () {
        return service;
    }

    return swbem_service();
}
// 
dbj.wmi.ping = function single_ping(ip_address, output_cb)
{
    try {
        var strComputer = ip_address || "127.0.0.1";

        output_cb("SELECT * FROM Win32_PingStatus WHERE Address = '" + ip_address + "'");

        var objWMIService = swbem_service(".", output_cb);

        var colItems = objWMIService.ExecQuery("SELECT * FROM Win32_PingStatus WHERE Address = '" + ip_address + "'");

        // dbj.print(  "Produced " + colItems.Count + (colItems.Count == 1 ? " instance" : " instances") );

        var retval = null;

        var enumItems = new Enumerator(colItems);
        for (; !enumItems.atEnd() ; enumItems.moveNext()) {
            var objItem = enumItems.item();

            return retval = objItem.ResponseTime; // CLUDGE!

            output_cb("Address                        : " + objItem.Address);
            output_cb("BufferSize                     : " + objItem.BufferSize);
            output_cb("NoFragmentation                : " + objItem.NoFragmentation);
            output_cb("PrimaryAddressResolutionStatus : " + objItem.PrimaryAddressResolutionStatus);
            output_cb("ProtocolAddress                : " + objItem.ProtocolAddress);
            output_cb("ProtocolAddressResolved        : " + objItem.ProtocolAddressResolved);
            output_cb("RecordRoute                    : " + objItem.RecordRoute);
            output_cb("ReplyInconsistency             : " + objItem.ReplyInconsistency);
            output_cb("ReplySize                      : " + objItem.ReplySize);
            output_cb("ResolveAddressNames            : " + objItem.ResolveAddressNames);
            output_cb("ResponseTime                   : " + objItem.ResponseTime);
            output_cb("ResponseTimeToLive             : " + objItem.ResponseTimeToLive);
            output_cb("RouteRecord                    : " + (objItem.RouteRecord.toArray()).join(","));
            output_cb("RouteRecordResolved            : " + (objItem.RouteRecordResolved.toArray()).join(","));
            output_cb("SourceRoute                    : " + objItem.SourceRoute);
            output_cb("SourceRouteType                : " + objItem.SourceRouteType);
            output_cb("StatusCode                     : " + objItem.StatusCode);
            output_cb("Timeout                        : " + objItem.Timeout);
            output_cb("TimeStampRecord                : " + (objItem.TimeStampRecord.toArray()).join(","));
            output_cb("TimeStampRecordAddress         : " + (objItem.TimeStampRecordAddress.toArray()).join(","));
            output_cb("TimeStampRecordAddressResolved : " + (objItem.TimeStampRecordAddressResolved.toArray()).join(","));
            output_cb("TimestampRoute                 : " + objItem.TimestampRoute);
            output_cb("TimeToLive                     : " + objItem.TimeToLive);
            output_cb("TypeofService                  : " + objItem.TypeofService);
        }

    } catch (x) {
        var wmierr = last_wmi_error();
        if (wmierr) {
            output_cb("single_ping() Exception : " + x);
            output_cb(" WMI ERROR: " + wmierr);
        }
    }
    return retval;
}; // eof single ping

}( this || window )); // eof closure