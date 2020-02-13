var observableModule = require("tns-core-modules/data/observable");
const applicationSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const frameModule = require('tns-core-modules/ui/frame');
const { fromObject } = require('tns-core-modules/data/observable');
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var LocalNotifications = require("nativescript-local-notifications").LocalNotifications;
const platformModule = require("tns-core-modules/platform");
var dialogs = require("ui/dialogs");


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
        notificationId: (applicationSettings.getNumber('localNotification')) ? applicationSettings.getNumber('localNotification') : 1
    });
    return viewModel;
}

const eventCtrl = new EventViewModel();

exports.onAdd = function() {
    let validTime = false;
    let tchrIdStr = eventCtrl.teacher._id.toString();
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

    console.log("validTime ", validTime)
    console.log("phoneClicked ", phoneClicked)
    if (eventCtrl.phone != null && phoneClicked == true) {
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
                    locNotID: eventCtrl.notificationId
                })
            }).then((response) => {
                const result = response.content.toJSON();
                console.log(result)

                if (result.status === 'ok') {
                    alert('Lesson has been added');

                    let lesson = new Date(eventCtrl.Date);
                    lesson.setHours(eventCtrl.startHour);
                    let yesterday = new Date(eventCtrl.Date);
                    yesterday.setHours(eventCtrl.startHour);
                    yesterday.setDate(yesterday.getDate() - 1);
                    console.log("yesterday ", yesterday)

                    LocalNotifications.schedule([{
                        id: eventCtrl.notificationId,
                        title: eventCtrl.teacher.subject,
                        body: `Remember! You have a lesson with ${eventCtrl.teacher.firstname} tomorrow at ${eventCtrl.startHour}:00`,
                        ticker: 'obj.ticker',
                        at: new Date(new Date().getTime() + (10 * 1000))
                    }]).then(() => {
                        console.log("Notification scheduled");
                    }, (error) => {
                        console.log("ERROR", error);
                    });
                    applicationSettings.setNumber('localNotification', ++eventCtrl.notificationId);
                }
                var topmost = frameModule.topmost();
                topmost.navigate("views/teacher-page/teacher-page");
            }, (err) => {
                console.log("err post=", err);
            })
        } else {
            alert("Cant Add this lesson")
        }
    } else {
        alert("Enter phone number And check if it valid")
    }
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
    eventCtrl.phone = obj.get("phone");

    doAddOnMessageReceivedCallback();
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

    if (eventCtrl.phone != null) {
        httpModule.getJSON("https://final-project-lessons.herokuapp.com/student/getAllStudents")
            .then((result) => {
                //console.log("result.data[i].phone: ", result.data)
                for (let i = 0; i < result.data.length; i++) {
                    console.log("result.data[i].phone: ", result.data[i].phone)
                    if (eventCtrl.phone == result.data[i].phone) {
                        obj.studentPhone = result.data[i].phone
                        obj.student_id = result.data[i]._id;
                        obj.studentName = result.data[i].firstname;
                        obj.studentLastName = result.data[i].lastname;
                        phoneClicked = true;
                        console.log("obj.student_id", obj.student_id)
                    }
                }
                if (phoneClicked == false) {
                    alert("Phone number is not exist")
                } else if (phoneClicked == true) {
                    alert(obj.studentName + ' ' + obj.studentLastName + ' phone number')
                }
            }, (e) => {
                console.error(Error);
            });
    } else {
        alert("Enter phone number")
    }
}

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate('views/teacher-page/teacher-page');
}