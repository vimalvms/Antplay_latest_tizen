var hosts = {}; // hosts is an associative array of NvHTTP objects, keyed by server UID
var activePolls = {}; // hosts currently being polled.  An associated array of polling IDs, keyed by server UID
var pairingCert;
var myUniqueid = '0123456789ABCDEF'; // Use the same UID as other Moonlight clients to allow them to quit each other's games
var api; // `api` should only be set if we're in a host-specific screen. on the initial screen it should always be null.
var isInGame = false; // flag indicating whether the game stream started
var windowState = 'normal'; 
var ClearTimer = '' ;
var downloadTimer = '';// chrome's windowState, possible values: 'normal' or 'fullscreen'

// Called by the common.js module.
function attachListeners() {
  changeUiModeForNaClLoad();

  $('.resolutionMenu li').on('click', saveResolution);
  $('.framerateMenu li').on('click', saveFramerate);
  $('#bitrateSlider').on('input', updateBitrateField); // input occurs every notch you slide
  //$('#bitrateSlider').on('change', saveBitrate); //FIXME: it seems not working
  $("#remoteAudioEnabledSwitch").on('click', saveRemoteAudio);
  $('#optimizeGamesSwitch').on('click', saveOptimize);
  $('#framePacingSwitch').on('click', saveFramePacing);
  $('#audioSyncSwitch').on('click', saveAudioSync);
  $('#addHostCell').on('click', addHost);
  $('#backIcon').on('click', showHostsAndSettingsMode);
  $('#quitCurrentApp').on('click', stopGameWithConfirmation);

  const registerMenu = (elementId, view) => {
    $(`#${elementId}`).on('click', () => {
      if (view.isActive())
        Navigation.pop();
      else
        Navigation.push(view);
    });
  }
  registerMenu('selectResolution', Views.SelectResolutionMenu);
  registerMenu('selectFramerate', Views.SelectFramerateMenu);
  registerMenu('bandwidthMenu', Views.SelectBitrateMenu);

  $(window).resize(fullscreenNaclModule);
  if (runningOnChrome()) {
    chrome.app.window.current().onMaximized.addListener(fullscreenChromeWindow);
  }

  Controller.startWatching();
  window.addEventListener('gamepadbuttonpressed', (e) => {
    const pressed = e.detail.pressed;
    const key = e.detail.key;

    if (!pressed)
      return;

    const gamepadMapping = {
      0: () => Navigation.accept(),
      1: () => Navigation.back(),
      12: () => Navigation.up(),
      13: () => Navigation.down(),
      14: () => Navigation.left(),
      15: () => Navigation.right(),
    };
    if (gamepadMapping[key]) {
      gamepadMapping[key]();
    }
  });
}

function fullscreenChromeWindow() {
  console.log("laptop screen.......................");
  // when the user clicks the maximize button on the window,
  // FIRST restore it to the previous size, then fullscreen it to the whole screen
  // this prevents the previous window size from being 'maximized',
  // and allows us to functionally retain two window sizes
  // so that when the user hits `esc`, they go back to the "restored" size,
  // instead of "maximized", which would immediately go to fullscreen
  chrome.app.window.current().restore();
  chrome.app.window.current().fullscreen();
}

function loadWindowState() {
  if (!runningOnChrome()) {
    return;
  }

  console.log('restoring state');
  chrome.storage.sync.get('windowState', function (item) {
    // load stored window state
    windowState = (item && item.windowState) ?
      item.windowState :
      windowState;

    // subscribe to chrome's windowState events
    chrome.app.window.current().onFullscreened.addListener(onFullscreened);
    chrome.app.window.current().onBoundsChanged.addListener(onBoundsChanged);
  });
}

function onFullscreened() {
  if (!isInGame && windowState == 'normal') {
    console.log("window screen.......................");
    storeData('windowState', 'fullscreen', null);
    windowState = 'fullscreen';
  }
}

function onBoundsChanged() {
  if (!isInGame && windowState == 'fullscreen') {
    console.log("window inside screen...................");
    storeData('windowState', 'normal', null);
    windowState = 'normal';
  }
}

function changeUiModeForNaClLoad() {
  console.log("inside laptop screen................");
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  $('#main-navigation').children().hide();
  // $("#main-content").children().not("#listener, #naclSpinner").hide();
  $('#naclSpinnerMessage').text('Loading Antplay plugin...');
  $('#naclSpinner').css('display', 'inline-block');
}

function startPollingHosts() {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log("startPollingHosts..............");
  for (var hostUID in hosts) {
    console.log("startPollingHosts.....11111111111111.........");
    beginBackgroundPollingOfHost(hosts[hostUID]);
  }
}

function stopPollingHosts() {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log("stopPollingHosts..............");
  for (var hostUID in hosts) {
    console.log("stopPollingHosts.....111111111111.........");
    stopBackgroundPollingOfHost(hosts[hostUID]);
  }
}

function restoreUiAfterNaClLoad() {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log("restoreUiAfterNaClLoad..........");
  $('#main-navigation').children().not("#quitCurrentApp").show();
  // $("#main-content").children().not("#listener, #naclSpinner, #game-grid").show();
  $("#main-content").children().not("#listener, #naclSpinner").show();
  $('#naclSpinner').hide();
  $('#loadingSpinner').css('display', 'none');
  // hostAdd();
  Navigation.push(Views.Hosts);
  showHostsAndSettingsMode();

  findNvService(function (finder, opt_error) {
    if (finder.byService_['_nvstream._tcp']) {
      console.log("findNvService..........eeeeeeee...........");
      var ips = Object.keys(finder.byService_['_nvstream._tcp']);
      for (var i in ips) {
        var ip = ips[i];
        if (finder.byService_['_nvstream._tcp'][ip]) {
          console.log("findNvService..............");
          var mDnsDiscoveredHost = new NvHTTP(ip, myUniqueid);
          mDnsDiscoveredHost.pollServer(function (returneMdnsDiscoveredHost) {
            console.log("111111111111................");
            // Just drop this if the host doesn't respond
            if (!returneMdnsDiscoveredHost.online) {
              return;
            }

            if (hosts[returneMdnsDiscoveredHost.serverUid] != null) {
              console.log("2222222222222222222222222.................");
              // if we're seeing a host we've already seen before, update it for the current local IP.
              hosts[returneMdnsDiscoveredHost.serverUid].address = returneMdnsDiscoveredHost.address;
              hosts[returneMdnsDiscoveredHost.serverUid].updateExternalAddressIP4();
            } else {
              console.log("33333333333333333333....................");
              // Host must be in the grid before starting background polling
              addHostToGrid(returneMdnsDiscoveredHost, true);
              beginBackgroundPollingOfHost(returneMdnsDiscoveredHost);

            }

            saveHosts();
          });
        }
      }
    }
  });
}

