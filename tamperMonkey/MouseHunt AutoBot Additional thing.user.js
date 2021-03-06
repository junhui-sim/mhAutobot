// ==UserScript==
// @name        MouseHunt AutoBot Additional thing
// @author      NobodyRandom
// @namespace   https://greasyfork.org/users/6398
// @version    	1.2.028
// @description	This is an additional file for NobodyRandom's version of MH autobot (https://greasyfork.org/en/scripts/6092-mousehunt-autobot-revamp)
// @license 	GNU GPL v2.0
// @include		http://mousehuntgame.com/*
// @include		https://mousehuntgame.com/*
// @include		http://www.mousehuntgame.com/*
// @include		https://www.mousehuntgame.com/*
// @include		http://apps.facebook.com/mousehunt/*
// @include		https://apps.facebook.com/mousehunt/*
// @include		http://hi5.com/friend/games/MouseHunt*
// @include		http://mousehunt.hi5.hitgrab.com/*
// @grant		unsafeWindow
// @run-at		document-end
// ==/UserScript==

// SETTING BASE VARS *******************************
unsafeWindow.addonScriptVer = '1.2.027';
var NOBhasPuzzle = user.has_puzzle;
var NOBclockLoaded = false;
var NOBpage = false;
var mapRequestFailed = false;
var clockTicking = false;
var clockNeedOn = false;
var counter = 0;
var dots = '';
var LOCATION_TIMERS = [
    ['Seasonal Garden', {
        first: 1283616000,
        length: 288000,
        breakdown: [1, 1, 1, 1],
        name: ['Summer', 'Autumn', 'Winter', 'Spring'],
        color: ['Red', 'Orange', 'Blue', 'Green'],
        effective: ['tactical', 'shadow', 'hydro', 'physical']
    }],
    ['Balack\'s Cove', {
        first: 1294680060,
        length: 1200,
        breakdown: [48, 3, 2, 3],
        name: ['Low', 'Medium (in)', 'High', 'Medium (out)'],
        color: ['Green', 'Orange', 'Red', 'Orange']
    }],
    ['Forbidden Grove', {
        first: 1285704000,
        length: 14400,
        breakdown: [4, 1],
        name: ['Open', 'Closed'],
        color: ['Green', 'Red']
    }],
    ['Relic Hunter', {
        url: 'http://horntracker.com/backend/relichunter.php?functionCall=relichunt'
    }],
    ['Toxic Spill', {
        url: 'http://horntracker.com/backend/new/toxic.php?functionCall=spill'
    }]
];

// SETTING BASE VARS DONE ******************************* INIT AJAX CALLS AND INIT CALLS
// Function calls after page LOAD
$(window).load(nobInit);

function nobInit() {
    try {
        if (!NOBhasPuzzle) {
            if (window.location.href == "http://www.mousehuntgame.com/" ||
                window.location.href == "http://www.mousehuntgame.com/#" ||
                window.location.href == "http://www.mousehuntgame.com/?switch_to=standard" ||
                window.location.href == "https://www.mousehuntgame.com/" ||
                window.location.href == "https://www.mousehuntgame.com/#" ||
                window.location.href == "https://www.mousehuntgame.com/?switch_to=standard" ||
                window.location.href.indexOf("mousehuntgame.com/turn.php") != -1 ||
                window.location.href.indexOf("mousehuntgame.com/index.php") != -1 ||
                window.location.href == "http://www.mousehuntgame.com/canvas/" ||
                window.location.href == "http://www.mousehuntgame.com/canvas/#" ||
                window.location.href == "https://www.mousehuntgame.com/canvas/" ||
                window.location.href == "https://www.mousehuntgame.com/canvas/#" ||
                window.location.href.indexOf("mousehuntgame.com/canvas/index.php") != -1 ||
                window.location.href.indexOf("mousehuntgame.com/canvas/turn.php") != -1 ||
                window.location.href.indexOf("mousehuntgame.com/canvas/?") != -1) {
                NOBpage = true;
            }

            if (NOBpage) {
                nobHTMLFetch();
                createClockArea();
                clockTick();
                fetchGDocStuff();
                setTimeout(function() {
                    pingServer();
                }, 30000);
                // Hide message after 1H :)
                hideNOBMessage(3600000);
            }
        }
    } catch (e) {
        console.log("nobInit() ERROR - " + e);
    }
}

