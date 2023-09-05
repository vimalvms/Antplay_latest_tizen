window.onload = function () {
    window.SN = SpatialNavigation;
    SN.init();

    $(".email_phone_container").show();
    // SN.focus("#email_or_phone");

    set_login_focus('email_phone_container', 'email_or_phone');

    // When search input focus
    $('#email_phone_container').on('sn:focused', function (e) {
        console.log("login page focus");
    });

    // When search input enter
    // $('#login_container').on('sn:enter-down', function (e) {
    //     console.log("login page enter");
    // });

    // When checkbox enter
    // $('#first_time').on('sn:enter-down', function (e) {
    //     if (FIRST_TIME == 0) {
    //         FIRST_TIME = 1;
    //         $("img.checkbox_image").attr("src", '/images/checkbox_selected.png');
    //     }
    //     else if (FIRST_TIME == 1) {
    //         FIRST_TIME = 0;
    //         $("img.checkbox_image").attr("src", '/images/checkbox.png');
    //     }
    // });

    $('#send_otp_email').on('sn:enter-down', function (e) {
        console.log("login button enter");
        var USERNAME = document.getElementById('email_or_phone').value;
        var PASSWORD = document.getElementById('password').value;

        if (USERNAME == '') {
            login_error_message("Username is required.")
        } else if (PASSWORD == '') {
            login_error_message("Password is required.")
        } else if (USERNAME && PASSWORD) {
            $("#email_phone_container").hide();
            // $("#login_loader").show();
            setTimeout(function () {
                var user_name = document.getElementById('email_or_phone').value;
                var user_pswd = document.getElementById('password').value;
                localStorage.setItem("email", user_name);
                localStorage.setItem("password", user_pswd);
                window.location.href="index.html";
                loginApi();
            }, 200);
        }
    });

    var userName = localStorage.getItem('email'),
        password = localStorage.getItem('password');


    if (userName != null && userName != "") document.getElementById('userName').value = userName;
    if (password != null && password != "") document.getElementById('password').value = password;


    if ((userName != null && userName != "" && password != null && password != "")) {
        SN.focus("#send_otp_email");
    } else {
        localStorage.setItem('email', "");
        localStorage.setItem('password', "");
        SN.focus("email_phone_container");
    }
};

$(window).keydown(function (evt) {
    switch (evt.keyCode) {
        case 10009: // Return key
            if ($(".login_container").hasClass("active")) {
                tizen.application.getCurrentApplication().exit();
            }
            break;

        case 37: // LEFT arrow
            console.log("left key");
            if ($('.login_container').hasClass('active') && ($("#userName").is(":focus") || $("#password").is(":focus"))) {
                console.log("pointer move left ");
                var textEntered = $.trim($(':focus').val());
                if (textEntered) controlLeftArrowKeys();
            }
            break;

        case 39: // RIGHT arrow
            console.log("right key");
            if ($('.login_container').hasClass('active') && ($("#userName").is(":focus") || $("#password").is(":focus"))) {
                var textEntered = $.trim($(':focus').val());
                var input = document.getElementById($(":focus").attr("id"));
                var currentpos = input.selectionStart;
                if (input.value.length == currentpos && $("#password").is(":focus")) SN.focus("#first_time");
                else if (textEntered && input.value.length > currentpos) controlrightArrowKeys();
            }
            break;
        default:
            console.log("Key code : " + evt.keyCode);
            break;
    }
});

function login_error_message(msg) {
    $("#login_loader").hide();
    $(".login_container").show();

    clearInterval(HIDE_SHOW_LOGIN_ERROR);
    $("#error_message").text(msg);
    if ($(".error_overlay").css("display") == "none") {
        $(".error_overlay").css({ "display": "block" });
    }
    $("#login_loader").hide();
    $("#login_container").show();
    SN.focus("login_container");

    HIDE_SHOW_LOGIN_ERROR = setTimeout(function () {
        $(".error_overlay").css({ "display": "none" });
    }, 6000);
}

function set_login_focus(containerId, itemId) {
    console.log("set login focus");
    SN.remove(containerId);
    SN.add({
        id: containerId,
        selector: '#' + containerId + ' .focusable',
        restrict: 'self-first',
        defaultElement: '#' + itemId,
        enterTo: 'last-focused'
    });
    SN.makeFocusable();
}

function hideShowError(text, left) {
    clearInterval(HIDE_SHOW_LOGIN_ERROR);
    if ($(".error_overlay").css("display") == "none") $(".error_overlay").text(text).css({ "display": "block" });

    HIDE_SHOW_LOGIN_ERROR = setTimeout(function () {
        $(".error_overlay").css({ "display": "none" });
    }, 20000);
}