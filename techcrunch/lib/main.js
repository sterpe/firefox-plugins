Request = require("sdk/request").Request
tabs = require("sdk/tabs")
querystring = require("sdk/querystring")
buttons = require("sdk/ui/button/action")
timers = require("sdk/timers")
self = require("sdk/self")
api_server = "http://localhost"
ui_server = "http://localhost"
uid = 1
init = false

var { viewFor } = require("sdk/view/core")

function postTimeUpDown(data) {
	if (data.up_time && data.down_time && data.url) {
		request = Request({
			url: api_server,
			content: {
				uid: uid,
				utime: data.up_time,
				dtime: data.down_time,
				url: querystring.escape(data.url),
				referer: querystring.escape(data.tab.referer || ""),
				ua: querystring.escape(data.tab.user_agent)
			},
			onComplete: function (response) {
				console.log((data.down_time - data.up_time)/1000, data.url)
				console.log(response.status,
					response.statusText)
			}
		})
		request.get()

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
