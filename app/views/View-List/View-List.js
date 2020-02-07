const applicationSettings = require("tns-core-modules/application-settings");
const { fromObject } = require('tns-core-modules/data/observable');
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");
var frameModule = require('tns-core-modules/ui/frame');
const searchBarModule = require("tns-core-modules/ui/search-bar");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;


var myObservableArray = new ObservableArray();
var filteredTeachers = new ObservableArray();
var filteredTeachersByName = new ObservableArray();

var obj = fromObject({
    // Student values
    firstname: '',
    lastname: '',
    email: '',
    // Search values
    subject: 'Math',
    //searchButton: false,
    // Teacher values
    myObservableArray: [],
    filteredTeachers: [],
    filteredTeachersByName: [],
});

exports.SearchButton = function(args) {
    var searchBar = args.object;
    searchBar.bindingContext = obj;
    obj.filteredTeachers = new Array();

    if (searchBar.text.split(' ')[0] != undefined)
        obj.filteredTeachers.push(...obj.myObservableArray.filter((item) => {
            return item.subject.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1
        }));

    if (searchBar.text.split(' ')[1] != undefined) {
        obj.filteredTeachers = new Array();
        obj.filteredTeachers.push(...obj.myObservableArray.filter((item) => {
            return item.subject.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1 &&
                item.city.toLowerCase().indexOf(searchBar.text.split(' ')[1].toLowerCase()) != -1
        }));
    }



    /*obj.filteredTeachers = obj.myObservableArray.filter((item) => {
        return item.subject.toLowerCase().indexOf(searchBar.text.split(' ')[0].toLowerCase()) != -1 ||
            item.city.toLowerCase().indexOf(searchBar.text.split(' ')[1].toLowerCase()) != -1
    });*/
}

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = obj
    let u = JSON.parse(applicationSettings.getString('user'));
    obj.firstname = u.firstname;
    obj.lastname = u.lastname;
    obj.email = u.email;

    httpModule.getJSON("https://final-project-lessons.herokuapp.com/teacher/AllTeachers")
        .then((result) => {
            console.log("all teachers: ", result.data);
            obj.myObservableArray = result.data;
            obj.filteredTeachers = result.data;
            obj.filteredTeachersByName = result.data;
            applicationSettings.setString('teachers', JSON.stringify(result.data));
        }, (e) => {
            console.error(Error);
        });
};

exports.onItemTap = function(args) {
    const index = args.index;
    const page1 = args.index;
    page1.bindingContext = obj
    const button = args.object;
    const page = button.page;
    const frame = page.frame;
    console.log(`Second ListView item tap ${page1}`);
    obj.myObservableArray[index]
    console.log(obj.myObservableArray[index]);

    applicationSettings.setString('teacher', JSON.stringify(obj.myObservableArray[index]));
    frame.navigate('views/calendar/calendar');

    // dialogs.action({
    //     // message: "Are you want to delete this lecture?",
    //     cancelButtonText: "Cancel",
    //     actions: ["Calendar", "Teacher Details"]
    // }).then(function(result) {
    //     console.log("Dialog result: " + result);
    //     if (result == "Calendar") {
    //         applicationSettings.setString('teacher', JSON.stringify(obj.myObservableArray[index]));
    //         var topmost = frameModule.topmost();
    //         topmost.navigate("views/calendar/calendar");
    //     } else if (result == "Teacher Details") {
    //        var topmost = frameModule.topmost();
    //         topmost.navigate("views/teacher-calendar/teacher-calendar");
    //     }
    // });
}

exports.onClear = function(args) {
    const searchBar = args.object;
    console.log("Clear event raised");
    obj.filteredTeachers = obj.myObservableArray;
}

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/Student-Home/Student-Home");
}