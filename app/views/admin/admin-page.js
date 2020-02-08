var frameModule = require('tns-core-modules/ui/frame');
var dialogs = require('tns-core-modules/ui/dialogs');
const httpModule = require("tns-core-modules/http");
const { fromObject } = require('tns-core-modules/data/observable');
const applicationSettings = require("tns-core-modules/application-settings");



const obj = fromObject({});


exports.loaded = function(args) {
    const page = args.object;
    page.bindingContext = obj;
}

exports.allStudents = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/All-Students/All-Students");
}

exports.allTeachers = function(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/All-Teachers/All-Teachers");
}