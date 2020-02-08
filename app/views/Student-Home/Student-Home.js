const frameModule = require('tns-core-modules/ui/frame');
const dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var LocalNotifications = require("nativescript-local-notifications").LocalNotifications;
const platformModule = require("tns-core-modules/platform");

var calendarObsArray = new ObservableArray();
var AfterDeleteLecture = new ObservableArray();

const obj = fromObject({
    firstname: '',
    teacherName: '',
    title: '',
    start: '',
    phone: '',
    calendarObsArray: [],
    AfterDeleteLecture: [],
});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Student home Page Loaded");

    let student = JSON.parse(applicationSettings.getString('user'));
    obj.firstname = student.firstname
    let studentID = student._id


    httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/student/" + studentID)
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
            console.log("index in calendarObsArray", obj.calendarObsArray[index]._id)
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
                url: "https://final-project-lessons.herokuapp.com/lecture/" + obj.AfterDeleteLecture[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({})
            }).then((response) => {
                const result = response.content.toJSON();
                obj.AfterDeleteLecture = result.data;
                obj.calendarObsArray = obj.AfterDeleteLecture
            }, (e) => {
                console.log("err post=", e);
            });
        }
    });
}

exports.GoToViewList = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/View-List/View-List");
}

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/login/login");
}

exports.onProfile = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/student-profile/student-profile");
}

exports.onLogout = function() {
    applicationSettings.setString('user', 'null')
    alert("loged out");
    var topmost = frameModule.topmost();
    topmost.navigate("views/login/login");
}