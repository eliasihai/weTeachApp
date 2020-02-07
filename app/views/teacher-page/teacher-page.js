var frameModule = require('tns-core-modules/ui/frame');
var dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;

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

    // let DateXML = new Date()
    // console.log(DateXML.toISOString().slice(0, 10))
    // let dayNew = today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear()

    httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/teacher/" + teacherID)
        .then((result) => {
            console.log(result.data)
            let newDate = new Date()
            for (var i = 0; i < result.data.length; i++) {
                obj.calendarObsArray = result.data;
                obj.studentName = calendarObsArray[i].studentName;
                obj.studentPhone = calendarObsArray[i].studentPhone;
                obj.date = calendarObsArray[i].date;
                obj.start = calendarObsArray[i].start;
            }
        }, (e) => {
            console.error(Error);
        });
};

exports.onItemTap = function(args) {
    const index = args.index;
    dialogs.action({
        message: "Are you want to delete this lecture?",
        cancelButtonText: "Cancel",
        actions: ["Yes"]
    }).then(function(result) {
        console.log("Dialog result: " + result);
        if (result == "Yes") {
            console.log("index: ", index)
            console.log("dsadsa", obj.calendarObsArray[index]._id)

            httpModule.request({
                url: "https://final-project-lessons.herokuapp.com/lecture/" + obj.calendarObsArray[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({

                })
            }).then((response) => {
                const result = response.content.toJSON();
                obj.calendarObsArray = result.data;
            }, (e) => {});
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