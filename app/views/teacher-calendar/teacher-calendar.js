var frameModule = require('tns-core-modules/ui/frame');
var dialogsModule = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");


const obj = fromObject({
    firstname: '',
    lastname: '',
    email: '',
    password: ''
});

exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Teacher Page Loaded");

    let u = JSON.parse(applicationSettings.getString('teacher'));
    obj.firstname = u.firstname;
    obj.lastname = u.lastname;
    obj.email = u.email;
};

exports.calTap = function(args) {
    const button = args.object;
    const page = button.page;
    const frame = page.frame;
    frame.navigate('views/calendar/calendar')
}