var frameModule = require('tns-core-modules/ui/frame');
var dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");



const obj = fromObject({
    firstname: '',
    password: '',
    repassword: '',
    oldpassword: '',
    student: JSON.parse(applicationSettings.getString('user'))
});


exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Student profige Page Loaded");
    let student = JSON.parse(applicationSettings.getString('user'));
    obj.firstname = student.firstname
    console.log(student.firstname)
    console.log(student._id)
}

exports.passChange = function() {
    const password = obj.get('password');
    const repassword = obj.get('repassword');
    const oldpassword = obj.get('oldpassword');
    console.log("old pass:", oldpassword);
    console.log("pass from DB:", obj.student.password);
    console.log("new pass", password);
    console.log("new pass", repassword);
    console.log(obj.student._id)
    if (oldpassword == obj.student.password && password == repassword) {
        httpModule.request({
            url: 'https://final-project-lessons.herokuapp.com/student/updateStudentPassword/' + obj.student._id,
            method: 'patch',
            headers: {
                'Content-Type': 'application/json'
            },
            content: JSON.stringify({
                password,
            })
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result)

            if (result.status === 'ok') {
                alert('seccsess')
            }
        }, (err) => {
            console.log("err post=", err);
        });
        var topmost = frameModule.topmost();
        topmost.navigate("views/Student-Home/Student-Home");
    } else {
        alert("You have an error")
    }
};

exports.onHomeTap = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate('views/Student-Home/Student-Home');
}