function beginBackgroundPollingOfHost(host) {
  var el = document.querySelector('#hostgrid-' + host.serverUid)
  if (host.online) {
    el.classList.remove('host-cell-inactive')
    // The host was already online. Just start polling in the background now.
    activePolls[host.serverUid] = window.setInterval(function () {
      // every 5 seconds, poll at the address we know it was live at
      host.pollServer(function () {
        if (host.online) {
          el.classList.remove('host-cell-inactive')
        } else {
          el.classList.add('host-cell-inactive')
        }
      });
    }, 5000);
  } else {
    el.classList.add('host-cell-inactive')
    // The host was offline, so poll immediately.
    host.pollServer(function () {
      if (host.online) {
        el.classList.remove('host-cell-inactive')
      } else {
        el.classList.add('host-cell-inactive')
      }

      // Now start background polling
      activePolls[host.serverUid] = window.setInterval(function () {
        // every 5 seconds, poll at the address we know it was live at
        host.pollServer(function () {
          if (host.online) {
            el.classList.remove('host-cell-inactive')
          } else {
            el.classList.add('host-cell-inactive')
          }
        });
      }, 5000);
    });
  }
}

function stopBackgroundPollingOfHost(host) {
  console.log('%c[index.js, backgroundPolling]', 'color: green;', 'Stopping background polling of host ' + host.serverUid + '\n', host, host.toString()); //Logging both object (for console) and toString-ed object (for text logs)
  window.clearInterval(activePolls[host.serverUid]);
  delete activePolls[host.serverUid];
}

function snackbarLog(givenMessage) {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log('%c[index.js, snackbarLog]', 'color: green;', givenMessage);
  var data = {
    message: givenMessage,
    timeout: 2000
  };
  document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(data);
  $('#pairingDialogText').hide();
  // addHost();
  $("#dialogInputHost").value = localStorage.getItem("vmip");
  var inputHost = $("#dialogInputHost").value = localStorage.getItem("vmip");
  var _nvhttpHost = new NvHTTP(inputHost, myUniqueid, inputHost);

  // if(saveHosts()) {
  //   console.log("saveHosts........");
  //   removeClicked(_nvhttpHost);
  // }

  _nvhttpHost.refreshServerInfoAtAddress(inputHost).then(function (success) {
    console.log("111111111111..........");
    $("#host-grid").hide();
    $('#main-navigation').hide();
    $('#naclSpinner').show();
    $('#loadingSpinner').show();
    // modal.close();
    // Navigation.pop();

    // Check if we already have record of this host. If so,
    // we'll need the PPK string to ensure our pairing status is accurate.
    if (hosts[_nvhttpHost.serverUid] != null) {
      // Update the addresses
      hosts[_nvhttpHost.serverUid].address = _nvhttpHost.address;
      hosts[_nvhttpHost.serverUid].userEnteredAddress = _nvhttpHost.userEnteredAddress;

      // Use the host in the array directly to ensure the PPK propagates after pairing
      pairTo(hosts[_nvhttpHost.serverUid], function () {
        $("#host-grid").hide();
        $('#main-navigation').hide();
        $('#naclSpinner').show();
        $('#loadingSpinner').show();
        console.log("222222222222222..............");
        saveHosts();
      });
    }
    else {
      pairTo(_nvhttpHost, function () {
        console.log("333333333333333333................");
        $("#host-grid").hide();
        $('#main-navigation').hide();
        $('#naclSpinner').show();
        $('#loadingSpinner').show();
        // Host must be in the grid before starting background polling
        addHostToGrid(_nvhttpHost);
        beginBackgroundPollingOfHost(_nvhttpHost);
        saveHosts();
        stopPollingHosts();
        hostChosen(_nvhttpHost);
      });
    }
  }.bind(this),
    function (failure) {
      snackbarLog('Failed to connect to ' + _nvhttpHost.hostname + '! Ensure that GameStream is enabled in GeForce Experience.');
    }.bind(this));
}

function snackbarLogLong(givenMessage) {
  console.log('%c[index.js, snackbarLog]', 'color: green;', givenMessage);
  endvmtime();
  var data = {
    message: givenMessage,
    timeout: 5000
  };
  document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(data);
}

function updateBitrateField() {
  $('#bitrateField').html($('#bitrateSlider').val() + " Mbps");
  saveBitrate();
}

function moduleDidLoad() {
  loadHTTPCerts();
}

// pair to the given NvHTTP host object.  Returns whether pairing was successful.
function pairTo(nvhttpHost, onSuccess, onFailure) {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  if (!onFailure) {
    onFailure = function () { }
  }

  if (!pairingCert) {
    snackbarLog('ERROR: cert has not been generated yet. Is NaCl initialized?');
    console.warn('%c[index.js]', 'color: green;', 'User wants to pair, and we still have no cert. Problem = very yes.');
    onFailure();
    return;
  }

  nvhttpHost.pollServer(function (ret) {
    if (!nvhttpHost.online) {
      snackbarLog('Failed to connect to ' + nvhttpHost.hostname + '! Ensure that GameStream is enabled in GeForce Experience.');
      console.error('%c[index.js]', 'color: green;', 'Host declared as offline:', nvhttpHost, nvhttpHost.toString()); //Logging both the object and the toString version for text logs
      onFailure();
      return;
    }

    if (nvhttpHost.paired) {
      onSuccess();
      return;
    }

    randomNumber = String("0000" + (Math.random() * 10000 | 0)).slice(-4);
    var pairingDialog = document.querySelector('#pairingDialog');
    $('#pairingDialogText').html('Please enter the number ' + randomNumber + ' on the GFE dialog on the computer.  This dialog will be dismissed once complete');
    // pairingDialog.showModal();
    // Navigation.push(Views.PairingDialog);
    // setTimeout(function(){
    otp_validate();
    // },500);

    $('#cancelPairingDialog').off('click');
    $('#cancelPairingDialog').on('click', function () {
      pairingDialog.close();
      Navigation.pop();
    });

    console.log('%c[index.js]', 'color: green;', 'Sending pairing request to ' + nvhttpHost.hostname + ' with PIN: ' + randomNumber);
    nvhttpHost.pair(randomNumber).then(function () {
      snackbarLog('Pairing successful');
      pairingDialog.close();
      Navigation.pop();
      onSuccess();
    }, function (failedPairing) {
      snackbarLog('Failed pairing to: ' + nvhttpHost.hostname);
      if (nvhttpHost.currentGame != 0) {
        $('#pairingDialogText').html('Error: ' + nvhttpHost.hostname + ' is busy.  Stop streaming to pair.');
        $('#pairingDialogText').hide();
        // addHost();
      } else {
        $('#pairingDialogText').html('Error: failed to pair with ' + nvhttpHost.hostname + '.');
        $('#pairingDialogText').hide();
        // addHost();
      }
      console.log('%c[index.js]', 'color: green;', 'Failed API object:', nvhttpHost, nvhttpHost.toString()); //Logging both the object and the toString version for text logs
      onFailure();
    });
  });
}