function nobAjaxGet(url, callback, throwError) {
    var NOBhasPuzzle = user.has_puzzle;
    if (!NOBhasPuzzle) {
        jQuery.ajax({
            url: url,
            type: "GET",
            timeout: 5000,
            statusCode: {
                200: function () {
                    console.log("Success get - " + url);
                    //Success Message
                }
            },
            success: callback,
            error: throwError
        });
    }
}

function nobAjaxPost(url, data, callback, throwError) {
    var NOBhasPuzzle = user.has_puzzle;
    if (!NOBhasPuzzle) {
        jQuery.ajax({
            url: url,
            data: data,
            type: "POST",
            timeout: 5000,
            statusCode: {
                200: function () {
                    console.log("Success post - " + url);
                    //Success Message
                }
            },
            success: callback,
            error: throwError
        });
    }
}

function updateTimer(timeleft, inhours) {
    var ReturnValue = "";

    var FirstPart, SecondPart, Size;

    if (timeleft > 0) {
        if (inhours != null && inhours == true && timeleft > 3600) {
            FirstPart = Math.floor(timeleft / (60 * 60));
            SecondPart = Math.floor(timeleft / 60) % 60;
            Size = 'hrs';
        } else {
            FirstPart = Math.floor(timeleft / 60);
            SecondPart = timeleft % 60;
            Size = 'mins';
        }

        if (SecondPart < 10) {
            SecondPart = '0' + SecondPart;
        }

        ReturnValue = FirstPart + ':' + SecondPart + ' ' + Size;
    } else {
        ReturnValue = 'Soon...';
    }

    return ReturnValue;
}

function nobGDoc(items, type) {
    var dataSend = JSON.parse(items);
    dataSend.type = type;
    var dataSendString = JSON.stringify(dataSend);
    var sheet = "https://script.google.com/macros/s/AKfycbyry10E0moilr-4pzWpuY9H0iNlHKzITb1QoqD69ZhyWhzapfA/exec";

    nobAjaxPost(sheet, dataSendString, function(data) {
        //console.log(data);
    }, function(a, b, c) {
        console.log(b)
    });
}

function nobHTMLFetch() {
    var value = document.documentElement.innerHTML;
    if (value != null) {
        if (typeof value == "string") {

            var StartPos = value.indexOf('user = ');
            var EndPos = value.indexOf('};', StartPos);

            if (StartPos != -1) {
                var FullObjectText = value.substring(StartPos + 7, EndPos + 1);
                nobStore(JSON.parse(FullObjectText), "data");
            }
        } else if (typeof value == "object") {
            nobStore(value, "data");
        }
    }
    value = undefined;
}

function nobStore(data, type) {
    data = JSON.stringify(data);
    var name = "NOB-" + type;
    localStorage.setItem(name, data);
}

function nobGet(type) {
    return localStorage.getItem('NOB-' + type);
}

function nobMapRequest(handleData) {
    var url = "https://www.mousehuntgame.com/managers/ajax/users/relichunter.php";
    var dataSend = {
        'action': 'info',
        'uh': user.unique_hash,
        'viewas': null
    };
    jQuery.ajax({
        url: url,
        data: dataSend,
        type: "POST",
        dataType: "json",
        timeout: 5000,
        success: function (data) {
            // console.log(data);
            handleData(data);
        },
        error: function (error) {
            console.log("Map Request Failed");
            handleData(error);
        }
    });
}

