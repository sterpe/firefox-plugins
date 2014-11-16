self.port.on("ready", function (message) {
	self.port.emit("referer", window.document.referrer)
})