function otp_validate() {
  console.log("otp_validate");
  var str = "";
  var Token = localStorage.getItem('token');
  if (Token != "") {
    var URL = "https://api.antplay.tech/v1/api/vmauth";
    $.ajax({
      type: 'POST',
      url: URL,
      dataType: 'json',
      data: {
        "pin": randomNumber,
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
      },
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      crossDomain: true,
      success: function (response, statusCode) {
        console.log(response, URL);
        // setInterval(function(){

        // },1000);
        // setInterval(startvmtime, 1000);
        // startvmtime();
        if (response.data.status != "true") {
          otp_validate();
        }
      },
      error: function (xhr, error) {
        console.log("error", xhr.responseText);
      }
    });
  } else {
    console.log("otp not validate...");
  }

}

function startvmtime() {
  console.log("startvmtime");
  var str = "";
  // const d = new Date();
  var time_remaining = localStorage.getItem("time_remaining");
  var vmid = localStorage.getItem('vmid');
  if (vmid != "") {
    var URL = "https://api.antplay.tech/v1/api/startvmtime/";
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
        secondsToHms(time_remaining);
        $("#time_remaining").show();
        // countdownTimeStart();
        // if (response.success === "True") {
        //   // secondsToHms(time_remaining);
        //   str += "<span>" + secondsToHms(time_remaining) + "</span>";

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
  // clearInterval(ClearTimer);
  // clearInterval(downloadTimer);
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
        clearInterval(ClearTimer);
        clearInterval(downloadTimer);
        $("#time_remaining").hide();
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

function countdownTimeStart() {

  var time = localStorage.getItem("time_remaining");

  var countDownDate = new Date(time).getTime();

  // Update the count down every 1 second
  ClearTimer = setInterval(function () {

    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now an the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    document.getElementById("time_remaining").innerHTML = hours
      + minutes + seconds;

    // If the count down is over, write some text 
    if (distance < 0) {
      clearInterval(ClearTimer);
      document.getElementById("time_remaining").innerHTML = "EXPIRED";
    }
  }, 1000);
}

function secondsToHms(d) {
  var timeleft = d;
  downloadTimer = setInterval(function () {
  var h = Math.floor(timeleft / 3600);
  var m = Math.floor(timeleft % 3600 / 60);
  var s = Math.floor(timeleft % 3600 % 60);

  var hDisplay = h <= 9 ? '0'+ h : h;
  var mDisplay = m <= 9 ? '0'+ m : m;
  var sDisplay = s <= 9 ? '0'+ s : s;

  // var hDisplay = h > 0 ? h + (h == 1 ? "" : "") : "00";
  // var mDisplay = m > 0 ? m + (m == 1 ? "" : "") : "00";
  // var sDisplay = s > 0 ? s + (s == 1 ? "" : "") : "00";
  // return hDisplay + ':' + mDisplay + ':' + sDisplay;
  var remainingTime = hDisplay + ':' + mDisplay + ':' + sDisplay;

  if (timeleft <= 0) {
    clearInterval(downloadTimer);
    document.getElementById("time_remaining").innerHTML = "Finished";
    endvmtime();
    shutdown_vm();
    $(".exit_modal").show();
    $(".exit_modal").addClass("exit_modal_show");
    $(".modal_container").addClass("active");
    hide_show_modal(true, "EXIT", "your plan has been expired. please buy the subscription?");
    SN.focus("#noButton");
  } else {
    document.getElementById("time_remaining").innerHTML = "Time Remaining" + ":" + remainingTime;
  }
  timeleft -= 1;
  }, 1000);
}

function hostChosen(host) {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log("hostChosen.............");

  if (!host.online) {
    return;
  }

  // Avoid delay from other polling during pairing
  stopPollingHosts();

  api = host;
  if (!host.paired) {
    // Still not paired; go to the pairing flow
    pairTo(host, function () {
      showApps(host);
      saveHosts();
      Navigation.push(Views.Apps);
    },
      function () {
        startPollingHosts();
      });
  } else {
    // When we queried again, it was paired, so show apps.
    showApps(host);
    Navigation.push(Views.Apps);
  }
}

// the `+` was selected on the host grid.
// give the user a dialog to input connection details for the PC
function addHost() {
  console.log("addHost................");
  $("#dialogInputHost").value = localStorage.getItem("vmip");
  var modal = document.querySelector('#addHostDialog');
  modal.showModal();
  Navigation.push(Views.AddHostDialog);
  // document.getElementById('dialogInputHost').value = localStorage.getItem("vmip");

  // drop the dialog if they cancel
  $('#cancelAddHost').off('click');
  $('#cancelAddHost').on('click', function () {
    modal.close();
    Navigation.pop();
  });

  // $("#dialogInputHost").remove();
  // $("#continueAddHost").focus();

  // try to pair if they continue
  // $('#continueAddHost').off('click');
  // $('#continueAddHost').on('click', function() {

  // var input_vm_ip = $("#dialogInputHost").val() = localStorage.getItem("vmip");
  $("#dialogInputHost").value = localStorage.getItem("vmip");
  var inputHost = $("#dialogInputHost").value = localStorage.getItem("vmip");
  var _nvhttpHost = new NvHTTP(inputHost, myUniqueid, inputHost);

  // if(saveHosts()) {
  //   console.log("saveHosts........");
  //   removeClicked(_nvhttpHost);
  // }

  _nvhttpHost.refreshServerInfoAtAddress(inputHost).then(function (success) {
    console.log("111111111111..........");
    modal.close();
    Navigation.pop();

    // Check if we already have record of this host. If so,
    // we'll need the PPK string to ensure our pairing status is accurate.
    if (hosts[_nvhttpHost.serverUid] != null) {
      // Update the addresses
      hosts[_nvhttpHost.serverUid].address = _nvhttpHost.address;
      hosts[_nvhttpHost.serverUid].userEnteredAddress = _nvhttpHost.userEnteredAddress;

      // Use the host in the array directly to ensure the PPK propagates after pairing
      pairTo(hosts[_nvhttpHost.serverUid], function () {
        console.log("222222222222222..............");
        saveHosts();
      });
    }
    else {
      pairTo(_nvhttpHost, function () {
        console.log("333333333333333333................");
        // Host must be in the grid before starting background polling
        addHostToGrid(_nvhttpHost);
        beginBackgroundPollingOfHost(_nvhttpHost);
        saveHosts();
        stopPollingHosts();
        hostChosen(_nvhttpHost);
      });
    }
  }.bind(this),
    function (failure) {
      snackbarLog('Failed to connect to ' + _nvhttpHost.hostname + '! Ensure that GameStream is enabled in GeForce Experience.');
    }.bind(this));
  // });
}

function remove_add_active_class(className) {
  console.log("remove add active class");
  if ($("body").find(".active").length > 0) {
    $("body").find(".active").each(function () {
      if ($(this).className != className) $(this).removeClass("active");
    });
  }
  if (className != "modal_container") {
    $(".home_container").addClass("active");
  }
  $("." + className).addClass("active");
}


// host is an NvHTTP object
function addHostToGrid(host, ismDNSDiscovered) {

  var outerDiv = $("<div>", {
    class: 'host-container mdl-card mdl-shadow--4dp',
    id: 'host-container-' + host.serverUid,
    role: 'link',
    tabindex: 0,
    'aria-label': host.hostname
  });
  var cell = $("<div>", {
    class: 'mdl-card__title mdl-card--expand',
    id: 'hostgrid-' + host.serverUid
  });
  $(cell).prepend($("<h2>", {
    class: "mdl-card__title-text",
    html: host.hostname
  }));
  var removalButton = $("<div>", {
    class: "remove-host",
    id: "removeHostButton-" + host.serverUid,
    role: 'button',
    tabindex: 0,
    'aria-label': 'Remove host ' + host.hostname
  });
  removalButton.off('click');
  removalButton.click(function () {
    removeClicked(host);
  });
  // cell.off('click');
  // cell.click(function() {
  hostChosen(host);
  // });
  outerDiv.keypress(function (e) {
    if (e.keyCode == 13) {
      hostChosen(host);
    }
  });
  $(outerDiv).append(cell);
  if (!ismDNSDiscovered) {
    // we don't have the option to delete mDNS hosts.  So don't show it to the user.
    $(outerDiv).append(removalButton);
  }
  $('#host-grid').append(outerDiv);
  hosts[host.serverUid] = host;
  if (ismDNSDiscovered) {
    hosts[host.serverUid].updateExternalAddressIP4();
  }
}

function removeClicked(host) {
  var deleteHostDialog = document.querySelector('#deleteHostDialog');
  document.getElementById('deleteHostDialogText').innerHTML =
    ' Are you sure you want to delete ' + host.hostname + '?';
  deleteHostDialog.showModal();
  Navigation.push(Views.DeleteHostDialog);

  $('#cancelDeleteHost').off('click');
  $('#cancelDeleteHost').on('click', function () {
    deleteHostDialog.close();
    Navigation.pop();
  });

  // locally remove the hostname/ip from the saved `hosts` array.
  // note: this does not make the host forget the pairing to us.
  // this means we can re-add the host, and will still be paired.
  // $('#continueDeleteHost').off('click');
  // $('#continueDeleteHost').on('click', function() {
  var deleteHostDialog = document.querySelector('#deleteHostDialog');
  $('#host-container-' + host.serverUid).remove();
  delete hosts[host.serverUid]; // remove the host from the array;
  saveHosts();
  deleteHostDialog.close();
  Navigation.pop();
  // });
}

// puts the CSS style for current app on the app that's currently running
// and puts the CSS style for non-current app apps that aren't running
// this requires a hot-off-the-host `api`, and the appId we're going to stylize
// the function was made like this so that we can remove duplicated code, but
// not do N*N stylizations of the box art, or make the code not flow very well
function stylizeBoxArt(freshApi, appIdToStylize) {
  // If the running game is the good one then style it
  var el = document.querySelector("#game-" + appIdToStylize);
  if (freshApi.currentGame === appIdToStylize) {
    el.classList.add('current-game')
    el.title += ' (Running)'
  } else {
    el.classList.remove('current-game')
    el.title.replace(' (Running)', '') // TODO: Replace with localized string so make it e.title = game_title
  }
}

function sortTitles(list, sortOrder) {
  return list.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    // A - Z
    if (sortOrder === 'ASC') {
      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }
      return 0;
    }

    // Z - A
    if (sortOrder === 'DESC') {
      if (titleA < titleB) {
        return 1;
      }
      if (titleA > titleB) {
        return -1;
      }
      return 0;
    }
  });
}

