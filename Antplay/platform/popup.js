function hide_show_modal(action, name, message) {
    console.log(action, name, message);
    var modalName = $(".modal_container").attr("data-modal-name");


    if (action == true && !modalName) {
        // Set previous depth before open modal box
        if ($(".mdl-layout__content").hasClass("fullscreen")) {
        }
        
        // Remove active class from all container and add to modal box
        remove_add_active_class("modal_container");
        $(".modal_container").addClass("active");

        if (name == "EXIT") {
            $(".exit_modal").addClass("exit_modal_show");
            $('.mod_button_sel').text("NO");
            $('.mod_button_un_sel').text("YES");
            $(".mod_text_color").html(message);

        } else if (name == "RETRY_CANCEL") {
            $(".retry_modal").addClass("popup_new_box");
            $(".mod_text_color").html(message);
            $(".mod_name").html(APP_NAME);
            $('.mod_button_sel').text("RETRY");
            $('.mod_button_un_sel').text("CANCEL");

        } else if (name == "RETRY_EXIT") {
            $(".retry_modal").addClass("popup_new_box");
            $(".mod_text_color").html(message);
            $(".mod_name").html(APP_NAME);

            $('.mod_button_sel').text("RETRY");
            $('.mod_button_un_sel').text("EXIT");

        }

        $(".modal_container").attr("data-modal-name", name);
        manage_spatial_navigation(name);

        if (name == "EXIT") {
            //webkitTransitionEnd oTransitionEnd MSTransitionEnd
            $(".exit_modal").one("transitionend", function () {
                manage_spatial_navigation(name);
                SN.focus("exitModal");
            });

        } else {
            manage_spatial_navigation(name);
            SN.focus("retryModal");
        }

    }
    else if (action == false) {
        if (name == "EXIT") {
            $(".exit_modal").removeClass("exit_modal_show");

        } else if (name == "RETRY_CANCEL" || name == "RETRY_EXIT") {
            $(".retry_modal").removeClass("popup_new_box");
        }
    } 
}


function manage_spatial_navigation(containerClass, favoriteStatus, vodId) {
    switch (containerClass) {

        case "EXIT":
            set_focus('exitModal', 'noButton');

            SN.focus("exitModal");
            $('#exitModal').off('sn:enter-down');
            $('#exitModal').on('sn:enter-down', function (e) {
                console.log("exitModal sn:enter-down");
                if ($('#noButton').is(":focus")) {
                    console.log('hide popup');
                    $(".exit_modal").hide();
                    hide_show_modal(false, 'EXIT');
                    $(".modal_container").removeClass("active");
                    $("#nacl_module").focus();
                } else if ($("#yesButton").is(":focus")) {
                    console.log('exit app');
                    $(".exit_modal").hide();
                    endvmtime();
                    shutdown_vm();
                    // window.location.href="./Antplay/index.html";
                    // $(".vm_ip").show();
                    // SN.focus("#continueAddHost");
                    tizen.application.getCurrentApplication().exit();
                }
            });
            break;

        case "RETRY_CANCEL":
            set_focus('retryModal', 'retryButton');
            SN.focus("retryModal");

            $('#retryModal').off('sn:enter-down');
            $('#retryModal').on('sn:enter-down', function (e) {
                console.log("retryModal sn:enter-down");
                var modalName = "RETRY_CANCEL";
            });
            break;

        case "RETRY_EXIT":
            set_focus('retryModal', 'retryButton');
            SN.focus("retryModal");

            $('#retryModal').off('sn:enter-down');
            $('#retryModal').on('sn:enter-down', function (e) {
                console.log("retryModal sn:enter-down");
                var modalName = "RETRY_CANCEL";
                hide_show_modal(false, modalName);
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