function nobLoading(location, name) {
    var element = document.getElementById(location);
    if (counter < 10) {
        for (var i = 0; i < counter; i++) {
            dots = dots + ".";
        }
    } else {
        dots = "";
        counter = 0;
    }
    element.innerHTML = "Loading" + dots;
    counter++;

    timeoutVar1 = setTimeout(function () {
        nobLoading(location);
    }, 1000);
}

function nobStopLoading(name) {
    clearTimeout(timeoutVar1);
}

// VARS DONE ******************************* COMMENCE CODE
function nobScript(qqEvent) {
    if (NOBpage) {
        var NOBdata = nobGet('data');
        var mapThere = document.getElementById('hudmapitem').style.cssText;
        if (mapThere == 'display: none;') {
            mapThere = false;
            console.log("No map, using HTML data now");
        } else {
            mapThere = true;
        }

        if (NOBdata != null || NOBdata != undefined) {
            if (!mapRequestFailed && mapThere) {
                nobMapRequest(function(output) {
                    if (output.status == 200 || output.status == undefined) {
                        nobStore(output, "data");
                        nobGDoc(JSON.stringify(output), "map");
                    } else {
                        console.log(output);
                        mapRequestFailed = true;
                        nobHTMLFetch();
                        output = nobGet('data');
                        nobGDoc(output, "user");
                    }
                });
            } else {
                console.log("Map fetch failed using USER data from html (" + mapRequestFailed + ", " + mapThere + ")");
                nobHTMLFetch();
                var output = nobGet('data');
                nobGDoc(output, "user");
            }
        } else {
            console.log("Data is not found, doing HTML fetch now.");
            nobHTMLFetch();
        }
    }
}

unsafeWindow.showHideTimers = function () {
    $("#loadTimersElement").toggle();
};

function nobTravel(location) {
    if (NOBpage) {
        var url = "https://www.mousehuntgame.com/managers/ajax/users/changeenvironment.php";
        var data = {
            "origin": self.getCurrentUserEnvironmentType(),
            "destination": location,
            'uh': user.unique_hash
        };
        nobAjaxPost(url, data, function (r) {
            console.log(r);
        }, function (a, b, c) {
            console.log(a, b, c);
        });
    }
}

// Update + message fetch
function fetchGDocStuff() {
    if (NOBpage) {
        var currVer = GM_info.script.version;
        //var currVer = "1.4.400a";
        var checkVer;
        //var url = 'https://script.google.com/macros/s/AKfycbyry10E0moilr-4pzWpuY9H0iNlHKzITb1QoqD69ZhyWhzapfA/exec?location=all';

        document.getElementById('NOBmessage').innerHTML = "Loading";
        nobLoading('NOBmessage');
        /*nobAjaxGet(url, function(text) {
            nobStopLoading();
            text = JSON.parse(text);
            // MESSAGE PLACING
            message = text.message;
            var NOBmessage = document.getElementById('NOBmessage');
            NOBmessage.innerHTML = message;

            // UPDATE CHECK
            checkVer = text.version;
            console.log('Current MH AutoBot version: ' + currVer + ' / Server MH AutoBot version: ' + checkVer);
            //console.log('Current MH AutoBot additional thing version: ' + addonScriptVer + ' / Server MH AutoBot additional thing version: ' + text.versionAddon);
            if (checkVer > currVer) {
                var updateElement = document.getElementById('updateElement');
                updateElement.innerHTML = "<a href=\"https://greasyfork.org/en/scripts/6092-mousehunt-autobot-revamp\" target='_blank'><font color='red'>YOUR SCRIPT IS OUT OF DATE, PLEASE CLICK HERE TO UPDATE IMMEDIATELY</font></a>";
            }
        }, function(a, b, c) {
            setTimeout(function() {fetchGDocStuff();}, 300000);
            nobStopLoading();
            console.log(b + ' error - Google Docs is now not working qq');
            if (b == "timeout")
                document.getElementById('NOBmessage').innerHTML = "Google Docs is being slow again ._. retrying in 5 mins.";
        });*/

        Parse.initialize("1YK2gxEAAxFHBHR4DjQ6yQOJocIrtZNYjYwnxFGN", "LFJJnSfmLVSq2ofIyNo25p0XFdmfyWeaj7qG5c1A");
        Parse.Cloud.run('nobMessage', {}, {
            success: function (data) {
                nobStopLoading();
                data = JSON.parse(data);
                // MESSAGE PLACING
                message = data.message;
                var NOBmessage = document.getElementById('NOBmessage');
                NOBmessage.innerHTML = message;

                // UPDATE CHECK
                checkVer = data.version;
                console.log('Current MH AutoBot version: ' + currVer + ' / Server MH AutoBot version: ' + checkVer);
                //console.log('Current MH AutoBot additional thing version: ' + addonScriptVer + ' / Server MH AutoBot additional thing version: ' + text.versionAddon);
                if (checkVer > currVer) {
                    var updateElement = document.getElementById('updateElement');
                    updateElement.innerHTML = "<a href=\"https://greasyfork.org/en/scripts/6092-mousehunt-autobot-revamp\" target='_blank'><font color='red'>YOUR SCRIPT IS OUT OF DATE, PLEASE CLICK HERE TO UPDATE IMMEDIATELY</font></a>";
                }
            }, error: function (error) {
                setTimeout(function() {fetchGDocStuff();}, 300000);
                //nobStopLoading();
                console.log(JSON.parse(error) + ' error - Google Docs is now not working qq... Retrying in 5 minutes');
            }
        });
    }
}

