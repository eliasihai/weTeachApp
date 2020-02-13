var frameModule = require('tns-core-modules/ui/frame');
var dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var LocalNotifications = require("nativescript-local-notifications").LocalNotifications;
const platformModule = require("tns-core-modules/platform");

var calendarObsArray = new ObservableArray();
var AfterDeleteLecture = new ObservableArray();

const obj = fromObject({
    user: JSON.parse(applicationSettings.getString('user')),
    studentName: '',
    firstNameTitle: '',
    title: '',
    start: '',
    date: '',
    studentPhone: '',
    calendarObsArray: [],
    AfterDeleteLecture: [],

});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Teacher Page Loaded");
    obj.firstNameTitle = obj.user.firstname

    let teacher = JSON.parse(applicationSettings.getString('user'));
    console.log("teacher id:", teacher._id)
    let teacherID = teacher._id

    httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/teacher/" + teacherID)
        .then((result) => {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            obj.calendarObsArray = result.data.filter((item) => {
                item.date = new Date(item.date);
                return item.date >= yesterday;
            });
            obj.calendarObsArray.forEach(element => {
                element.dateString = `${element.date.getMonth()+1}/${element.date.getDate()}/${element.date.getFullYear()}`;
            });
        }, (e) => {
            console.error(Error);
        });
};

exports.onItemTap = function(args) {
    const index = args.index;
    dialogs.action({
        message: "Are you want to delete this lecture?",
        cancelButtonText: "Cancel",
        actions: ["Delete"]
    }).then(function(result) {
        console.log("Dialog result: " + result);
        if (result == "Delete") {
            console.log("index: ", index)
            console.log("index]._id", obj.calendarObsArray[index]._id)

            obj.AfterDeleteLecture = obj.calendarObsArray
            console.log("locNotID  ", obj.AfterDeleteLecture[index].locNotID);
            LocalNotifications.cancel(obj.AfterDeleteLecture[index].locNotID).then(
                function(foundAndCanceled) {
                    if (foundAndCanceled) {
                        console.log("OK, it's gone!");
                    } else {
                        console.log(`No ID ${obj.AfterDeleteLecture[index].locNotID} was scheduled`);
                    }
                }
            )

            httpModule.request({
                url: "https://final-project-lessons.herokuapp.com/lecture/" + obj.calendarObsArray[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({})
            }).then((response) => {
                const result = response.content.toJSON();
                obj.AfterDeleteLecture = result.data;
                obj.calendarObsArray = obj.AfterDeleteLecture

                var topmost = frameModule.topmost();
                topmost.navigate("views/teacher-page/teacher-page");
            }, (e) => {
                console.log("err post=", e);
            });
        }
    });
}

exports.calTap = function(args) {
    const button = args.object;
    const page = button.page;
    const frame = page.frame;
    applicationSettings.setString('teacher', JSON.stringify(obj.user));
    frame.navigate('views/calendar/calendar')
}

exports.onItemClick = function(args) {
    console.log("onItemClick", onItemClick.args)
}

exports.onLogout = function() {
    applicationSettings.setString('user', 'null')
    alert("loged out");
    var topmost = frameModule.topmost();
    topmost.navigate("views/login/login");
}

exports.onProfile = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/teacher-profile/teacher-profile");
}