Request = require("sdk/request").Request
XMLHttpRequest = require("sdk/net/xhr").XMLHttpRequest
tabs = require("sdk/tabs")
querystring = require("sdk/querystring")
buttons = require("sdk/ui/button/action")
timers = require("sdk/timers")
self = require("sdk/self")
api_server = "http://digifit.nexla.com:8080/digifit/data/Event"
ui_server = "http://localhost"
uid = 1
init = false

var { viewFor } = require("sdk/view/core")

function postTimeUpDown(data) {
	if (data.up_time && data.down_time && data.url) {
		request = new XMLHttpRequest()
		request.open("POST", api_server, true)
		request.setRequestHeader("Content-Type", "application/json")
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				console.log(request.status)
			}
		}
		request.send(JSON.stringify({
				userId: uid,
				eventStartTime: data.up_time,
				eventEndTime: data.down_time,
				timezoneOffset: new Date().getTimezoneOffset(),
				url: data.url,
				referer: data.tab.referer || "",
				eventType: "browserView",
				ip: "123.456.78.9",
				usageValue: 12,
				deviceId: "ABCD12334",
				userAgent: data.tab.user_agent
		
		}))
		/*
		request = Request({
			url: api_server,
			headers: {
				"Content-Type": "application/json"
			},
			content: {
				userId: uid,
				eventStartTime: data.up_time,
				eventEndTime: data.down_time,
				url: data.url,
				referer: data.tab.referer || "",
				eventType: "browserView",
				ip: "123.456.78.9",
				usageValue: 12,
				deviceId: "ABCD12334",
				userAgent: data.tab.user_agent
			},
			onComplete: function (response) {
				console.log((data.down_time - data.up_time)/1000, data.url)
				console.log(response.status,
					response.statusText)
			}
		})
		request.post()
		*/
		console.log({
				userId: uid,
				eventStartTime: data.up_time,
				eventEndTime: data.down_time,
				url: data.url,
				referer: data.tab.referer || "",
				eventType: "browserView",
				ip: "123.456.78.9",
				usageValue: 12,
				deviceId: "ABCD12334",
				userAgent: data.tab.user_agent
		})

	}
	var request
	, window
}
function onTabDeactivated(tab) {
	console.log("tab deactivated")
	postTimeUpDown({
		up_time: tab.up_time,
		down_time: new Date().valueOf(),
		url: tab.curr_url,
		tab: {
			referer: tab.referer,
			user_agent: tab.user_agent
		}
	})
}
function onTabClose(tab) {
	console.log("tab closed")
	if (tabs.activeTab === tab) {
		postTimeUpDown({
			up_time: tab.up_time,
			down_time: new Date().valueOf(),
			url: tab.curr_url,
			tab: {
				referer: tab.referer,
				user_agent: tab.user_agent
			}
		})
	}
}
function onTabReady(tab) {
	console.log("tab ready")
	if (tab.up_time) {
		postTimeUpDown({
			up_time: tab.up_time,
			down_time: new Date().valueOf(),
			url: tab.curr_url,
			tab: {
				referer: tab.referer,
				user_agent: tab.user_agent
			}
		})
	}
	worker = tab.attach({
		contentScriptFile: self.data.url("content-script.js")
	})
	worker.port.on('referer', function (referer) {
		console.log("REFERRER: ", referer)
		tab.referer = referer
	})
	worker.port.emit('ready', "empty message")
	tab.up_time = new Date().valueOf()
	tab.curr_url = tab.url
	window = viewFor(tab.window)
	tab.user_agent = window.navigator.userAgent

	var window
	, worker
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
, init
, self
