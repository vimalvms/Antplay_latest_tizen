function changeSlide(moveTo) {
	let slides = document.getElementsByClassName("slider__slide");
	let navlinks = document.getElementsByClassName("slider__navlink");
	let currentSlide = 0;

	if (moveTo >= slides.length) { moveTo = 0; }
	if (moveTo < 0) { moveTo = slides.length - 1; }

	slides[currentSlide].classList.toggle("active");
	navlinks[currentSlide].classList.toggle("active");
	slides[moveTo].classList.toggle("active");
	navlinks[moveTo].classList.toggle("active");

	currentSlide = moveTo;
}

function validate_Phone_Number(user_name) {
	PHONE_EMAIL_VERIFICATION = "";

	var filter = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
	var pattern = new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
	if (filter.test(user_name)) {
		console.log(typeof (user_name));
		if (user_name != "") {
			$.ajax({
				type: 'GET',
				url: BASE_URL + "getuserbyphone/" + $("#email_or_phone").val(),
				dataType: 'json',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
				crossDomain: true,
				success: function (response, statusCode, xhr, status) {
					if (statusCode === "success") {
						console.log("success", response);
						$.each(response, function (index, value) {
							localStorage.setItem(index, value);
							PHONE_EMAIL_VERIFICATION = "phone_number";
							LOGIN_DATA = response;
							$(".email_phone_container").hide();
							$(".otp_container").show();
							SN.focus("#digit-1");
						});
					}
				},
				error: function (xhr, error) {
					login_error_message("Please enter correct mobile no...")
					console.log("error", xhr.responseText);
				}
			});
		} else {
			console.log("please fill mobile number or email address");
		}
	}
	else if (pattern.test(user_name)) {
		console.log(typeof (user_name));
		if (user_name != "") {
			$.ajax({
				type: 'GET',
				url: BASE_URL + "getuserbyemail/" + $("#email_or_phone").val(),
				dataType: 'json',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
				crossDomain: true,
				success: function (response, statusCode, xhr, status) {
					if (statusCode === "success") {
						console.log("success", response);
						$.each(response, function (index, value) {
							localStorage.setItem(index, value);
							PHONE_EMAIL_VERIFICATION = "email";
							LOGIN_DATA = response;
							$(".email_phone_container").hide();
							$(".otp_container").show();
							SN.focus("#digit-1");
						});
					}
				},
				error: function (xhr, error) {
					login_error_message("Please enter correct email...")
					console.log("error", xhr.responseText);
				}
			});
		} else {
			console.log("please fill mobile number or email address");
		}
	} else {
		console.log("please enter phone number or email");
	}
}


function navigation_focus() {
	manage_spatial_navigation("first_screen");

	manage_spatial_navigation("second_screen");

	manage_spatial_navigation("connect_gamepad");

	manage_spatial_navigation("download_favourite");

	manage_spatial_navigation("cloud_pc");

	manage_spatial_navigation("finish_screen");

	manage_spatial_navigation("email_phone_container");

	manage_spatial_navigation("otp_container");

	manage_spatial_navigation("game_container");

	manage_spatial_navigation("subscription_page");
}

function game_page_data() {
	console.log("game_page_data");
	var str = "";
	var Token = localStorage.getItem('token');
	if (Token != "") {
		var URL = BASE_URL + "getvmip";

		$.ajax({
			type: 'GET',
			url: URL,
			dataType: 'json',
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			crossDomain: true,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
			},
			success: function (response, statusCode) {
				if (response.message === "success") {
					GAME_PAGE_DATA = response;
					console.log("success", response, URL);
					console.log(_.size(GAME_PAGE_DATA["data"]));
					if (myInterval) clearInterval(myInterval);

					for (var i = 0; i < _.size(GAME_PAGE_DATA["data"]); i++) {
						localStorage.setItem("vmip", GAME_PAGE_DATA["data"][i]["vmip"]);
						VMIP = GAME_PAGE_DATA["data"][i]["vmip"];
						// $(".email_phone_container").hide();
						// $(".vm_ip").show();
						// SN.focus("#continueAddHost");
					}
				}
				$(".loader_container").hide();
				$("#loadingSpinner").hide();
				$(".vm_ip").show();
				SN.focus("#continueAddHost");

			},
			error: function (xhr, error) {
				login_error_message(xhr.responseJSON.message);
				console.log("error", xhr.responseJSON.message, xhr);
			}
		});
	} else {
		console.log("please fill mobile number or email address");
	}

}

