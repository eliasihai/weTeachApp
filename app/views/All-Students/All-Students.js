const applicationSettings = require("tns-core-modules/application-settings");
const { fromObject } = require('tns-core-modules/data/observable');
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");
var frameModule = require('tns-core-modules/ui/frame');
const searchBarModule = require("tns-core-modules/ui/search-bar");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;


var myObservableArray = new ObservableArray();
var filteredStudents = new ObservableArray();
var AfterDeleteStudent = new ObservableArray();


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
    filteredStudents: [],
    AfterDeleteStudent: []
});

exports.SearchButton = function(args) {
    var searchBar = args.object;
    searchBar.bindingContext = obj;
    obj.filteredStudents = new Array();

    if (searchBar.text.split(' ')[0] != undefined)
        obj.filteredStudents.push(...obj.myObservableArray.filter((item) => {
            return item.firstname.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1
        }));

    if (searchBar.text.split(' ')[1] != undefined) {
        obj.filteredStudents = new Array();
        obj.filteredStudents.push(...obj.myObservableArray.filter((item) => {
            return item.email.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1 &&
                item.city.toLowerCase().indexOf(searchBar.text.split(' ')[1].toLowerCase()) != -1
        }));
    }
}

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = obj

    httpModule.getJSON("https://final-project-lessons.herokuapp.com/student/getAllStudents")
        .then((result) => {
            console.log("all students: ", result.data);
            obj.myObservableArray = result.data;
            obj.filteredStudents = result.data;
            applicationSettings.setString('students', JSON.stringify(result.data));
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
            console.log("index in calendarObsArray", obj.filteredStudents[index]._id)
            obj.AfterDeleteStudent = obj.filteredStudents

            httpModule.request({
                url: "https://final-project-lessons.herokuapp.com/student/deleteStudentByAdmin/" + obj.AfterDeleteStudent[index]._id,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({})
            }).then((response) => {
                const result = response.content.toJSON();
                obj.AfterDeleteStudent = result.data;
                obj.calendarObsArray = obj.AfterDeleteStudent
            }, (e) => {
                console.log("err post=", e);
            });
        }
    });

    var topmost = frameModule.topmost();
    topmost.navigate("views/All-Students/All-Students");
}

exports.onClear = function(args) {
    const searchBar = args.object;
    console.log("Clear event raised");
    obj.filteredStudents = obj.myObservableArray;
}