function pingServer() {
    if (NOBpage) {
        var theData = JSON.parse(nobGet('data'));
        if (theData.user) {
            theData = theData.user;
        }
        var theUsername = theData.username;
        var thePassword = theData.sn_user_id;

        Parse.initialize("1YK2gxEAAxFHBHR4DjQ6yQOJocIrtZNYjYwnxFGN", "LFJJnSfmLVSq2ofIyNo25p0XFdmfyWeaj7qG5c1A");
        Parse.User.logIn(theUsername, thePassword).then(function (user) {
            //console.log("Success parse login");
            return Parse.Promise.as("Login success");
        }, function (user, error) {
            console.log("Parse login failed, attempting to create new user now.");

            var createUser = new Parse.User();
            createUser.set("username", theUsername);
            createUser.set("password", thePassword);
            createUser.set("email", thePassword + "@mh.com");
            //createUser.setACL(new Parse.ACL(user));

            var usrACL = new Parse.ACL();
            usrACL.setPublicReadAccess(false);
            usrACL.setPublicWriteAccess(false);
            usrACL.setRoleReadAccess("Administrator", true);
            createUser.setACL(usrACL);

            createUser.signUp(null, {
                success: function (newUser) {
                    console.log(newUser);
                    pingServer();
                    return Parse.Promise.error("There was an error.");
                },
                error: function (newUser, signupError) {
                    // Show the error message somewhere and let the user try again.
                    console.log("Parse Error: " + signupError.code + " " + signupError.message);
                    return Parse.Promise.error("Error in signup");
                }
            });
            return Parse.Promise.error("Failed login, attempted signup, rerunning code");
        }).then(function (success) {
            var UserData = Parse.Object.extend("UserData");

            var findOld = new Parse.Query(UserData);
            findOld.containedIn("user_id", [theData.sn_user_id, JSON.stringify(theData.sn_user_id)]);
            return findOld.find();
        }).then(function(returnObj) {
            var results = returnObj;
            var promises = [];
            for (var i = 0; i < results.length; i++) {
                promises.push(results[i].destroy());
            }
            //console.log("Done parse delete");
            return Parse.Promise.when(promises);
        }).then(function(UserData) {
            var UserData = Parse.Object.extend("UserData");
            var userData = new UserData();

            userData.set("user_id", theData.sn_user_id);
            userData.set("name", theData.username);
            userData.set("script_ver", GM_info.script.version);
            userData.set("data", JSON.stringify(theData));
            var dataACL = new Parse.ACL(Parse.User.current());
            dataACL.setRoleReadAccess("Administrator", true);
            dataACL.setRoleWriteAccess("Administrator", true);
            userData.setACL(dataACL);

            return userData.save();
        }).then(function (results) {
            //console.log("Success Parse");
        }).then(function (message) {
            if (message != undefined || message != null)
                console.log("Parse message: " + message);
            if (Parse.User.current() != null) {
                Parse.User.logOut();
                //console.log("Parse logout");
            }
            //console.log("Parse end code");
        }, function (error) {
            if (error != undefined || error != null)
                console.log("Parse error: " + error);
        });
    }
}