// show the app list
function showApps(host) {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  if (!host || !host.paired) { // safety checking. shouldn't happen.
    console.log('%c[index.js, showApps]', 'color: green;', 'Moved into showApps, but `host` did not initialize properly! Failing.');
    return;
  }
  console.log('%c[index.js, showApps]', 'color: green;', 'Current host object:', host, host.toString()); //Logging both object (for console) and toString-ed object (for text logs)
  $('#quitCurrentApp').show();
  $("#gameList .game-container").remove();

  // Show a spinner while the applist loads
  $('#naclSpinnerMessage').text('Loading apps...');
  $('#naclSpinner').css('display', 'inline-block');

  $("div.game-container").remove();

  host.getAppList().then(function (appList) {
    $("#host-grid").hide();
    $('#main-navigation').hide();
    // $('#naclSpinner').show();
    // $('#loadingSpinner').show();
    $('#naclSpinner').hide();
    $("#game-grid").hide();
    // $("#game-grid").show();

    if (appList.length == 0) {
      console.error('%c[index.js, showApps]', 'User\'s applist is empty')
      var img = new Image()
      img.src = 'static/res/applist_empty.svg'
      $('#game-grid').html(img)
      snackbarLog('Your game list is empty')
      return; // We stop the function right here
    }
    // if game grid is populated, empty it
    const sortedAppList = sortTitles(appList, 'ASC');

    sortedAppList.forEach(function (app) {
      if ($('#game-' + app.id).length === 0) {
        // double clicking the button will cause multiple box arts to appear.
        // to mitigate this we ensure we don't add a duplicate.
        // This isn't perfect: there's lots of RTTs before the logic prevents anything
        var gameCard = document.createElement('div')
        gameCard.id = 'game-' + app.id
        gameCard.className = 'game-container mdl-card mdl-shadow--4dp'
        gameCard.setAttribute('role', 'link')
        gameCard.tabIndex = 0
        gameCard.title = app.title

        gameCard.innerHTML = `<div class="game-title">${app.title}</div>`

        // gameCard.addEventListener('click', e => {
        startGame(host, app.id)
        // })
        gameCard.addEventListener('mouseover', e => {
          gameCard.focus();
        });
        gameCard.addEventListener('keydown', e => {
          if (e.key == "Enter") {
            startGame(host, app.id);
          }
          if (e.key == "ArrowLeft") {
            let prev = gameCard.previousSibling
            if (prev !== null)
              gameCard.previousSibling.focus()
            // TODO: Add a sound when limit reached
          }
          if (e.key == "ArrowRight") {
            let next = gameCard.nextSibling
            if (next !== null)
              gameCard.nextSibling.focus()
            // TODO: Add a sound when limit reached
          }
        })
        document.querySelector('#game-grid').appendChild(gameCard);
        // apply CSS stylization to indicate whether the app is active
        stylizeBoxArt(host, app.id);
      }
      var img = new Image();
      host.getBoxArt(app.id).then(function (resolvedPromise) {
        img.src = resolvedPromise;
      }, function (failedPromise) {
        console.log('%c[index.js, showApps]', 'color: green;', 'Error! Failed to retrieve box art for app ID: ' + app.id + '. Returned value was: ' + failedPromise, '\n Host object:', host, host.toString());
        img.src = 'static/res/placeholder_error.svg'
      });
      img.onload = e => img.classList.add('fade-in');
      $(gameCard).append(img);
    });
  }, function (failedAppList) {
    $('#naclSpinner').hide();
    var img = new Image();
    img.src = 'static/res/applist_error.svg'
    $("#game-grid").html(img)
    snackbarLog('Unable to retrieve your games')
    console.error('%c[index.js, showApps]', 'Failed to get applist from host: ' + host.hostname, '\n Host object:', host, host.toString());
  });

  showAppsMode();
}

