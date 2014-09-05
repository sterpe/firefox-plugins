Request = require("sdk/request").Request
tabs = require("sdk/tabs")
querystring = require("sdk/querystring")
buttons = require("sdk/ui/button/action")
timers = require("sdk/timers")
api_server = "http://localhost"
ui_server = "http://localhost"
uid = 1
init = false

function postTimeUpDown(up_time, down_time, url) {
	if (up_time && down_time && url) {
		request = Request({
			url: api_server,
			content: querystring.stringify({
				uid: uid,
				utime: up_time,
				dtime: down_time,
				tab: querystring.escape(url)
			}),
			onComplete: function (response) {
				console.log((down_time - up_time)/1000, url)
				console.log(response.status,
					response.statusText)
			}
		})
		request.get()

	}
	var request
}
function onTabDeactivated(tab) {
	console.log("tab deactivated")
	postTimeUpDown(tab.up_time, new Date().valueOf(), tab.curr_url)
}
function onTabClose(tab) {
	console.log("tab closed")
	if (tabs.activeTab === tab) {
		postTimeUpDown(tab.up_time, new Date().valueOf(), tab.curr_url)
	}
}
function onTabReady(tab) {
	console.log("tab ready")
	if (tab.up_time) {
		postTimeUpDown(tab.up_time, new Date().valueOf(), tab.curr_url)
	} else {
	}
	tab.up_time = new Date().valueOf()
	tab.curr_url = tab.url
}
function onTabActivated(tab) {
	console.log("tab activated")
	tab.up_time = new Date().valueOf()
	tab.curr_url = tab.url
}
function onTabOpen(tab) {
	if (!init) {
		init = true
		timers.setTimeout(function() {
			if (tabs.length === 1) {
				tabs.open({
					url: tab.url
				})
				tab.close()
			}
		})
	}
}
button = buttons.ActionButton({
	id: "digifit-link",
	label: "My Digifit Profile",
	icon: {
		"16": "./icon-16.png",
		"32": "./icon-32.png",
		"64": "./icon-64.png"
	},
	onClick: function (state) {
		tabs.open(ui_server + "?uid=" + uid)
	}
})
tabs.on("open", onTabOpen)
tabs.on("activate", onTabActivated)
tabs.on("deactivate", onTabDeactivated)
tabs.on("ready", onTabReady)
tabs.on("close", onTabClose)
onTabOpen(tabs.activeTab)

var tabs
, uid
, querystring
, Request
, api_server
, buttons
, button
, ui_server
