var observableModule = require("tns-core-modules/data/observable");
const Observable = require("tns-core-modules/data/observable").Observable;
const isAndroid = require("tns-core-modules/platform").isAndroid;
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
    /*
            console.log("Start Hour selected", eventCtrl.startHour)
            console.log("End Hour selected", eventCtrl.endHour)
            console.log('User is: ', eventCtrl.user.firstname)
            console.log("Date:", eventCtrl.Date)
        

    console.log("starthour:", eventCtrl.startHour)
    console.log("start:", eventCtrl.calanderEvents[4].start)
    console.log("eventCtrl.calanderEvents[4].date:", eventCtrl.calanderEvents[4].date)
    console.log("eventCtrl.Date: ", eventCtrl.Date) */
    /*
        if (eventCtrl.endHour + eventCtrl.startHour > 2) {
            validTime = true
            console.log("more then 2 hours")
        }*/
    let tchrIdStr = eventCtrl.teacher._id.toString();
    console.log("tchrIdStr", tchrIdStr)
    console.log("eventCtrl.teacherID", eventCtrl.calanderEvents.teacherID)
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
            if (eventCtrl.teacher._id == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate && eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) - 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("End hour cant be the same");
                validTime = true;
            }

            // if the lesson is 2 hours
            // checking if we got that start and end time
            /*
            if (eventCtrl.Date == calendarEventDate && eventCtrl.startHour == eventCtrl.calanderEvents[i].start &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("checking if we got that start and end time");
                validTime = true;
            }*/
            // 2 hours checking
            // if the starthour have include in other lesson. (15:00 - 17:00) - and the start time he chose is 16:00
            if (eventCtrl.teacher._id == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate && eventCtrl.startHour == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                eventCtrl.endHour == eventCtrl.calanderEvents[i].end) {
                console.log("Cant choose start time that include in other lesson");
                validTime = true;
            }

            if (eventCtrl.teacher._id == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                parseInt(eventCtrl.startHour) + 1 == parseInt(eventCtrl.calanderEvents[i].start) &&
                parseInt(eventCtrl.endHour) == parseInt(eventCtrl.calanderEvents[i].end) - 1) {
                console.log("Cant choose start time that include in other lesson with end hour");
                validTime = true;
            }

            if (eventCtrl.teacher._id == eventCtrl.calanderEvents[i].teacherID && eventCtrl.Date == calendarEventDate &&
                parseInt(eventCtrl.startHour) == parseInt(eventCtrl.calanderEvents[i].start) + 1 &&
                parseInt(eventCtrl.endHour) == parseInt(eventCtrl.calanderEvents[i].end) + 1) {
                console.log("Cant choose start time that include in other lesson with end hour");
                validTime = true;
            }
            //console.log("(parseInt(eventCtrl.startHour)) + 1", (parseInt(eventCtrl.calanderEvents[i].start)))
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
                studentID: eventCtrl.user._id,
                teacherName: eventCtrl.teacher.firstname + ' ' + eventCtrl.teacher.lastname,
                studentName: eventCtrl.user.firstname + ' ' + eventCtrl.user.lastname,
                teacherPhone: eventCtrl.teacher.phone,
                studentPhone: eventCtrl.user.phone,
                date: eventCtrl.Date,
                start: eventCtrl.startHour,
                end: eventCtrl.endHour,
                title: eventCtrl.teacher.subject,
            })
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result)

            if (result.status === 'ok') {
                alert('Lesson has been added');
                //local notification
                let lesson = new Date(eventCtrl.Date);
                lesson.setHours(eventCtrl.startHour);
                let yesterday = new Date(eventCtrl.Date);
                yesterday.setHours(eventCtrl.startHour - 1);

                LocalNotifications.schedule([{
                    id: eventCtrl.notificationId,
                    title: eventCtrl.teacher.subject,
                    body: `remember! you have a lesson tomorrow at ${eventCtrl.startHour}:00`,
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
    const d = new Date(gotData.date);
    eventCtrl.day = d.getDate();
    eventCtrl.month = d.getMonth() + 1;
    eventCtrl.year = d.getFullYear();
    eventCtrl.Date = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
    // console.log("eventCtrl.Date:", eventCtrl.Date)
    // console.log("date: ", d)

    // console.log("eventCtrl.teacher:", typeof eventCtrl.teacher._id)
    // console.log("eventCtrl.student:", typeof eventCtrl.user._id)


    // console.log("calendar event:", eventCtrl.calanderEvents[0].teacherName)

    // console.log("starthour:", parseInt(eventCtrl.calanderEvents[0].start))
    // console.log("starthour:", (parseInt(eventCtrl.calanderEvents[0].start)) + 1)
    doAddOnMessageReceivedCallback();
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
        eventCtrl.minute = timePicker.minute;
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
        eventCtrl.minute = timePicker.minute;
    })
}

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate('views/Student-Home/Student-Home');
}