// set the layout to the initial mode you see when you open moonlight
function showHostsAndSettingsMode() {
  console.log('%c[index.js]', 'color: green;', 'Entering "Show apps and hosts" mode');
  $("#main-navigation").hide();
  // $("#main-navigation").show();
  $(".nav-menu-parent").show();
  $("#externalAudioBtn").show();
  $("#main-content").children().not("#listener, #loadingSpinner, #naclSpinner").show();
  $('#game-grid').hide();
  $('#backIcon').hide();
  $('#quitCurrentApp').hide();
  $("#main-content").removeClass("fullscreen");
  $("#listener").removeClass("fullscreen");
  Navigation.start();
  Navigation.pop();

  startPollingHosts();
}

function showAppsMode() {
  console.log('%c[index.js]', 'color: green;', 'Entering "Show apps" mode');
  $('#backIcon').show();
  $("#main-navigation").hide();
  // $("#main-navigation").show();
  $("#main-content").children().not("#listener, #loadingSpinner, #naclSpinner").show();
  $("#streamSettings").hide();
  $(".nav-menu-parent").hide();
  $("#externalAudioBtn").hide();
  $("#host-grid").hide();
  $("#settings").hide();
  $("#main-content").removeClass("fullscreen");
  $("#listener").removeClass("fullscreen");
  $('#loadingSpinner').css('display', 'none');
  $('body').css('backgroundColor', '#282C38');
  $('#nacl_module').css('display', 'none');

  // Restore back to a window
  if (runningOnChrome() && windowState == 'normal') {
    chrome.app.window.current().restore();
  }

  isInGame = false;

  // FIXME: We want to eventually poll on the app screen but we can't now
  // because it slows down box art loading and we don't update the UI live
  // anyway.
  stopPollingHosts();
  Navigation.start();
}


// start the given appID.  if another app is running, offer to quit it.
// if the given app is already running, just resume it.
function startGame(host, appID) {
  if (!host || !host.paired) {
    console.error('%c[index.js, startGame]', 'color: green;', 'Attempted to start a game, but `host` did not initialize properly. Host object: ', host);
    return;
  }

  // refresh the server info, because the user might have quit the game.
  host.refreshServerInfo().then(function (ret) {
    host.getAppById(appID).then(function (appToStart) {

      if (host.currentGame != 0 && host.currentGame != appID) {
        host.getAppById(host.currentGame).then(function (currentApp) {
          var quitAppDialog = document.querySelector('#quitAppDialog');
          document.getElementById('quitAppDialogText').innerHTML =
            currentApp.title + ' is already running. Would you like to quit ' +
            currentApp.title + '?';
          quitAppDialog.showModal();
          Navigation.push(Views.CloseAppDialog);
          $('#cancelQuitApp').off('click');
          $('#cancelQuitApp').on('click', function () {
            quitAppDialog.close();
            Navigation.pop();
            console.log('[index.js, startGame]', 'color: green;', 'Closing app dialog, and returning');
          });
          $('#continueQuitApp').off('click');
          $('#continueQuitApp').on('click', function () {
            console.log('[index.js, startGame]', 'color: green;', 'Stopping game, and closing app dialog, and returning');
            stopGame(host, function () {
              // please oh please don't infinite loop with recursion
              startGame(host, appID);
            });
            quitAppDialog.close();
            Navigation.pop();
          });

          return;
        }, function (failedCurrentApp) {
          console.error('[index.js, startGame]', 'color: green;', 'Failed to get the current running app from host! Returned error was:' + failedCurrentApp, '\n Host object:', host, host.toString());
          return;
        });
        return;
      }

      var frameRate = $('#selectFramerate').data('value').toString();
      var optimize = $("#optimizeGamesSwitch").parent().hasClass('is-checked') ? 1 : 0;
      var streamWidth = $('#selectResolution').data('value').split(':')[0];
      var streamHeight = $('#selectResolution').data('value').split(':')[1];
      // we told the user it was in Mbps. We're dirty liars and use Kbps behind their back.
      var bitrate = parseInt($("#bitrateSlider").val()) * 1000;
      const framePacingEnabled = $('#framePacingSwitch').parent().hasClass('is-checked') ? 1 : 0;
      const audioSyncEnabled = $('#audioSyncSwitch').parent().hasClass('is-checked') ? 1 : 0;
      console.log('%c[index.js, startGame]', 'color:green;',
        'startRequest:' + host.address +
        ":" + streamWidth +
        ":" + streamHeight +
        ":" + frameRate +
        ":" + bitrate +
        ":" + optimize +
        ":" + framePacingEnabled,
        ":" + audioSyncEnabled);

      var rikey = generateRemoteInputKey();
      var rikeyid = generateRemoteInputKeyId();
      var gamepadMask = getConnectedGamepadMask();

      $('#loadingMessage').text('Starting ' + appToStart.title + '...');
      playGameMode();
      // startGame();

      if (host.currentGame == appID) { // if user wants to launch the already-running app, then we resume it.
        return host.resumeApp(
          rikey, rikeyid, 0x030002 // Surround channel mask << 16 | Surround channel count
        ).then(function (launchResult) {
          $xml = $($.parseXML(launchResult.toString()));
          $root = $xml.find('root');

          if ($root.attr('status_code') != 200) {
            snackbarLog('Error ' + $root.attr('status_code') + ': ' + $root.attr('status_message'));
            showApps(host);
            return;
          }

          sendMessage('startRequest', [
            host.address,
            streamWidth,
            streamHeight,
            frameRate,
            bitrate.toString(),
            rikey,
            rikeyid.toString(),
            host.appVersion,
            /*host.gfeVersion*/"",
            framePacingEnabled,
            audioSyncEnabled
          ]);
        }, function (failedResumeApp) {
          console.error('%c[index.js, startGame]', 'color:green;', 'Failed to resume the app! Returned error was' + failedResumeApp);
          showApps(host);
          return;
        });
      }

      var remote_audio_enabled = $("#remoteAudioEnabledSwitch").parent().hasClass('is-checked') ? 1 : 0;

      host.launchApp(appID,
        streamWidth + "x" + streamHeight + "x" + frameRate,
        optimize, // DON'T Allow GFE (0) to optimize game settings, or ALLOW (1) to optimize game settings
        rikey, rikeyid,
        remote_audio_enabled, // Play audio locally too?
        0x030002, // Surround channel mask << 16 | Surround channel count
        gamepadMask
      ).then(function (launchResult) {
        $xml = $($.parseXML(launchResult.toString()));
        $root = $xml.find('root');

        if ($root.attr('status_code') != 200) {
          snackbarLog('Error ' + $root.attr('status_code') + ': ' + $root.attr('status_message'));
          showApps(host);
          return;
        }

        sendMessage('startRequest', [
          host.address,
          streamWidth,
          streamHeight,
          frameRate,
          bitrate.toString(),
          rikey,
          rikeyid.toString(),
          host.appVersion,
          "",
          framePacingEnabled,
          audioSyncEnabled
        ]);
      }, function (failedLaunchApp) {
        console.error('%c[index.js, launchApp]', 'color: green;', 'Failed to launch app width id: ' + appID + '\nReturned error was: ' + failedLaunchApp);
        showApps(host);
        return;
      });

    });
  });
}