function verify_otp() {

	console.log("verify_otp_email enter");
	var USERNAME = document.getElementsByClassName('otp_enter').value;

	if (USERNAME != "") {
		var URL = BASE_URL + "api/verifyOTPView/?" + PHONE_EMAIL_VERIFICATION + "=" + $("#email_or_phone").val() + '&otp=' + $("#digit-1").val() + $("#digit-2").val() + $("#digit-3").val() + $("#digit-4").val() + $("#digit-5").val() + $("#digit-6").val();
		$.ajax({
			type: 'POST',
			url: URL,
			dataType: 'json',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			crossDomain: true,
			success: function (response, statusCode, xhr, status) {
				if (statusCode === "success") {
					localStorage.setItem('token', response.data.access);
					console.log("success", response, URL);
					// SN.focus("#continueAddHost");
					// $(".otp_container").hide();
					// $(".game_container").show();
					localStorage.setItem("true", response.success);
					game_page_data();
				}
			},
			error: function (xhr, error) {
				login_error_message("Please enter correct otp...")
				console.log("error", xhr.responseText);
			}
		});
	} else {
		console.log("please fill mobile number or email address");
	}

}

function controlLeftArrowKeys() {
	console.log("left move");
	var leftmove;
	var input = document.getElementById($(":focus").attr("id"));

	if (input.value.length == 0) {
		return;
	} else {
		var currentpos = input.selectionStart; //getting current postion of cursor 
		leftmove = currentpos - 1;
		setCaretPosition(input, leftmove);
	}
}
function controlrightArrowKeys() {
	console.log("right move");
	var rightmove;
	var input = document.getElementById($(":focus").attr("id"));
	if (input.value.length == 0) {
		// if ($("#email_or_phone").is(":focus")) console.log("email_or_phone");
		// else if ($("#password").is(":focus")) SN.focus("#first_time");
		return;
	} else {
		var currentpos = input.selectionStart;  //getting current postion of cursor
		rightmove = currentpos + 1;
		setCaretPosition(input, rightmove);
	}
}
function setCaretPosition(ctrl, pos) {
	// Modern browsers
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(pos, pos);
		// IE8 and below
	} else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}

function move_focus() {
	$('.form-otp').find('input').each(function () {
		$(this).on('keyup', function (e) {
			console.log("11111111111........");
			var data = $(".otp_enter").val();
			var parent = $($(this).parent());
			if (e.keyCode == 37 && $(".otp_enter").val().length === 1) {
				console.log("2222222222.........", e);
				var prev = parent.find('input#' + $(this).data('previous'));
				if (prev.length) {
					var counter = 0;
					$('.form-otp').find('input').each(function () {
						console.log("444444444444444444...........");
						if ($(this).val() !== '') {
							counter - 1;
						} else {

						}
					});
				}
			}
			else
				if ($(".otp_enter").val().length === 1) {
					console.log("33333333333333333............", e);
					var next = parent.find('input#' + $(this).data('next'));
					if (next.length) {
						$(next).select();
						// }
						var counter = 0;
						$('.form-otp').find('input').each(function () {
							console.log("444444444444444444...........");
							if ($(this).val() == '' && !e.keyCode == 39) {
								counter + 1;
							} else if (e.keyCode == 39) {
								counter + 1;
							}
						});
					}
				}
		});
	});

}

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

function hideShowError(text, left) {
	clearInterval(HIDE_SHOW_LOGIN_ERROR);
	if ($(".error_overlay").css("display") == "none") $(".error_overlay").text(text).css({ "display": "block" });

	HIDE_SHOW_LOGIN_ERROR = setTimeout(function () {
		$(".error_overlay").css({ "display": "none" });
	}, 20000);
}

