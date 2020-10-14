const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
// eslint-disable-next-line no-undef
const vue = new Vue({
	el: "#app",
	data: {
		assets: [],
		line1: "",
		line2: "",
		hover: "",
		pickedImage: "",
	},
	methods: {
		assetPath: function(key)
		{
			return "discordassets/" + key + ".png";
		},
		fetchAssets: function()
		{
			this.assets = fs.readdirSync(path.join(__dirname, "/discordassets")).filter(i => i.endsWith(".png")).map(i => i.replace(".png", ""));
		}
	},
	created: function()
	{
		this.fetchAssets();
	}
});

function requestRPCChange()
{
	if (vue.line1.length >= 2
        && vue.line2.length > 2
        && vue.hover.length > 2
        && vue.pickedImage
	)
	{
		const data = {
			line1: vue.line1,
			line2: vue.line2,
			hover: vue.hover,
			imageKey: vue.pickedImage
		};
		ipcRenderer.send("presence-update", data);
	}
	else
	{
		ipcRenderer.send("error-message");
	}
}

function closeApp()
{
	ipcRenderer.send("close-app", "close");
}