function playGameMode() {
  console.log('%c[index.js, playGameMode]', 'color:green;', 'Entering play game mode');
  isInGame = true;

  $("#main-navigation").hide();
  $("#main-content").children().not("#listener, #loadingSpinner").hide();
  $("#main-content").addClass("fullscreen");
  $("#listener").addClass("fullscreen");
  startvmtime();

  if (runningOnChrome()) {
    chrome.app.window.current().fullscreen();
  }
  fullscreenNaclModule();
  $('#loadingSpinner').css('display', 'inline-block');
  Navigation.stop();
}

// Maximize the size of the nacl module by scaling and resizing appropriately
function fullscreenNaclModule() {
  var streamWidth = $('#selectResolution').data('value').split(':')[0];
  var streamHeight = $('#selectResolution').data('value').split(':')[1];
  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;

  var xRatio = screenWidth / streamWidth;
  var yRatio = screenHeight / streamHeight;

  var zoom = Math.min(xRatio, yRatio);

  var module = $("#nacl_module")[0];
  module.width = zoom * streamWidth;
  module.height = zoom * streamHeight;
  module.style.paddingTop = ((screenHeight - module.height) / 2) + "px";
  module.focus();
  module.dispatchEvent(new Event('mousedown'));
}

function stopGameWithConfirmation() {
  if (api.currentGame === 0) {
    snackbarLog('Nothing was running');
  } else {
    api.getAppById(api.currentGame).then(function (currentGame) {
      var quitAppDialog = document.querySelector('#quitAppDialog');
      document.getElementById('quitAppDialogText').innerHTML =
        ' Are you sure you would like to quit ' +
        currentGame.title + '?  Unsaved progress will be lost.';
      quitAppDialog.showModal();
      Navigation.push(Views.CloseAppDialog);
      $('#cancelQuitApp').off('click');
      $('#cancelQuitApp').on('click', function () {
        console.log('%c[index.js, stopGameWithConfirmation]', 'color:green;', 'Closing app dialog, and returning');
        quitAppDialog.close();
        Navigation.pop();
      });
      $('#continueQuitApp').off('click');
      $('#continueQuitApp').on('click', function () {
        console.log('%c[index.js, stopGameWithConfirmation]', 'color:green;', 'Stopping game, and closing app dialog, and returning');
        stopGame(api);
        quitAppDialog.close();
        Navigation.pop();
      });

    });
  }
}

function stopGame(host, callbackFunction) {
  isInGame = false;

  if (!host.paired) {
    return;
  }

  host.refreshServerInfo().then(function (ret) {
    host.getAppById(host.currentGame).then(function (runningApp) {
      if (!runningApp) {
        snackbarLog('Nothing was running');
        return;
      }
      var appName = runningApp.title;
      snackbarLog('Stopping ' + appName);
      host.quitApp().then(function (ret2) {
        host.refreshServerInfo().then(function (ret3) { // refresh to show no app is currently running.
          showApps(host);
          if (typeof (callbackFunction) === "function") callbackFunction();
        }, function (failedRefreshInfo2) {
          console.error('%c[index.js, stopGame]', 'color:green;', 'Failed to refresh server info! Returned error was:' + failedRefreshInfo + ' and failed server was:', host, host.toString());
        });
      }, function (failedQuitApp) {
        console.error('%c[index.js, stopGame]', 'color:green;', 'Failed to quit app! Returned error was:' + failedQuitApp);
      });
    }, function (failedGetApp) {
      console.error('%c[index.js, stopGame]', 'color:green;', 'Failed to get app ID! Returned error was:' + failedRefreshInfo);
    });
  }, function (failedRefreshInfo) {
    console.error('%c[index.js, stopGame]', 'color:green;', 'Failed to refresh server info! Returned error was:' + failedRefreshInfo);
  });
}

let indexedDB = null;
const dbVersion = 1.0;
let db = null;
const dbName = 'GameStreamingDB';
const storeName = 'GameStreamingStore';

// Based on example from
// https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
function createObjectStore(dataBase) {
  if (!dataBase.objectStoreNames.contains(storeName)) {
    dataBase.createObjectStore(storeName);
  }
}

function openIndexDB(callback) {
  if (db) {
    // indexedDB.open(dbName, dbVersion);
    setTimeout(function () {

      // console.log("43434343434........");
      window.indexedDB.deleteDatabase(dbName)
      callback();

    }, 1000);
    return;
    // Database already opened
  }

  console.log('Opening IndexDB');
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(persistent => {
      if (persistent)
        console.log("Storage will not be cleared except by explicit user action");
      else
        console.log("Storage may be cleared by the UA under storage pressure.");
    });
  } else {
    console.log('Persistent storage not avaialable');
  }

  if (!indexedDB) {
    indexedDB = self.indexedDB || self.webkitIndexedDB ||
      self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB;
  }

  // Create/open database
  const request = indexedDB.open(dbName, dbVersion);

  request.onerror = function (event) {
    console.log('Error creating/accessing IndexedDB database');
  };

  request.onsuccess = function (event) {
    console.log('Success creating/accessing IndexedDB database');
    db = request.result;

    db.onerror = function (event) {
      console.log('Error creating/accessing IndexedDB database');
    };

    // Interim solution for Google Chrome to create an objectStore.
    // Will be deprecated
    if (db.setVersion && db.version != dbVersion) {
      const setVersion = db.setVersion(dbVersion);
      setVersion.onsuccess = function () {
        createObjectStore(db);
        callback();
      };
    } else {
      callback();
    }
  };

  // For future use. Currently only in latest Firefox versions
  request.onupgradeneeded = function (event) {
    createObjectStore(event.target.result);
  };
}

function callCb(key, value, callbackFunction) {
  let obj = {};
  obj[key] = value;
  callbackFunction(obj);
}

function getData(key, callbackFunction) {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  if (runningOnChrome()) {
    chrome.storage.sync.get(key, callbackFunction);
    return;
  }

  // Non Chrome path
  let cb = function () {
    try {
      // Open a transaction to the database
      const transaction = db.transaction(storeName, 'readonly');

      const readRequest = transaction.objectStore(storeName).get(key);

      // Retrieve the data that was stored
      readRequest.onsuccess = function (event) {
        console.log('Read data from the DB key: ' +
          key + ' value: ' + readRequest.result);
        let value = null;
        if (readRequest.result) {
          value = JSON.parse(readRequest.result);
          console.log('Parsed value');
          console.log(value);
        }

        callCb(key, value, callbackFunction);
      };

      transaction.onerror = function (e) {
        console.error('Erorr reading data at key: "' + key +
          '" from IndexDB: ' + e);
        callCb(key, value, callbackFunction);
      };
    } catch (e) {
      console.log('getData: caught exception while reading key:' + key);
      console.error(e);

      callCb(key, value, callbackFunction);
    }
  };

  if (db) {
    cb();
  } else {
    openIndexDB(cb);
  }
}

