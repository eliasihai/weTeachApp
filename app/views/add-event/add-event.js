var observableModule = require("tns-core-modules/data/observable");
const { fromObject } = require('tns-core-modules/data/observable')
const TimePicker = require("tns-core-modules/ui/time-picker");
const applicationSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const frameModule = require('tns-core-modules/ui/frame');

var LocalNotifications = require("nativescript-local-notifications").LocalNotifications;
const platformModule = require("tns-core-modules/platform");
var dialogs = require("ui/dialogs");

function EventViewModel() {
    var viewModel = observableModule.fromObject({
        user: JSON.parse(applicationSettings.getString('user')),
        teacher: JSON.parse(applicationSettings.getString('teacher')),
        calanderEvents: JSON.parse(applicationSettings.getString('lecture')),
        day: '',
        month: '',
        year: '',
        startHour: '',
        endHour: '',
        Date: '',
        teacherName: '',
        studentName: '',
        teacherPhone: '',
        studentPhone: '',
        notificationId: (applicationSettings.getNumber('localNotification')) ? applicationSettings.getNumber('localNotification') : 1
    });
    return viewModel;
}

const eventCtrl = new EventViewModel();

exports.onAdd = function() {
    let validTime = false;
    var teacher = JSON.parse(applicationSettings.getString('teacher'));
    let tchrIdStr = eventCtrl.teacher._id.toString();
    console.log("tchrIdStr", tchrIdStr)
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
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate && eventCtrl.startHour == eventCtrl.calanderEvents[i].start) {
                console.log("start hour has been used")
                validTime = true;
            }

            // if the lesson is 1 hour
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate && eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) - 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("End hour cant be the same");
                validTime = true;
            }

            // 2 hours checking
            // if the starthour have include in other lesson. (15:00 - 17:00) - and the start time he chose is 16:00
            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate && eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("Cant choosing start time that include in other lesson");
                validTime = true;
            }

            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("Cant choose start time that include in other lesson");
                validTime = true;
            }

            if (tchrIdStr == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                parseInt(eventCtrl.startHour) == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                parseInt(eventCtrl.endHour) == parseInt(eventCtrl.calanderEvents[i].end) + 1 &&
                parseInt(eventCtrl.endHour) - parseInt(eventCtrl.startHour = 2)) {
                console.log("Cant choosing start time that include in other lesson with end hour");
                validTime = true;
            }
        }
    }

    // console.log(validTime)
    console.log("eventCtrl.teacher.phone ", teacher.phone)
    console.log("eventCtrl.teacher.firstname ", teacher.firstname)

    if (!validTime) {
        httpModule.request({
            url: "https://final-project-lessons.herokuapp.com/lecture/Insert",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                teacherID: tchrIdStr,
                studentID: eventCtrl.user._id,
                teacherName: teacher.firstname + ' ' + teacher.lastname,
                studentName: eventCtrl.user.firstname + ' ' + eventCtrl.user.lastname,
                teacherPhone: teacher.phone,
                studentPhone: eventCtrl.user.phone,
                date: eventCtrl.Date,
                start: eventCtrl.startHour,
                end: eventCtrl.endHour,
                title: teacher.subject,
                locNotID: eventCtrl.notificationId,
                //minute: eventCtrl.startMinute,
            })
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result)

            if (result.status === 'ok') {
                alert('Lesson has been added');
                //local notification
                let lesson = new Date(eventCtrl.Date);
                lesson.setHours(eventCtrl.startHour);
                lesson.setMinutes(eventCtrl.startMinute);
                let yesterday = new Date(eventCtrl.Date);
                yesterday.setHours(eventCtrl.startHour);
                yesterday.setMinutes(eventCtrl.startMinute);
                yesterday.setDate(yesterday.getDate() - 1);
                console.log("yesterday ", yesterday)

                LocalNotifications.schedule([{
                    id: eventCtrl.notificationId,
                    title: teacher.subject,
                    body: `Remember! You have a lesson with ${teacher.firstname} tomorrow at ${eventCtrl.startHour}:${eventCtrl.startMinute}`,
                    ticker: 'obj.ticker',
                    at: yesterday
                }]).then(() => {
                    console.log("Notification scheduled");
                }, (error) => {
                    console.log("ERROR", error);
                });
                applicationSettings.setNumber('localNotification', ++eventCtrl.notificationId);

            }
            var topmost = frameModule.topmost();
            topmost.navigate("views/Student-Home/Student-Home");
        }, (err) => {
            console.log("err post=", err);
        })
    } else {
        alert("Cant Add this lesson");
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

    var teacher = JSON.parse(applicationSettings.getString('teacher'));
    const d = new Date(gotData.date);
    eventCtrl.day = d.getDate();
    eventCtrl.month = d.getMonth() + 1;
    eventCtrl.year = d.getFullYear();
    eventCtrl.Date = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();

    doAddOnMessageReceivedCallback();

    console.log("eventCtrl.teacher.phone ", teacher.phone)
    console.log("eventCtrl.teacher.firstname ", teacher.firstname)
}

exports.onPickerLoadedStart = function(eventData) {
    const timePicker = eventData.object;
    const hourSaved = '';
    const minuteSaved = '';
    console.log("Start :", timePicker);
    timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
    timePicker.hour = 00;
    timePicker.minute = 00;

    timePicker.on("timeChange", (args) => {
        // args is of type PropertyChangeData
        console.log("Start TIME picked: ", timePicker.hour, "Minutes: ", timePicker.minute);
        //console.log("eventCtrl.startHour", typeof timePicker.hour)
        //console.log("Previous TIME: ", args.oldValue);
        eventCtrl.startHour = timePicker.hour;
        eventCtrl.startMinute = timePicker.minute;
    })
}

exports.onPickerLoadedEnd = function(eventData) {
    const timePicker = eventData.object;
    const hourSaved = '';
    const minuteSaved = '';
    console.log("End :", timePicker);
    timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
    timePicker.hour = 00;
    timePicker.minute = 00;

    timePicker.on("timeChange", (args) => {
        // args is of type PropertyChangeData
        console.log("End TIME picked: ", timePicker.hour, timePicker.minute);
        //console.log("Previous TIME: ", args.oldValue);
        eventCtrl.endHour = timePicker.hour;
        // eventCtrl.minute = timePicker.minute;
    })
}

exports.onHomeTap = function(args) {
    applicationSettings.setString('teacher', 'null')
    var topmost = frameModule.topmost();
    topmost.navigate('views/Student-Home/Student-Home');
}