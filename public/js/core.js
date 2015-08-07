$(function(){

	$.format00 = function(value) {
		var zero = value < 10 ? '0' : '';
		return "" + zero + value;
	};

	$.formatDate = function(date) {
    	var dateString = "" + ($.format00(date.getDate())) + "/" + ($.format00(date.getMonth() + 1)) + "/" + (date.getFullYear());
	    if ((date.getHours() + date.getMinutes() + date.getSeconds()) > 0) {
	      dateString += " " + ($.format00(date.getHours())) + ":" + ($.format00(date.getMinutes())) + ":" + ($.format00(date.getSeconds()));
	    }
    	return dateString;
  	};

});