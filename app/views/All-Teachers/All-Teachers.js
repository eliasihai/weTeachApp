const applicationSettings = require("tns-core-modules/application-settings");
const { fromObject } = require('tns-core-modules/data/observable');
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");
var frameModule = require('tns-core-modules/ui/frame');
const searchBarModule = require("tns-core-modules/ui/search-bar");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;


var myObservableArray = new ObservableArray();
var filteredTeachers = new ObservableArray();
var AfterDeleteTeacher = new ObservableArray();


var obj = fromObject({
    // Student values
    firstname: '',
    lastname: '',
    email: '',
    // Search values
    subject: 'Math',
    //searchButton: false,
    // students values
    myObservableArray: [],
    filteredTeachers: [],
    AfterDeleteTeacher: []
});

exports.SearchButton = function(args) {
    var searchBar = args.object;
    searchBar.bindingContext = obj;
    obj.filteredTeachers = new Array();

    if (searchBar.text.split(' ')[0] != undefined)
        obj.filteredTeachers.push(...obj.myObservableArray.filter((item) => {
            return item.firstname.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1
        }));

    if (searchBar.text.split(' ')[1] != undefined) {
        obj.filteredTeachers = new Array();
        obj.filteredTeachers.push(...obj.myObservableArray.filter((item) => {
            return item.phone.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1 &&
                item.city.toLowerCase().indexOf(searchBar.text.split(' ')[1].toLowerCase()) != -1
        }));
    }
}

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = obj

    httpModule.getJSON("https://final-project-lessons.herokuapp.com/teacher/AllTeachers")
        .then((result) => {
            console.log("all teachers: ", result.data);
            obj.myObservableArray = result.data;
            obj.filteredTeachers = result.data;
            applicationSettings.setString('teachers', JSON.stringify(result.data));
        }, (e) => {
            console.error(Error);
        });
};

exports.onItemTap = function(args) {
    const index = args.index;
    dialogs.action({
        //message: "Are you want to delete this lecture?",
        cancelButtonText: "Cancel",
        actions: ["Delete", "Lessons count", "Students count"]
    }).then(function(result) {
        console.log("Dialog result: " + result);
        if (result == "Delete") {
            console.log("index: ", index)
            console.log("index in calendarObsArray", obj.filteredTeachers[index]._id)
            obj.AfterDeleteTeacher = obj.filteredTeachers

            httpModule.request({
                url: "https://final-project-lessons.herokuapp.com/teacher/delete/" + obj.AfterDeleteTeacher[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({})
            }).then((response) => {
                const result = response.content.toJSON();
                obj.AfterDeleteTeacher = result.data;
                obj.calendarObsArray = obj.AfterDeleteTeacher
            }, (e) => {
                console.log("err post=", e);
            });
        } else if (result == "Lessons count") {
            httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/teacher/" + obj.filteredTeachers[index]._id)
                .then((result) => {
                    alert("Lessons count: " + result.data.length)
                }, (e) => {
                    console.error(Error);
                });
        } else if (result == "Students count") {
            httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/teacher/" + obj.filteredTeachers[index]._id)
                .then((result) => {
                    let studentsArr = [];

                    for (let i = 0; i < result.data.length; i++) {
                        for (let j = 0; j < studentsArr.length; j++) {
                            if (result.data[i]._id != studentsArr[j]) {
                                studentsArr.push(result.data[i]._id);
                            }
                        }
                    }

                    alert(studentsArr.length)
                }, (e) => {
                    console.error(Error);
                });
        }
    });

    var topmost = frameModule.topmost();
    topmost.navigate("views/All-Teachers/All-Teachers");
}

exports.onClear = function(args) {
    const searchBar = args.object;
    console.log("Clear event raised");
    obj.filteredTeachers = obj.myObservableArray;
}