function hideNOBMessage(time) {
    window.setTimeout(function() {
        var element = document.getElementById('NOBmessage');
        element.style.display = 'none';
    }, time);
}

function showNOBMessage() {
    document.getElementById('NOBmessage').style.display = 'block'
}

unsafeWindow.nobRaffle = function() {
    if (!($('.tabs a:eq(1)').length > 0))
        $('#hgbar_messages').click();
    //messenger.UI['notification'].togglePopup();
    window.setTimeout(function () {
        var tabs = $('a.tab');
        var theTab = "";
        for (var i = 0; i < tabs.length; i++)
            if (tabs[i].dataset.tab == 'daily_draw') theTab = tabs[i];
        theTab.click();
    }, 1000);
    window.setTimeout(function () {
        var ballot = $(".notificationMessageList input.sendBallot");
        for (var i = ballot.length - 1; i >= 0; i--) {
            ballot[i].click();
        }
        window.setTimeout(function() {
            $("a.messengerUINotificationClose")[0].click();
        }, 7500);
    }, 4000);
};

// CALCULATE TIMER *******************************
function currentTimeStamp() {
    return parseInt(new Date().getTime().toString().substring(0, 10), 10);
}

function createClockArea() {
    var parent = document.getElementById('loadTimersElement');
    var otherChild = document.getElementById('gDocLink');
    var child = [];
    var text;

    for (i = 0; i < LOCATION_TIMERS.length; i++) {
        child[i] = document.createElement('div');
        child[i].setAttribute("id", "NOB" + LOCATION_TIMERS[i][0]);
        text = '<span id="text_' + LOCATION_TIMERS[i][0] + '">';
        child[i].innerHTML = text;
    }

    for (i = 0; i < LOCATION_TIMERS.length; i++)
        parent.insertBefore(child[i], parent.firstChild);

    parent.insertBefore(document.createElement('br'), parent.firstChild);
}

function clockTick() {
    var temp = document.getElementById('NOBrelic');
    if (clockNeedOn && !clockTicking && temp) {
        // Clock needs to be on, but is not ticking
        updateTime();
    } else if (clockTicking && clockNeedOn && temp) {
        // Clock needs to be on and is already ticking
    } else {
        // Clock does not need to be on
        nobCalculateTime();
    }
    window.setTimeout(function() {
        clockTick();
    }, 15 * 60 * 1000);
}

function updateTime() {
    var timeLeft = JSON.parse(nobGet('relic'));
    if (timeLeft > 0) {
        timeLeft--;
        var element = document.getElementById('NOBrelic');
        element.innerHTML = updateTimer(timeLeft, true);
        nobStore(timeLeft, 'relic');
        nobCalculateOfflineTimers();
        clockTicking = true;

        setTimeout(function() {
            updateTime();
        }, 1000);
    } else {
        clockTicking = false;
        clockNeedOn = false;
    }
}

