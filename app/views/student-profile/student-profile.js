var frameModule = require('tns-core-modules/ui/frame');
var dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");



const obj = fromObject({
    firstname: '',
});


exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
    console.log("Student profige Page Loaded");

    let student = JSON.parse(applicationSettings.getString('user'));
    obj.firstname = student.firstname
    obj.firstname = student.firstname
    obj.firstname = student.firstname
    obj.firstname = student.firstname
    obj.firstname = student.firstname
}