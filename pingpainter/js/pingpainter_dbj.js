
var ping_paint = function (ip_to_ping, output_cb, ping_rezult_display_element)
{
    var ctr = 1, accumulator = 0, avg = 0, last_color = "";
    var counter = function () { return counter.ctr_++; };
    counter.ctr_ = 1;

    var acc_reset = function (color) {
        if (color != last_color) { accumulator = 0; counter.ctr_ = 1; }
        return last_color = color;
    }

    var val2clr = function (val_) {
        val_ = parseInt(val_);
        switch (true) {
            case val_ > 100: return acc_reset("red");
            case val_ > 50: return acc_reset("orange");
            default: return acc_reset("green");
        };
    }

    ping_paint = function (ip_to_ping) {
        //output_cb(); // output reset
        //output_cb("Count: " + (ctr = counter()));
        var ping_time = dbj.wmi.ping(ip_to_ping, output_cb);
        avg = (accumulator += ping_time) / ctr;

         output_cb("ping_time:{0}, Accumulator:{1}, Average:{2}".format(ping_time, accumulator, avg));

        ping_rezult_display_element.style.background = val2clr(parseInt(avg));

        output_cb("val2clr(avg): " + val2clr(parseInt(avg)) );

        ping_rezult_display_element.innerHTML = parseInt(avg);
    }

    return ping_paint(ip_to_ping);

};
