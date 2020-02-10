var dialogsModule = require("tns-core-modules/ui/dialogs");
var frameModule = require("tns-core-modules/ui/frame");
var ListPicker = require("tns-core-modules/ui/list-picker").ListPicker;
const { fromObject } = require('tns-core-modules/data/observable');
const httpModule = require("tns-core-modules/http");
var validator = require("email-validator");
const listViewModule = require("tns-core-modules/ui/list-view");

const obj = fromObject({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    repassword: '',
    phone: '',
    subject: '',
    city: '',
    address: '',
    subClicked: false,
    // Setting the listview binding source
    myTitles: [
        { title: "Math" },
        { title: "English" },
        { title: "Physics" }
    ]
});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Teacher Register page");
};

exports.onItemTap = function(args) {
    //console.log(args)
    let item = obj.myTitles[args.index]
    console.log(`ListView item tap ${item.title}`);
    obj.subject = item.title
    obj.subClicked = true;
    console.log(obj.subClicked);
}

exports.register = function() {

    console.log("dasdsad", obj.subject);
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
    if (obj.get('subClicked') != true)
        validForm = false
    if (obj.get('phone') == '')
        validForm = false;
    if (obj.get('city') == '')
        validForm = false;
    if (obj.get('address') == '')
        validForm = false;

    if (validForm)
        httpModule.request({
            url: "https://final-project-lessons.herokuapp.com/teacher/register",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                firstname: obj.get('firstname'),
                lastname: obj.get('lastname'),
                password: obj.get('password'),
                email: obj.get('email'),
                subject: obj.get('subject'),
                type: 'teacher',
                phone: obj.get('phone'),
                city: obj.get('city'),
                address: obj.get('address'),
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