function storeData(key, data, callbackFunction) {
  if (runningOnChrome()) {
    var obj = {};
    obj[key] = data;
    chrome.storage.sync.set(obj, callbackFunction);
    return;
  }

  // Non Chrome path
  let cb = function () {
    try {
      // Open a transaction to the database
      const transaction = db.transaction(storeName, 'readwrite');

      // Put the text into the dabase
      const put = transaction.objectStore(storeName).put(
        JSON.stringify(data), key);

      transaction.oncomplete = function (e) {
        console.log('Data at key: ' + key + ' stored as: ' + JSON.stringify(data));
        if (callbackFunction) {
          callbackFunction();
        }
      };

      transaction.onerror = function (e) {
        console.error('Erorr storing data in IndexDB: ' + e);
      };
    } catch (e) {
      console.log('storeData: caught exception while storing key:' + key);
      console.error(e);
    }
  };

  if (db) {
    cb();
  } else {
    openIndexDB(cb);
  }
}

function saveResolution() {
  var chosenResolution = $(this).data('value');
  $('#selectResolution').text($(this).text()).data('value', chosenResolution);
  storeData('resolution', chosenResolution, null);
  updateDefaultBitrate();
  Navigation.pop();
}

function saveOptimize() {
  // MaterialDesignLight uses the mouseup trigger, so we give it some time to change the class name before
  // checking the new state
  setTimeout(function () {
    var chosenOptimize = $("#optimizeGamesSwitch").parent().hasClass('is-checked');
    console.log('%c[index.js, saveOptimize]', 'color: green;', 'Saving optimize state : ' + chosenOptimize);
    storeData('optimize', chosenOptimize, null);
  }, 100);
}

function saveFramePacing() {
  setTimeout(function () {
    const chosenFramePacing = $("#framePacingSwitch").parent().hasClass('is-checked');
    console.log('%c[index.js, saveFramePacing]', 'color: green;', 'Saving framePacing state : ' + chosenFramePacing);
    storeData('framePacing', chosenFramePacing, null);
  }, 100);
}

function saveAudioSync() {
  setTimeout(function () {
    const chosenAudioSync = $("#audioSyncSwitch").parent().hasClass('is-checked');
    console.log('%c[index.js, saveAudioSync]', 'color: green;', 'Saving audio sync state : ' + chosenAudioSync);
    storeData('audioSync', chosenAudioSync, null);
  }, 100);
}

function saveFramerate() {
  var chosenFramerate = $(this).data('value');
  $('#selectFramerate').text($(this).text()).data('value', chosenFramerate);
  storeData('frameRate', chosenFramerate, null);
  updateDefaultBitrate();
  Navigation.pop();
}



// storing data in chrome.storage takes the data as an object, and shoves it into JSON to store
// unfortunately, objects with function instances (classes) are stripped of their function instances when converted to a raw object
// so we cannot forget to revive the object after we load it.
function saveHosts() {
  storeData('hosts', hosts, null);
}

function saveBitrate() {
  storeData('bitrate', $('#bitrateSlider').val(), null);
}

function saveRemoteAudio() {
  // MaterialDesignLight uses the mouseup trigger, so we give it some time to change the class name before
  // checking the new state
  setTimeout(function () {
    var remoteAudioState = $("#remoteAudioEnabledSwitch").parent().hasClass('is-checked');
    console.log('%c[index.js, saveRemoteAudio]', 'color: green;', 'Saving remote audio state : ' + remoteAudioState);
    storeData('remoteAudio', remoteAudioState, null);
  }, 100);
}

function updateDefaultBitrate() {
  var res = $('#selectResolution').data('value');
  var frameRate = $('#selectFramerate').data('value').toString();

  if (res === "1920:1080") {
    if (frameRate === "30") { // 1080p, 30fps
      $('#bitrateSlider')[0].MaterialSlider.change('10');
    } else { // 1080p, 60fps
      $('#bitrateSlider')[0].MaterialSlider.change('20');
    }
  }
  else if (res === "1280:720") {
    if (frameRate === "30") { // 720, 30fps
      $('#bitrateSlider')[0].MaterialSlider.change('5');
    } else { // 720, 60fps
      $('#bitrateSlider')[0].MaterialSlider.change('10');
    }
  } else if (res === "3840:2160") {
    if (frameRate === "30") { // 2160p, 30fps
      $('#bitrateSlider')[0].MaterialSlider.change('40');
    } else { // 2160p, 60fps
      $('#bitrateSlider')[0].MaterialSlider.change('80');
    }
  }
  else { // unrecognized option. In case someone screws with the JS to add custom resolutions
    $('#bitrateSlider')[0].MaterialSlider.change('10');
  }

  updateBitrateField();
  saveBitrate();
}

function initSamsungKeys() {
  console.log('initializing keys');

  var handler = {
    initRemoteController: true,
    buttonsToRegister: [
      // https://developer.samsung.com/tv/develop/guides/user-interaction/keyboardime
      'ColorF0Red',    // F1
      'ColorF1Green',  // F2
      'ColorF2Yellow', // F3
      'ColorF3Blue',   // F4
      // Not working...
      //'SmartHub',      // F5
      'Source',        // F6
      'ChannelList',   // F7
      'VolumeMute',    // F8
      'VolumeDown',    // F9
      'VolumeUp',      // F10
      'ChannelDown',   // F11
      'ChannelUp',     // F12
    ],
    onKeydownListener: remoteControllerHandler
  };

  console.log('Initializing SamsungTV platform');
  platformOnLoad(handler);
}

function loadUserData() {
  console.log('loading stored user data');
  if (runningOnChrome()) {
    loadUserDataCb();
  } else {
    openIndexDB(loadUserDataCb);
  }
}

function loadUserDataCb() {
  console.log('load stored resolution prefs');
  getData('resolution', function (previousValue) {
    if (previousValue.resolution != null) {
      $('.resolutionMenu li').each(function () {
        if ($(this).data('value') === previousValue.resolution) {
          $('#selectResolution').text($(this).text()).data('value', previousValue.resolution);
        }
      });
    }
  });

  console.log('Load stored remote audio prefs');
  getData('remoteAudio', function (previousValue) {
    if (previousValue.remoteAudio == null) {
      document.querySelector('#externalAudioBtn').MaterialIconToggle.uncheck();
    } else if (previousValue.remoteAudio == false) {
      document.querySelector('#externalAudioBtn').MaterialIconToggle.uncheck();
    } else {
      document.querySelector('#externalAudioBtn').MaterialIconToggle.check();
    }
  });

  console.log('load stored framerate prefs');
  getData('frameRate', function (previousValue) {
    if (previousValue.frameRate != null) {
      $('.framerateMenu li').each(function () {
        if ($(this).data('value') === previousValue.frameRate) {
          $('#selectFramerate').text($(this).text()).data('value', previousValue.frameRate);
        }
      });
    }
  });

  console.log('load stored optimization prefs');
  getData('optimize', function (previousValue) {
    if (previousValue.optimize == null) {
      document.querySelector('#optimizeGamesBtn').MaterialIconToggle.check();
    } else if (previousValue.optimize == false) {
      document.querySelector('#optimizeGamesBtn').MaterialIconToggle.uncheck();
    } else {
      document.querySelector('#optimizeGamesBtn').MaterialIconToggle.check();
    }
  });

  console.log('load stored framePacing prefs');
  getData('framePacing', function (previousValue) {
    if (previousValue.framePacing == null) {
      document.querySelector('#framePacingBtn').MaterialIconToggle.check();
    } else if (previousValue.framePacing == false) {
      document.querySelector('#framePacingBtn').MaterialIconToggle.uncheck();
    } else {
      document.querySelector('#framePacingBtn').MaterialIconToggle.check();
    }
  });

  console.log('load stored audioSync prefs');
  getData('audioSync', function (previousValue) {
    if (previousValue.audioSync == null) {
      document.querySelector('#audioSyncBtn').MaterialIconToggle.check();
    } else if (previousValue.audioSync == false) {
      document.querySelector('#audioSyncBtn').MaterialIconToggle.uncheck();
    } else {
      document.querySelector('#audioSyncBtn').MaterialIconToggle.check();
    }
  });

  console.log('load stored bitrate prefs');
  getData('bitrate', function (previousValue) {
    $('#bitrateSlider')[0].MaterialSlider.change(previousValue.bitrate != null ? previousValue.bitrate : '10');
    updateBitrateField();
  });
}