function loginApi() {
	var email = $("#email_or_phone").val();
	var password = $("#password").val();
	$.ajax({
		type: 'POST',
		url: BASE_URL + "login/",
		// url:"https://uat.antplay.tech/v1/api/login/",
		dataType: 'json',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		crossDomain: true,
		data: {
			"email": $("#email_or_phone").val(),
			"password": $("#password").val(),
		},
		success: function (response, statusCode, xhr, status) {
			// response.is_subscribed = false;
			if (statusCode === "success") {
				console.log("success", response);
				$.each(response, function (index, value) {
					localStorage.setItem(index, value);
					localStorage.setItem("password", password);
					localStorage.setItem('token', response.data.access);
					localStorage.setItem("true", response.success);
				});
				if (localStorage.getItem("is_subscribed") === "true") {
					console.log("success", response, URL);
					$(".email_phone_container").hide();
					$(".vm_ip").show();
					SN.focus("#continueAddHost");
					get_vm();
				}
				else if(localStorage.getItem("is_subscribed") === "false"){
					console.log("subscription page........");
					setTimeout(function () {
						subscription_plan();
					}, 1000);
				}
			}
		},
		error: function (xhr, error) {
			login_error_message(xhr.responseJSON.detail);
			console.log("error", xhr.responseJSON.detail, xhr);
		}
	});
}

function subscription_plan() {
	console.log("subscription_plan..........");
	var str = '',
		upFocus = '',
		downFocus = '',
		leftFocus = '',
		rightFocus = ' ',
		currentClass = '';
	tabindex = 6;
	$.ajax({
		type: 'GET',
		// url: "https://uat.antplay.tech/v1/api/" + "getbillingplan",
		url: "https://api.antplay.tech/v1/api/getbillingplan?user_type=tizen",
		dataType: 'json',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		crossDomain: true,
		// data: {
		// 	"vmid": vmid,
		// },
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
		},
		success: function (response, statusCode, xhr, status) {
			console.log(response);
			if (statusCode === "success") {
				$(".email_phone_container").hide();
				$(".subscription_page").show();
				SUBSCRIPTION_DATA = response;
				console.log("success", response);
				for (var i = 0; i < _.size(SUBSCRIPTION_DATA["data"]); i++) {
					localStorage.setItem("subscription_plan", SUBSCRIPTION_DATA["data"][i]["id"]);
					console.log(_.size(SUBSCRIPTION_DATA["data"]));

					var id = ' id="plan_' + i + '" ';

					if (i == 0) currentClass = " current ";
					else currentClass = '';

					if (i == 0) upFocus = ' data-sn-up="#menu_0" ';
					else upFocus = ' data-sn-up="#plan_' + i + '" ';

					downFocus = ' data-sn-down="#SubscriptionButton"';

					rightFocus = ' data-sn-right="#plan_' + (i + 1) + '" ';
					leftFocus = ' data-sn-left="#plan_' + (i - 1) + '" ';

					str += '<div class="columns focusable" ' + currentClass + '" tabindex="' + tabindex + '" data-index="' + i + '" ' + id + upFocus + downFocus + rightFocus + leftFocus + '>';
					str += '<ul class="price">';
					str += '<li class="header">' + SUBSCRIPTION_DATA["data"][i]["plan_name"] + '</li>';
					str += '<li class="grey">' + SUBSCRIPTION_DATA["data"][i]["gpu"] + '</li>';
					// str += '<li>' + SUBSCRIPTION_DATA["data"][i]["hour_limit"] + '</li>';
					str += '<li>Unlimited Hours</li>';
					str += '<li>' + SUBSCRIPTION_DATA["data"][i]["plan_type"] + '</li>';
					str += '<li>' + SUBSCRIPTION_DATA["data"][i]["ram"] + '</li>';
					str += '<li>' + SUBSCRIPTION_DATA["data"][i]["ssd"] + '</li>';
					str += '<li>' + SUBSCRIPTION_DATA["data"][i]["price"] + '</li>';
					str += '</ul>';
					str += '</div>';

					$("#subscription_data").html(str);
					SN.focus("#SubscriptionButton")
				}
			}
		},
		error: function (xhr, error) {
			login_error_message(xhr.responseJSON.detail);
			console.log("error", xhr.responseJSON.detail, xhr);
		}
	});
}

