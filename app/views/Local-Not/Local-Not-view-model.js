var dialogs = require("ui/dialogs");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");

const obj = fromObject({
    id: (applicationSettings.getNumber('localNotification')) ? applicationSettings.getNumber('localNotification') + 1 : 1,
    title: "Test Title",
    body: "Test Body",
    ticker: "Test Ticker"
});

var LocalNotifications = require("nativescript-local-notifications");

function doAddOnMessageReceivedCallback() {
    LocalNotifications.addOnMessageReceivedCallback(
        function(notificationData) {
            dialogs.alert({
                title: "Notification received",
                message: "ID: " + notificationData.id +
                    "\nTitle: " + notificationData.title +
                    "\nBody: " + notificationData.body,
                okButtonText: "Excellent!"
            });
        }
    );
}

function createViewModel() {
    var viewModel = new Observable();

    viewModel.id = 0;
    viewModel.title = "Test Title";
    viewModel.body = "Test Body";
    viewModel.ticker = "Test Ticker";

    doAddOnMessageReceivedCallback();

    viewModel.schedule = function() {
        alert('dfghj');
        // LocalNotifications.schedule([{
        //     id: this.id,
        //     title: this.title,
        //     body: this.body,
        //     ticker: this.ticker,
        //     at: new Date(new Date().getTime() + (10 * 1000))
        // }]).then(() => {
        //     console.log("Notification scheduled");
        // }, (error) => {
        //     console.log("ERROR", error);
        // });
    }

    return viewModel;
}

exports.createViewModel = createViewModel;