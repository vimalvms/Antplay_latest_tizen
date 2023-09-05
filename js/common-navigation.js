function manage_spatial_navigation(containerClass, favoriteStatus, vodId) {
    switch (containerClass) {

        case "second_screen":
            set_focus('second_screen', 'skipp');
            SN.focus("#samsung_tv");

            // var userName = localStorage.getItem('email'),
            // password = localStorage.getItem('password');

            // if(userName & password){
            //     console.log("username and password is not empty....");
            //     loginApi();
            // }else{
            //     console.log("username and password is empty.....");
            //     $(".container").hide();
            //     $(".email_phone_container").show();
            //     SN.focus("#email_or_phone");
            // }

            // When menu foucs
            $('#skipp').on('sn:focused', function (e) {
            });

            $('#samsung_tv').on('sn:focused', function (e) {
                console.log("samsung_tv button focus....");
            });

            $('#skipp').on('sn:enter-down', function (e) {
                $(".container").hide();
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
            });

            $('#samsung_tv').on('sn:enter-down', function (e) {
                $(".play_pc_games").hide();
                $(".connect_gamepad").show();
                SN.focus("#game_convenience_next");
            });

            break;

        case "connect_gamepad":
            set_focus('connect_gamepad', 'skip_connect_gamepad');

            // When menu foucs
            $('#skip_connect_gamepad').on('sn:focused', function (e) {
            });

            $('#game_convenience_next').on('sn:focused', function (e) {
            });

            $('#skip_connect_gamepad').on('sn:enter-down', function (e) {
                $(".connect_gamepad").hide();
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
            });

            $('#game_convenience_next').on('sn:enter-down', function (e) {
                $(".connect_gamepad").hide();
                $(".cloud_pc").show();
                SN.focus("#cloud_pc_next");
            });

            break;

        case "download_favourite":
            set_focus('download_favourite', 'skip_connect_gamepad');

            // When menu foucs
            $('#skip_download_favourite').on('sn:focused', function (e) {
            });

            $('#favorite_download_next').on('sn:focused', function (e) {
            });

            $('#skip_download_favourite').on('sn:enter-down', function (e) {
                $(".download_favourite").hide();
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
            });

            $('#favorite_download_next').on('sn:enter-down', function (e) {
                $(".download_favourite").hide();
                $(".finish_screen").show();
                SN.focus("#finish_next");
            });

            break;

        case "cloud_pc":
            set_focus('cloud_pc', 'skip_connect_gamepad');

            // When menu foucs
            $('#skip_cloud_pc').on('sn:focused', function (e) {
            });

            $('#cloud_pc_next').on('sn:focused', function (e) {
            });

            $('#skip_cloud_pc').on('sn:enter-down', function (e) {
                $(".cloud_pc").hide();
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
            });

            $('#cloud_pc_next').on('sn:enter-down', function (e) {
                $(".cloud_pc").hide();
                $(".download_favourite").show();
                SN.focus("#favorite_download_next");
            });

            break;

        case "finish_screen":
            set_focus('finish_screen', 'finish_next');

            // When menu foucs
            $('#finish_next').on('sn:focused', function (e) {
            });

            $('#finish_next').on('sn:enter-down', function (e) {
                $(".finish_screen").hide();
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
            });

            break;

        case "email_phone_container":
            set_focus('email_phone_container', 'email_or_phone');

            // When menu foucs
            $('#email_or_phone').on('sn:focused', function (e) {
            });

            $('#send_otp_email').on('sn:focused', function (e) {
            });

            $('#send_otp_email').on('sn:enter-down', function (e) {
                var user_name = $("#email_or_phone").val();
                var password = $("#password").val();

                if (user_name == '') {
                    login_error_message("Username is required.")
                } else if (password == '') {
                    login_error_message("password is required.")
                } else if (user_name && password) {
                    setTimeout(function () {
                        loginApi();
                    }, 200);
                }
            });

            break;

        case "otp_container":
            set_focus('otp_container', 'otp');

            // When menu foucs
            $('#otp').on('sn:focused', function (e) {
                move_focus();
            });

            $('#verify_otp_email').on('sn:enter-down', function (e) {
                var user_name = document.getElementsByClassName('otp_enter').value;
                if (user_name != "") {
                    verify_otp();
                }
            });

            break;

        case "game_container":
            set_focus('vm_ip', 'continueAddHost');

            // When menu foucs
            $('#continueAddHost').on('sn:focused', function (e) {
            });

            $('#logout_button').on('sn:focused', function (e) {
            });

            $('#continueAddHost').on('sn:enter-down', function (e) {
                if (localStorage.getItem('vmip') !== "null" && localStorage.getItem('success') === "True") {
                    window.location.href = "Antplay/index.html";
                } else {
                    login_error_message("VM ip not found...");
                    console.log("vmip not found....");
                }
            });

            $('#logout_button').on('sn:enter-down', function (e) {
                $(".vm_ip").hide();
                endvmtime();
                shutdown_vm();
                document.getElementById("email_or_phone").value = "";
                document.getElementById("password").value = "";
                $(".email_phone_container").show();
                SN.focus("#email_or_phone");
                localStorage.clear();
            });

            break;

        case "subscription_page":
            set_focus('subscription_page', 'SubscriptionButton');

            // When menu foucs
            $('#subscription_page').on('sn:focused', function (e) {
            });

            $('#subscription_page').on('sn:enter-down', function (e) {
            });

            break;

    }
}

function set_focus(containerId, itemId) {
    console.log("set focus");
    var restrictVal = "self-first";
    if (containerId == "EXIT" || containerId == "RETRY_CANCEL") restrictVal = "self-only";

    SN.remove(containerId);
    SN.add({
        id: containerId,
        selector: '#' + containerId + ' .focusable',
        restrict: restrictVal,
        defaultElement: '#' + itemId,
        enterTo: 'last-focused'
    });
    SN.makeFocusable();
}


$(window).keydown(function (evt) {
    switch (evt.keyCode) {
        case 10009: // Return key
            if ($(".email_phone_container").hasClass("email_phone_container")) {
                console.log("exit the app....");
                endvmtime();
                shutdown_vm();
                tizen.application.getCurrentApplication().exit();
            }
            break;

        case 37: // LEFT arrow
            console.log("left key");
            if ($('.email_phone_container').hasClass('email_phone_container') && ($("#email_or_phone").is(":focus") || $("#password").is(":focus"))) {
                console.log("pointer move left ");
                var textEntered = $.trim($(':focus').val());
                if (textEntered) controlLeftArrowKeys();
            }
            break;

        case 39: // RIGHT arrow
            console.log("right key");
            if ($('.email_phone_container').hasClass('email_phone_container') && ($("#email_or_phone").is(":focus") || $("#password").is(":focus"))) {
                var textEntered = $.trim($(':focus').val());
                var input = document.getElementById($(":focus").attr("id"));
                var currentpos = input.selectionStart;
                // if (input.value.length == currentpos && $("#password").is(":focus")) SN.focus("#first_time");
                // else 
                if (textEntered && input.value.length > currentpos) controlrightArrowKeys();
            }
            break;
        default:
            console.log("Key code : " + evt.keyCode);
            break;
    }
});