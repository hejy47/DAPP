$(function() {
    $(window).load(function() {
        App.init();
    });
});

$('#new').on('click', function() {
    $('#sub_fin').fadeIn();
});

$('#cancel').on('click', function() {
    $('#sub_fin').fadeOut();
});

$(document).on('click', 'li', function() {
    window.location.href = "detail.html?address=" + $(this).children().eq(2).html();
});

$(document).on('click','.todo.before', function() {
	$('h1').animate({margin:'10px 0px'});
	if ($('.after').length == 1) {
		$('#todo').animate({height:'300px'});
		$('#todo-list').css('height','250px');
		$('#done').animate({height:'300px'});
		$('#done-list').animate({height:'250px'});
	}
	else {
		$('#todo').animate({height:'580px'});
		$('#todo-list').animate({height:'550px'});
	}
	$('#todo-list').fadeIn();
	$('.todo').removeClass('before');
	$('.todo').addClass('after');
});

$(document).on('click','.todo.after', function() {
	$('#todo-list').fadeOut();
	$('#todo').animate({height:'22px'});
	$('.todo').removeClass('after');
	$('.todo').addClass('before');
	if ($('.after').length == 1) {
		$('#done').animate({height:'580px'});
		$('#done-list').css('height','550px');
	}
	else {
		$('h1').animate({margin:'200px 0 10px 0'});
	}
});

$(document).on('click','.done.before', function() {
	$('h1').animate({margin:'10px 0px'});
	if ($('.after').length == 1) {
		$('#done').animate({height:'300px'});
		$('#done-list').css('height','250px');
		$('#todo').animate({height:'300px'});
		$('#todo-list').animate({height:'250px'});
	}
	else {
		$('#done').animate({height:'580px'});
		$('#done-list').css('height','550px');
	}
	$('#done-list').fadeIn();
	$('.done').removeClass('before');
	$('.done').addClass('after');
});

$(document).on('click','.done.after', function() {
	$('#done-list').fadeOut();
	$('#done').animate({height:'22px'});
	$('.done').removeClass('after');
	$('.done').addClass('before');
	if ($('.after').length == 1) {
		$('#todo').animate({height:'580px'});
		$('#todo-list').css('height','550px');
	}
	else {
		$('h1').animate({margin:'200px 0 10px 0'});
	}
});