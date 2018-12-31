$(function() {
    $(window).load(function() {
        $('#oppose').on('click', function() {
            $('#box').fadeIn();
            $('#useraddress-box').fadeOut();
            setTimeout("$('#oppose-box').fadeIn()", 600);
        });

        $('#cancel,#cancel-request,#agree,#getopinions,#result').on('click', function() {
            $('#box').fadeOut();
            $('#oppose-box').fadeOut();
            $('#useraddress-box').fadeOut();
        });

        $('#request').on('click', function() {
            $('#box').fadeIn();
            $('#oppose-box').fadeOut();
            setTimeout("$('#useraddress-box').fadeIn()", 600);
        });

        $('#adduser-button').on('click', function() {
            if ($('#username').val() == "" || $('#useraccount').val() == "") {
                alert("Error");
            } else {
                localStorage.setItem($(':checkbox').length + 1, [$('#username').val(), $('#useraccount').val()]);
                var info = localStorage.getItem($(':checkbox').length + 1);
                var arr = info.split(',');
                var id = $(':checkbox').length + 1;
                $('#useraddress-box').append('<div class="accounts"><input id="checkbox' + id + '" type="checkbox" name=' + arr[0] + ' value=' + arr[1] + '><label for="checkbox' + id + '">' + arr[0] + '</label></div>');
                $('#username').val('');
                $('#useraccount').val('');
                $('#adduser').slideToggle('fast');
            }
        });

        $(document).on('click', '.show.all', function() {
            $("#list").animate({ width: "200px" });
            $('.show').removeClass('all');
            $('.show').addClass('less');
            $('.show').html('<');
        });

        $(document).on('click', '.show.less', function() {
            $("#list").animate({ width: "80px" });
            $('.show').removeClass('less');
            $('.show').addClass('all');
            $('.show').html('>');
        });

        $('.icon').on('click', function() {
            $('#adduser').slideToggle('fast');
            // $( "#adduser" ).toggle( 'slide',{}, 500 );
        });

        $(document).on('click', '#IK', function() {
            $('#opinions').fadeOut();
            $('#alert').fadeOut();
        });

        App.init();
    });
});