function get_vm() {
	$(".vm_ip").hide();
	$(".loader_container").show();
	$("#loadingSpinner").show();
	if (localStorage.getItem('vmip')) localStorage.removeItem("vmip");
	console.log("get_vm()...");
	var str = "";
	var Token = localStorage.getItem('token');
	if (Token != "") {
		var URL = BASE_URL + "getvm";

		$.ajax({
			type: 'GET',
			url: URL,
			dataType: 'json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
			},
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			crossDomain: true,
			success: function (response, statusCode) {
				console.log("success", response, URL);
				$.each(response.data[0], function (index, value) {
					localStorage.setItem(index, value);

					// if(response.data[0]["status"] == "stopped"){
					// 	console.log("status", response.data[0]["status"]);
					// 	start_vm();
					// }else{
					// 	console.log("status", response.data[0]["status"]);
					// 	game_page_data();
					// }

					// 	for (var i = 0; i < _.size(response["data"]); i++) {
					// 		localStorage.setItem("vmip", response["data"][i]["vmip"]);
					// 		if (response["data"][i]["time_remaining"] === 0) {
					// 			console.log("subscription page...............");
					// 			$(".subscription_text").show();
					// 			setInterval(function () {
					// 				get_vm();
					// 			}, 5000);
					// 		} else {
					// 			game_page_data();
					// 		}
					// 	}
				});

				if (response.data[0]["status"] == "stopped" && response.data[0]["start_vm_call_count"] == "0") {
					console.log("status", response.data[0]["status"]);
					game_page_data();
					start_vm();
				} else {
					console.log("status", response.data[0]["status"]);
					setTimeout(function () {
						start_vm();
					}, 2000);
					if (localStorage.getItem('vmip') === "null") {
						myInterval = setInterval(function () { game_page_data(); }, 1000);
						// setTimeout(function () {
							start_vm();
						// }, 2000);
						//  if(myInterval)clearInterval(myInterval);
					} else {
						// clearInterval(myInterval);
						$(".loader_container").hide();
						$("#loadingSpinner").hide();
						$(".vm_ip").show();
						SN.focus("#continueAddHost");
					}
				}
				console.log("get vm ip on the play button..........");
				console.log(_.size(response["data"]));

			},
			error: function (xhr, error) {
				console.log("error", xhr.responseText);
			}
		});
	} else {
		console.log("please fill mobile number or email address");
	}

}

function start_vm() {
	$.ajax({
		type: 'POST',
		url: BASE_URL + "startvm/",
		dataType: 'json',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		crossDomain: true,
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
		},
		data: {
			"vmid": localStorage.getItem("vmid"),
		},
		success: function (response, statusCode, xhr, status) {
			if (statusCode === "success") {
				console.log("success", response);
				$.each(response, function (index, value) {
					localStorage.setItem(index, value);
				});
			}
		},
		error: function (xhr, error) {
			login_error_message(xhr.responseJSON.detail);
			console.log("error", xhr.responseJSON.detail, xhr);
		}
	});
}

function shutdown_vm() {
	console.log("shutdown_vm.....");
	$.ajax({
		type: 'POST',
		url: "https://api.antplay.tech/v1/api/shutdownvm/",
		dataType: 'json',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'Accept-Language': 'en-US' },
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		crossDomain: true,
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
		},
		data: {
			"vmid": localStorage.getItem("vmid"),
		},
		success: function (response, statusCode, xhr, status) {
			if (statusCode === "success") {
				console.log("success", response);
				$.each(response, function (index, value) {
					localStorage.setItem(index, value);
				});
			}
		},
		error: function (xhr, error) {
			login_error_message(xhr.responseJSON.detail);
			console.log("error", xhr.responseJSON.detail, xhr);
		}
	});
}

function endvmtime() {
	console.log("endvmtime");
	var str = "";
	var time_remaining = localStorage.getItem("time_remaining");
	var vmid = localStorage.getItem('vmid');
	if (vmid != "") {
		var URL = "https://api.antplay.tech/v1/api/endvmtime/";
		$.ajax({
			type: 'POST',
			url: URL,
			dataType: 'json',
			data: {
				"vmid": vmid,
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
			},
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			crossDomain: true,
			success: function (response, statusCode) {
				console.log(response, URL);
				// if (response.success === "True") {
				//   // secondsToHms(time_remaining);
				//   str+="<span>"+ secondsToHms(time_remaining) +"</span>";

				// }

				// $("#time_remaining").html(str);
			},
			error: function (xhr, error) {
				console.log("error", xhr.responseText);
			}
		});
	} else {
		console.log("otp not validate...");
	}

}
