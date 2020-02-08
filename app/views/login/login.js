var frameModule = require('tns-core-modules/ui/frame');
var dialogsModule = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");

const obj = fromObject({
    email: '',
    password: '',
    type: false,
    emailValid: '',
    passwordValid: ''
});


exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Log in page");
};



exports.signIn = async function(args) {
    const email = obj.get('email')
    const password = obj.get('password')
    const type = obj.get('type') == true ? 'teacher' : 'student';
    console.log(email, password)
    const button = args.object;
    const page = button.page;
    const frame = page.frame;

    if (email == "admin" && password == "admin") {
        frame.navigate('views/admin/admin-page')
    }

    const res = await httpModule.request({
        url: 'https://final-project-lessons.herokuapp.com/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        content: JSON.stringify({
            email,
            password,
            type
        })
    })
    const result = res.content.toJSON()
    console.log('res: ', result)

    if (result.status === 'ok') {
        applicationSettings.setString('user', JSON.stringify(result.data));

        if (result.data.type == 'student')
            frame.navigate('views/Student-Home/Student-Home')
        else if (result.data.type == 'teacher')
            frame.navigate('views/teacher-page/teacher-page')
    } else
        alert('wrong details');
}

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/register/register");
};


exports.LN = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/Local-Notifications/LN");
};


exports.Home = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/home-page/home-page");
};

function showSideDrawer(args) {
    console.log("Show SideDrawer tapped.");
    // Show sidedrawer ...
}
exports.showSideDrawer = showSideDrawer;