function loadHTTPCerts() {
  if (runningOnChrome()) {
    loadHTTPCertsCb();
  } else {
    openIndexDB(loadHTTPCertsCb);
  }
}

function hostAdd() {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  $("#dialogInputHost").value = localStorage.getItem("vmip");
  var inputHost = $("#dialogInputHost").value = localStorage.getItem("vmip");
  var _nvhttpHost = new NvHTTP(inputHost, myUniqueid, inputHost);

  // if(saveHosts()) {
  //   console.log("saveHosts........");
  //   removeClicked(_nvhttpHost);
  // }

  _nvhttpHost.refreshServerInfoAtAddress(inputHost).then(function (success) {
    console.log("111111111111..........");
    // modal.close();
    // Navigation.pop();

    // Check if we already have record of this host. If so,
    // we'll need the PPK string to ensure our pairing status is accurate.
    if (hosts[_nvhttpHost.serverUid] != null) {
      // Update the addresses
      hosts[_nvhttpHost.serverUid].address = _nvhttpHost.address;
      hosts[_nvhttpHost.serverUid].userEnteredAddress = _nvhttpHost.userEnteredAddress;

      // Use the host in the array directly to ensure the PPK propagates after pairing
      pairTo(hosts[_nvhttpHost.serverUid], function () {
        console.log("222222222222222..............");
        saveHosts();
      });
    }
    else {
      pairTo(_nvhttpHost, function () {
        console.log("333333333333333333................");
        // Host must be in the grid before starting background polling
        addHostToGrid(_nvhttpHost);
        beginBackgroundPollingOfHost(_nvhttpHost);
        saveHosts();
        stopPollingHosts();
        hostChosen(_nvhttpHost);
      });
    }
  }.bind(this),
    function (failure) {
      snackbarLog('Failed to connect to ' + _nvhttpHost.hostname + '! Ensure that GameStream is enabled in GeForce Experience.');
    }.bind(this));
}

function loadHTTPCertsCb() {
  $("#host-grid").hide();
  $('#main-navigation').hide();
  $('#naclSpinner').show();
  $('#loadingSpinner').show();
  console.log('load the HTTP cert and unique ID if we have one.');
  getData('cert', function (savedCert) {
    if (savedCert.cert != null) { // we have a saved cert
      pairingCert = savedCert.cert;
    }

    getData('uniqueid', function (savedUniqueid) {
      // See comment on myUniqueid
      /*if (savedUniqueid.uniqueid != null) { // we have a saved uniqueid
        myUniqueid = savedUniqueid.uniqueid;
      } else {
        myUniqueid = uniqueid();
        storeData('uniqueid', myUniqueid, null);
      }*/

      if (!pairingCert) { // we couldn't load a cert. Make one.
        console.warn('%c[index.js, moduleDidLoad]', 'color: green;', 'Failed to load local cert. Generating new one');
        sendMessage('makeCert', []).then(function (cert) {
          storeData('cert', cert, null);
          pairingCert = cert;
          hostAdd();
          // addHost();
          console.info('%c[index.js, moduleDidLoad]', 'color: green;', 'Generated new cert:', cert);
        }, function (failedCert) {
          console.error('%c[index.js, moduleDidLoad]', 'color: green;', 'Failed to generate new cert! Returned error was: \n', failedCert);
        }).then(function (ret) {
          sendMessage('httpInit', [pairingCert.cert, pairingCert.privateKey, myUniqueid]).then(function (ret) {
            restoreUiAfterNaClLoad();
          }, function (failedInit) {
            console.error('%c[index.js, moduleDidLoad]', 'color: green;', 'Failed httpInit! Returned error was: ', failedInit);
          });
        });
      } else {
        sendMessage('httpInit', [pairingCert.cert, pairingCert.privateKey, myUniqueid]).then(function (ret) {
          restoreUiAfterNaClLoad();
          // removeClicked(_nvhttpHost);
          // addHost();
          // hostAdd();
        },
          function (failedInit) {
            console.error('%c[index.js, moduleDidLoad]', 'color: green;', 'Failed httpInit! Returned error was: ', failedInit);
          });
      }

      // load previously connected hosts, which have been killed into an object, and revive them back into a class
      getData('hosts', function (previousValue) {
        hosts = previousValue.hosts != null ? previousValue.hosts : {};
        for (var hostUID in hosts) { // programmatically add each new host.
          var revivedHost = new NvHTTP(hosts[hostUID].address, myUniqueid, hosts[hostUID].userEnteredAddress);
          revivedHost.serverUid = hosts[hostUID].serverUid;
          revivedHost.externalIP = hosts[hostUID].externalIP;
          revivedHost.hostname = hosts[hostUID].hostname;
          revivedHost.ppkstr = hosts[hostUID].ppkstr;
          addHostToGrid(revivedHost);
        }
        startPollingHosts();
        console.log('%c[index.js]', 'color: green;', 'Loaded previously connected hosts');
      });
    });
  });
}

function onWindowLoad() {
  console.log('%c[index.js]', 'color: green;', 'Moonlight\'s main window loaded');
  // don't show the game selection div
  $('#gameSelection').css('display', 'none');

  initSamsungKeys();
  loadWindowState();
  loadUserData();
}

window.onload = onWindowLoad;

// Required on TizenTV, to get gamepad events.
window.addEventListener('gamepadconnected', function (event) {
  console.log('%c[index.js, gamepadconnected] gamepad connected: ' +
    JSON.stringify(event.gamepad),
    event.gamepad);
});

// Required on TizenTV, to get gamepad events.
window.addEventListener('gamepaddisconnected', function (event) {
  console.log('%c[index.js, gamepaddisconnected] gamepad disconnected: ' +
    JSON.stringify(event.gamepad),
    event.gamepad);
});
