window.onload = function() {
	
	window.SN = SpatialNavigation;
	SN.init();
	navigation_focus();

	document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            console.log("App in background");
            endvmtime();
			shutdown_vm();
        } else {
            console.log("App in forground");
            webapis.tvinfo.registerInAppCaptionControl(true);
            webapis.tvinfo.showCaption(false);
            webapis.avplay.restore();
        }
    });

	var email = localStorage.getItem("email");
	var password = localStorage.getItem("password");
	var vmip = localStorage.getItem("vmip");
	var token = localStorage.getItem("token");
	VMIP = vmip;
	
	document.getElementById("email_or_phone").value = email;
	document.getElementById("password").value = password;
	
	if(email && password && vmip){
		// if(vmip) localStorage.removeItem("vmip");
		$(".first_screen").hide();
		$(".second_screen").hide();
		$(".third_screen").hide();
		$(".fourth_screen").hide();
		$(".fifth_screen").hide();
		$(".sixth_screen").hide();
		// setTimeout(function(){
		// 	$(".email_phone_container").show();
		// 	SN.focus("#send_otp_email");
		// },10000);
		$(".email_phone_container").hide();
		// SN.remove("#send_otp_email");
		$(".vm_ip").show();
		SN.focus("#continueAddHost");
		// if(token) localStorage.removeItem("token");
		// setTimeout(function(){},5000)
		get_vm();
	}
	// else if(email && password && !vmip){
	// 	get_vm();
	// }
	// else if(email && password && vmip=="null"){
	// 	$(".email_phone_container").show();
	// 	SN.focus("#send_otp_email");
	// }
}