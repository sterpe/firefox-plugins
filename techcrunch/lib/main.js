Request = require("sdk/request").Request
tabs = require("sdk/tabs")
querystring = require("sdk/querystring")

tabs.on("activate", function () {
	up_time = new Date().valueOf()
	tabs.activeTab.on("deactivate", function onDeactivate(tab) {
		tab.removeListener("deactivate", onDeactivate)
		down_time = new Date().valueOf()
		console.log(tab.url, up_time, down_time)
		request = Request({
			url: "http://localhost",
			overrideMimeType: "text/plain; charset=latin1",
			content: querystring.stringify({
				utime: up_time,
				dtime: down_time,
				tab: querystring.escape(tab.url)
			}),
			onComplete: function (response) {
				console.log(response)
				console.log(response.status,
					response.statusText)
			}
		})
		request.get()
		console.log(request.url)

		var down_time
		, request
	})

	var up_time
})

var tabs
, querystring
, Request
