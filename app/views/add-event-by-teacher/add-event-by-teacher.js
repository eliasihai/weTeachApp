var observableModule = require("tns-core-modules/data/observable");
const applicationSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const frameModule = require('tns-core-modules/ui/frame');
const { fromObject } = require('tns-core-modules/data/observable');
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;

var student = [];
let phoneClicked = false;
const obj = fromObject({
    student_id: '',
    studentName: '',
    studentLastName: '',
    studentPhone: '',
});

function EventViewModel() {
    var viewModel = observableModule.fromObject({
        student: '',
        teacher: JSON.parse(applicationSettings.getString('user')),
        calanderEvents: JSON.parse(applicationSettings.getString('lecture')),
        day: '',
        month: '',
        year: '',
        startHour: '',
        endHour: '',
        Date: '',
        teacherName: '',
        teacherPhone: '',
        phone: '',
    });
    return viewModel;
}

const eventCtrl = new EventViewModel();

exports.onAdd = function() {
    // console.log("Start Hour selected", eventCtrl.startHour)
    // console.log("End Hour selected", eventCtrl.endHour)
    // console.log('User is: ', obj.student_id)
    // console.log("Date:", eventCtrl.Date)
    // console.log("teacher.phone:", eventCtrl.teacher.phone)

    let validTime = false;

    let tchrIdStr = eventCtrl.teacher._id.toString();
    // console.log("tchrIdStr", tchrIdStr)
    // console.log("eventCtrl.teacherID", eventCtrl.calanderEvents[1].teacherID)
    if (eventCtrl.calanderEvents.length != 0) {

        if (eventCtrl.startHour == eventCtrl.endHour) {
            validTime = true
            console.log("start == end")
        }

        if ((parseInt(eventCtrl.startHour)) == 0) {
            validTime = true
            console.log("start == 0")
        }

        for (let i = 0; i < eventCtrl.calanderEvents.length; i++) {
            let calendarEventFullDate = new Date(eventCtrl.calanderEvents[i].date)
            console.log("calendarEventFullDate:", calendarEventFullDate)
            let calendarEventDate = calendarEventFullDate.getMonth() + 1 + '/' + calendarEventFullDate.getDate() + '/' + calendarEventFullDate.getFullYear()

            // Start hour cant be the same if we got that start our
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                eventCtrl.startHour == eventCtrl.calanderEvents[i].start) {
                console.log("start hour has been used")
                validTime = true;
            }

            // if the lesson is 1 hour
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) - 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("End hour cant be the same");
                validTime = true;
            }

            // 2 hours checking
            // if the starthour have include in other lesson. (15:00 - 17:00) - and the start time he chose is 16:00
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("Cant choose start time that include in other lesson");
                validTime = true;
            }

            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                parseInt(eventCtrl.startHour) + 1 == parseInt(eventCtrl.calanderEvents[i].start) &&
                parseInt(eventCtrl.endHour) == parseInt(eventCtrl.calanderEvents[i].end) - 1) {
                console.log("Cant choose start time that include in other lesson with end hour");
                validTime = true;
            }
        }
    }

    console.log(validTime)

    if (!validTime) {
        httpModule.request({
            url: "https://final-project-lessons.herokuapp.com/lecture/Insert",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                teacherID: eventCtrl.teacher._id,
                studentID: obj.student_id,
                teacherName: eventCtrl.teacher.firstname + ' ' + eventCtrl.teacher.lastname,
                studentName: obj.studentName + ' ' + obj.studentLastName,
                teacherPhone: eventCtrl.teacher.phone,
                studentPhone: eventCtrl.phone,
                date: eventCtrl.Date,
                start: eventCtrl.startHour,
                end: eventCtrl.endHour,
                title: eventCtrl.teacher.subject,
            })
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result)

            if (result.status === 'ok') {
                alert('Lesson has been added')
                var topmost = frameModule.topmost();
                topmost.navigate("views/teacher-page/teacher-page");
            } else {
                alert("Cant Add this lesson")
            }

        }, (err) => {
            console.log("err post=", err);
        });
    }
}

exports.pageLoaded = function(args) {
    const page = args.object;
    page.bindingContext = eventCtrl;
    var gotData = page.navigationContext;
    const container = page.getViewById("container");
    console.log("Add event by teacher page");
    const d = new Date(gotData.date);
    eventCtrl.day = d.getDate();
    eventCtrl.month = d.getMonth() + 1;
    eventCtrl.year = d.getFullYear();
    eventCtrl.Date = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
    console.log("eventCtrl.Date:", eventCtrl.Date);
    eventCtrl.phone = obj.get("phone")
}

exports.onPickerLoadedStart = function(eventData) {
    const timePicker = eventData.object;
    console.log("Start :", timePicker);
    timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
    timePicker.hour = 00;
    timePicker.minute = 00;

    timePicker.on("timeChange", (args) => {
        // args is of type PropertyChangeData
        console.log("Start TIME picked: ", timePicker.hour, "Minutes: ", timePicker.minute);
        eventCtrl.startHour = timePicker.hour;
        eventCtrl.minute = timePicker.minute;
    })
}

exports.onPickerLoadedEnd = function(eventData) {
    const timePicker = eventData.object;
    console.log("End :", timePicker);
    timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
    timePicker.hour = 00;
    timePicker.minute = 00;

    timePicker.on("timeChange", (args) => {
        // args is of type PropertyChangeData
        console.log("End TIME picked: ", timePicker.hour, timePicker.minute);
        eventCtrl.endHour = timePicker.hour;
        eventCtrl.minute = timePicker.minute;
    })
}

exports.phone = function() {
    httpModule.getJSON("https://final-project-lessons.herokuapp.com/student/studentPhone/" + eventCtrl.phone)
        .then((result) => {
            alert(eventCtrl.phone + " valid")

            obj.student_id = result.data[0]._id;
            console.log("res-->", obj.student_id);

            obj.studentName = result.data[0].firstname;
            console.log("res-->", obj.studentName)

            obj.studentLastName = result.data[0].lastname;
            console.log("res-->", obj.studentLastName);

            // obj.studentPhone = result.data[0].phone;
            // console.log("res-->", obj.studentPhone);
        }, (e) => {
            console.error(Error);
            alert(eventCtrl.phone + " Not valid")
        });

    obj.studentPhone = eventCtrl.phone;
}

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate('views/teacher-page/teacher-page');
}