function nobCalculateTime(runOnly) {
    if (runOnly != 'relic' & runOnly != 'toxic' & runOnly != 'none')
        runOnly = 'all';

    Parse.initialize("1YK2gxEAAxFHBHR4DjQ6yQOJocIrtZNYjYwnxFGN", "LFJJnSfmLVSq2ofIyNo25p0XFdmfyWeaj7qG5c1A");
    //var CurrentTime = currentTimeStamp();
    if ((runOnly == 'relic' || runOnly == 'all') && (typeof LOCATION_TIMERS[3][1].url != 'undefined' || LOCATION_TIMERS[3][1].url != 'undefined')) {
        //var url = "https://script.google.com/macros/s/AKfycbyry10E0moilr-4pzWpuY9H0iNlHKzITb1QoqD69ZhyWhzapfA/exec?location=relic";
        /*nobAjaxGet(url, function(text) {
            text = JSON.parse(text);
            if (text.result == "error") {
                var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                child.innerHTML = "<font color='red'>" + text.error + "</font>";
            } else {
                var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                child.innerHTML = "Relic hunter now in: <font color='green'>" + text.location + "</font> \~ Next move time: <span id='NOBrelic'>" + updateTimer(text.next_move, true);
                if (text.next_move > 0) {
                    clockTicking = true;
                    nobStore(text.next_move, 'relic');
                    updateTime();
                    clockNeedOn = true;
                } else {
                    clockTicking = false;
                    clockNeedOn = false;
                }
            }
        }, function(a, b, c) {
            var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
            child.innerHTML = "<font color='red'>" + b + " error, probably hornTracker, google, or my scripts broke. Please wait awhile, if not just contact me.</font>";
        });*/

        Parse.Cloud.run('nobRelic', {}, {
            success: function (data) {
                data = JSON.parse(data);

                if (data.result == "error") {
                    var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                    child.innerHTML = "<font color='red'>" + data.error + "</font>";
                } else {
                    var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                    child.innerHTML = "Relic hunter now in: <font color='green'>" + data.location + "</font> \~ Next move time: <span id='NOBrelic'>" + updateTimer(data.next_move, true);
                    if (data.next_move > 0) {
                        clockTicking = true;
                        nobStore(data.next_move, 'relic');
                        updateTime();
                        clockNeedOn = true;
                    } else {
                        clockTicking = false;
                        clockNeedOn = false;
                    }
                }
            }, error: function (error) {
                error = JSON.parse(error);

                var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                child.innerHTML = "<font color='red'>" + error + " error, probably hornTracker, google, or my scripts broke. Please wait awhile, if not just contact me.</font>";
            }
        });
    }

    if ((runOnly == 'toxic' || runOnly == 'all') && (typeof LOCATION_TIMERS[4][1].url != 'undefined' || LOCATION_TIMERS[4][1].url != 'undefined')) {
        /*var url = "https://script.google.com/macros/s/AKfycbyry10E0moilr-4pzWpuY9H0iNlHKzITb1QoqD69ZhyWhzapfA/exec?location=toxic";
        nobAjaxGet(url, function(text) {
            text = JSON.parse(text);
            if (text.result == "error") {
                var child = document.getElementById('NOB' + LOCATION_TIMERS[3][0]);
                child.innerHTML = "<font color='red'>" + text.error + "</font>";
            } else {
                var child = document.getElementById('NOB' + LOCATION_TIMERS[4][0]);
                if (text.level == 'Closed') {
                    text.level = {
                        color: 'red',
                        state: text.level
                    };
                } else {
                    text.level = {
                        color: 'green',
                        state: text.level
                    };
                }
                if (text.percent < 0) {
                    text.percent = '';
                } else {
                    text.percent = ' &#126; ' + (100 - text.percent) + '% left';
                }
                child.innerHTML = 'Toxic spill is now - <font color="' + text.level.color + '">' + text.level.state + '</font>' + text.percent;
            }
        }, function(a, b, c) {
            // console.log(b);
            var child = document.getElementById('NOB' + LOCATION_TIMERS[4][0]);
            child.innerHTML = "<font color='red'>" + b + " error, probably hornTracker, google, or my scripts broke. Please wait awhile, if not just contact me.</font>";
        });*/

        Parse.Cloud.run('nobToxic', {}, {
            success: function (data) {
                data = JSON.parse(data);

                if (data.result == "error") {
                    var child = document.getElementById('NOB' + LOCATION_TIMERS[4][0]);
                    child.innerHTML = "<font color='red'>" + data.error + "</font>";
                } else {
                    var child = document.getElementById('NOB' + LOCATION_TIMERS[4][0]);
                    if (data.level == 'Closed') {
                        data.level = {
                            color: 'red',
                            state: data.level
                        };
                    } else {
                        data.level = {
                            color: 'green',
                            state: data.level
                        };
                    }
                    if (data.percent < 0) {
                        data.percent = '';
                    } else {
                        data.percent = ' &#126; ' + (100 - data.percent) + '% left';
                    }
                    child.innerHTML = 'Toxic spill is now - <font color="' + data.level.color + '">' + data.level.state + '</font>' + data.percent;
                }
            }, error: function (error) {
                error = JSON.parse(error);

                var child = document.getElementById('NOB' + LOCATION_TIMERS[4][0]);
                child.innerHTML = "<font color='red'>" + error + " error, probably hornTracker, google, or my scripts broke. Please wait awhile, if not just contact me.</font>";
            }
        });
    }

    if (runOnly == 'all')
        nobCalculateOfflineTimers();
}

