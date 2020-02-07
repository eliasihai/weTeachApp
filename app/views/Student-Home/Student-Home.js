const frameModule = require('tns-core-modules/ui/frame');
const dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;

var calendarObsArray = new ObservableArray();
var listAfterRefresh = new Array();
var AfterDeleteLecture = new ObservableArray();
const obj = fromObject({
    firstname: '',
    teacherName: '',
    title: '',
    start: '',
    phone: '',
    calendarObsArray: [],
    //listAfterRefresh: [],
    AfterDeleteLecture: [],

});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Student home Page Loaded");

    let student = JSON.parse(applicationSettings.getString('user'));
    obj.firstname = student.firstname
    let studentID = student._id

    // let today = new Date()
    // console.log(today.toISOString().slice(0, 10))
    // let dayNew = today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear()


    httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/student/" + studentID)
        .then((result) => {
            //console.log(result.data)
            //var array = [];
            //for (var i = 0; i < result.data.length; i++) {
            obj.calendarObsArray = result.data.filter((item) => {
                item.date = new Date(item.date);
                return item.date >= new Date();
            });
            obj.calendarObsArray.forEach(element => {
                element.dateString = `${element.date.getDate()}/${element.date.getMonth()+1}/${element.date.getFullYear()}`;
            });
            //var objectt = result.data[i]
            //     obj.teacherName = calendarObsArray[i].teacherName;
            //     obj.title = calendarObsArray[i].title;
            //     obj.phone = calendarObsArray[i].teacherPhone;
            //     obj.start = calendarObsArray[i].start;
            //array.push(objectt)
            //}
            //console.log("blala:", calendarObsArray)
            //obj.set("array", array)
        }, (e) => {
            console.error(Error);
        });
    //console.log("blala:", listAfterRefresh)
    // for (let i = 0; i < obj.calendarObsArray.lenth; i++) {
    //     //     if (today> obj.calendarObsArray[i].date)
    //     console.log("xxxxx", obj.calendarObsArray)
    // }
};

exports.onItemTap = function(args) {
    const index = args.index;
    dialogs.action({
        // message: "Are you want to delete this lecture?",
        cancelButtonText: "Cancel",
        actions: ["Teacher Details", "Delete Lesson", ]
    }).then(function(result) {
        console.log("Dialog result: " + result);
        if (result == "Delete Lesson") {
            console.log("index: ", index)
            console.log("index in calendarObsArray", obj.calendarObsArray[index]._id)
            obj.AfterDeleteLecture = obj.calendarObsArray
            httpModule.request({
                url: "https://final-project-lessons.herokuapp.com/lecture/" + obj.AfterDeleteLecture[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({

                })
            }).then((response) => {
                const result = response.content.toJSON();
                obj.AfterDeleteLecture = result.data;
                obj.calendarObsArray = obj.AfterDeleteLecture
            }, (e) => {});
        } else if (result == "Teacher Details") {
            var topmost = frameModule.topmost();
            topmost.navigate("views/teacher-calendar/teacher-calendar");
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