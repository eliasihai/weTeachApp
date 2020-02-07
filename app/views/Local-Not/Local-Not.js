//var createViewModel = require("./Local-Not-view-model").createViewModel;
var LocalNotifications = require("nativescript-local-notifications").LocalNotifications;
const platformModule = require("tns-core-modules/platform");
var dialogs = require("ui/dialogs");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");

const obj = fromObject({
    id: (applicationSettings.getNumber('localNotification')) ? applicationSettings.getNumber('localNotification') : 1,
    title: "",
    body: "",
    ticker: ""
});

export function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = obj;
    if (platformModule.isIOS) {
        LocalNotifications.requestPermission().then((granted) => {
            if (granted) {
                console.log("Permission granted? " + granted);
            }
        });
    }
    doAddOnMessageReceivedCallback();
}

export function schedule() {
    LocalNotifications.schedule([{
        id: obj.id,
        title: obj.title,
        body: obj.body,
        ticker: obj.ticker,
        at: new Date(new Date().getTime() + (10 * 1000))
    }]).then(() => {
        console.log("Notification scheduled");
    }, (error) => {
        console.log("ERROR", error);
    });
    applicationSettings.setNumber('localNotification', ++obj.id);
    console.log(applicationSettings.getNumber('localNotification'));
}

function doAddOnMessageReceivedCallback() {
    LocalNotifications.addOnMessageReceivedCallback(
        function(notificationData) {
            dialogs.alert({
                title: "Notification received",
                message: /*"ID: " + notificationData.id +*/ "\nTitle: " + notificationData.title +
                    "\nBody: " + notificationData.body,
                okButtonText: "Excellent!"
            });
        }
    );
}


export function del() {
    LocalNotifications.cancelAll();

    LocalNotifications.getScheduledIds().then(
        function(ids) {
            console.log("ID's: " + ids);
        }
    )
}