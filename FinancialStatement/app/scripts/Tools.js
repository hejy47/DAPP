function toUtf8_raw(hex) {
    while (hex[hex.length - 1] == '0') {
        hex = hex.substr(0, hex.length - 1)
    }
    hex = hex.replace("0x", "");
    var arr = hex.split("");
    var out = ""
    for (var i = 0; i < arr.length / 2; i++) {
        var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
        var charValue = String.fromCharCode(tmp);
        out += charValue
    }
    return out;
}

function toUtf8(hex) {
    while (hex[hex.length - 1] == '0') {
        hex = hex.substr(0, hex.length - 1)
    }
    hex = hex.replace("0x", "");
    var out = ""
    for (var i = 0; i < hex.length ; i = i+4) {
        var tmp = "0x" + hex.substr(i,i+4);
        var charValue = String.fromCharCode(tmp);
        out += charValue
    }
    return out;
}

function formatDate(rawDate) {
    if (!rawDate) { return '' }
    const _date = new Date(parseInt(rawDate) * 1000);
    var mon = _date.getMonth() + 1;
    var day = _date.getDate();
    var hour = _date.getHours();
    var min = _date.getMinutes();
    var dateString = _date.getFullYear() + "-" +
        (mon < 10 ? "0" + mon : mon) + "-" +
        (day < 10 ? "0" + day : day) + " " +
        (hour < 10 ? "0" + hour : hour) + ":" +
        (min < 10 ? "0" + min : min);
    return dateString;
}

function out_of_date(rawend) {
    var now = new Date();
    var end_ = new Date(parseInt(rawend) * 1000);
    if (now > end_) {
        return false;
    } else {
        return true;
    }
}