function nobCalculateOfflineTimers() {
    var CurrentTime = currentTimeStamp();
    for (i = 0; i < 3; i++) {
        var CurrentName = -1;
        var CurrentBreakdown = 0;
        var TotalBreakdown = 0;
        var iCount2;

        for (iCount2 = 0; iCount2 < LOCATION_TIMERS[i][1].breakdown.length; iCount2++)
            TotalBreakdown += LOCATION_TIMERS[i][1].breakdown[iCount2];

        var CurrentValue = Math.floor((CurrentTime - LOCATION_TIMERS[i][1].first) / LOCATION_TIMERS[i][1].length) % TotalBreakdown;

        for (iCount2 = 0; iCount2 < LOCATION_TIMERS[i][1].breakdown.length && CurrentName == -1; iCount2++) {
            CurrentBreakdown += LOCATION_TIMERS[i][1].breakdown[iCount2];

            if (CurrentValue < CurrentBreakdown) {
                CurrentName = iCount2;
            }
        }

        var SeasonLength = (LOCATION_TIMERS[i][1].length * LOCATION_TIMERS[i][1].breakdown[CurrentName]);
        var CurrentTimer = (CurrentTime - LOCATION_TIMERS[i][1].first);
        var SeasonRemaining = 0;

        while (CurrentTimer > 0) {
            for (iCount2 = 0; iCount2 < LOCATION_TIMERS[i][1].breakdown.length && CurrentTimer > 0; iCount2++) {
                SeasonRemaining = CurrentTimer;
                CurrentTimer -= (LOCATION_TIMERS[i][1].length * LOCATION_TIMERS[i][1].breakdown[iCount2]);
            }
        }

        SeasonRemaining = SeasonLength - SeasonRemaining;

        var seasonalDiv = document.getElementById('NOB' + LOCATION_TIMERS[i][0]);
        var content = "";
        content += LOCATION_TIMERS[i][0] + ': <font color="' + LOCATION_TIMERS[i][1].color[CurrentName] + '">' + LOCATION_TIMERS[i][1].name[CurrentName] + '</font>';
        if (LOCATION_TIMERS[i][1].effective != null) {
            content += ' (' + LOCATION_TIMERS[i][1].effective[CurrentName] + ')';
        }

        content += ' &#126; For ' + updateTimer(SeasonRemaining, true);
        seasonalDiv.innerHTML = content;
    }
}
