const calendarModule = require("nativescript-ui-calendar");
const frameModule = require('tns-core-modules/ui/frame');
const httpModule = require("tns-core-modules/http");
const applicationSettings = require("tns-core-modules/application-settings");
const { fromObject } = require('tns-core-modules/data/observable');
var Observable = require('tns-core-modules/data/observable').Observable;
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;

var calendarEventsFromDB = new ObservableArray();
var page;
var pageData = fromObject({
    // Student values
    firstname: '',
    lastname: '',
    email: '',
    // Teacher values
    teacherFirstName: '',
    teacherLastName: '',
    teacher: JSON.parse(applicationSettings.getString('teacher')),
    student: JSON.parse(applicationSettings.getString('user')),
    datePicker: '',
    minDate: '',
    //calendar events
    calendarEventsFromDB: []
});

exports.pageLoaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;
    //let minDateVar = new Date();
    //console.log("minDate:", minDateVar.getDate())
    //pageData.set("minDate", minDateVar)

    let user = JSON.parse(applicationSettings.getString('user'));
    var teacher = JSON.parse(applicationSettings.getString('teacher'));
    pageData.firstname = user.firstname;
    pageData.lastname = user.lastname;
    pageData.email = user.email;
    pageData.teacherFirstName = teacher.firstname
    pageData.teacherLastName = teacher.lastname
    httpModule.getJSON("https://final-project-lessons.herokuapp.com/lecture/getAll")
        .then((result) => {
            var calendarEvents = [];
            console.log("pageData.teacher._id: ", teacher._id)
            applicationSettings.setString('lecture', JSON.stringify(result.data));
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].teacherID == teacher._id) {
                    var now = new Date(result.data[i].date);
                    var d = now.getDate()
                    console.log("now:", now)
                    var startDate = new Date(now.getFullYear(), now.getMonth(), d, result.data[i].start);
                    var endDate = new Date(now.getFullYear(), now.getMonth(), d, result.data[i].end);
                    var event = new calendarModule.CalendarEvent(result.data[i].studentName, startDate, endDate);
                    calendarEvents.push(event);
                }
            }
            calendarEvents.sort((a, b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0));

            pageData.set("calendarEvents", calendarEvents);
        }, (e) => {
            console.error(Error);
        });
}

exports.dateSelect = function(args) {
    const page = args.object;
    console.log('args date:', args.date);
    console.log('args day:', args.date.getDate());
    const date = args.date;
    console.log('date new date :', date);
    applicationSettings.setString("date", args.date.toString());
    const cal = page.getViewById('calendar');
    //cal.viewMode = calendarModule.CalendarViewMode.Day;

    const year = args.date.getFullYear().toString()
    console.log(year)
    const newDate = args.date.getMonth() + 1 + '/' + args.date.getDate() + '/' + args.date.getFullYear()
    console.log('new date: ', typeof newDate)
}

exports.addLesson = function(args) {
    const page = args.object;
    var student = JSON.parse(applicationSettings.getString('user'));
    if (student.type == 'student') {
        var navigationOptions = {
            moduleName: 'views/add-event/add-event',
            context: {
                date: applicationSettings.getString('date')
            }
        }
    } else if (student.type != 'student') {
        var navigationOptions = {
            moduleName: 'views/add-event-by-teacher/add-event-by-teacher',
            context: {
                date: applicationSettings.getString('date')
            }
        }
    }
    console.log("date in addLesson", navigationOptions.context.date)
    frameModule.topmost().navigate(navigationOptions);
}

exports.onNavigationButtonTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/View-List/View-List");
}

exports.onHomeTap = function(args) {
    let studentNav = JSON.parse(applicationSettings.getString('user'));
    let teacherNav = JSON.parse(applicationSettings.getString('teacher'));
    var topmost = frameModule.topmost();
    if (studentNav.type == 'student') {
        topmost.navigate('views/Student-Home/Student-Home');
    } else if (teacherNav.type == 'teacher')
        topmost.navigate('views/teacher-page/teacher-page');
}


exports.allStudents = function(args) {
    var topmost = frameModule.topmost();

    topmost.navigate('views/All-Students/All-Students');
}