var frameModule = require("tns-core-modules/ui/frame");
const { fromObject } = require('tns-core-modules/data/observable');
const httpModule = require("tns-core-modules/http");
var validator = require("email-validator");

const obj = fromObject({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    repassword: '',
    phone: ''
});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Register page");
};

exports.teacherTap = function(args) {
    const button = args.object;
    const page = button.page;
    const frame = page.frame;

    frame.navigate('views/teacher register/reg-teacher');
}

exports.register = function() {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let validForm = true;
    if (obj.get('firstname') == '')
        validForm = false;
    if (obj.get('lastname') == '')
        validForm = false;
    if (!(validator.validate(obj.get('email'))))
        validForm = false;
    if (obj.get('password') == '' || (obj.get('password') < 6))
        validForm = false;
    if (obj.get('repassword') != obj.get('password'))
        validForm = false;
    if (obj.get('phone') == '')
        validForm = false;

    if (validForm)
        httpModule.request({
            url: "https://final-project-lessons.herokuapp.com/student/register",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                firstname: obj.get('firstname'),
                lastname: obj.get('lastname'),
                email: obj.get('email'),
                password: obj.get('password'),
                repassword: obj.get('repassword'),
                type: 'student',
                phone: obj.get('phone'),
            })
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result)

            if (result.status === 'ok') {
                alert('Registered')
                var topmost = frameModule.topmost();
                topmost.navigate("views/login/login");
            } else { alert('Try again') }
        }, (err) => {
            console.log("err post=", err);
        })
    else
        alert('Please try again.');
};