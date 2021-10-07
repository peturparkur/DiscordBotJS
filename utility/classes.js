"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Room = exports.EventHandler = void 0;
var EventHandler = /** @class */ (function () {
    function EventHandler() {
        this.listeners = new Map();
    }
    EventHandler.prototype.addEventListener = function (type, callback) {
        var _a;
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []); //No event with this name => Add new array of functions
        }
        (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.push(callback);
    };
    EventHandler.prototype.removeEventListener = function (type, callback) {
        if (!this.listeners.has(type)) //No event with this name
            return;
        var funcs = this.listeners.get(type);
        var i = funcs.indexOf(callback);
        funcs.splice(i, 1);
        this.listeners.set(type, funcs);
    };
    EventHandler.prototype.dispatchEvent = function (type) {
        var _this = this;
        var _a, _b;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.listeners.has(type)) // No Event with this name
            return 1; //didn't find the call
        if (args.length > 0) {
            (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.forEach(function (func) { func.call(_this, args); }); //call all functions
        }
        else {
            (_b = this.listeners.get(type)) === null || _b === void 0 ? void 0 : _b.forEach(function (func) { func.call(_this); }); //call all functions
        }
        return 0;
    };
    return EventHandler;
}());
exports.EventHandler = EventHandler;
var Room = /** @class */ (function (_super) {
    __extends(Room, _super);
    function Room(_members) {
        if (_members === void 0) { _members = new Array(); }
        var _this = _super.call(this) || this;
        _this.members = _members.slice(0, _members.length); //copy
        return _this;
    }
    Room.prototype.AddMember = function (member) {
        if (this.members.indexOf(member) < 0)
            return 1;
        this.members.push(member);
        return 0;
    };
    Room.prototype.GetIndex = function (member) {
        return this.members.indexOf(member);
    };
    Room.prototype.HasMember = function (member) {
        return this.members.indexOf(member) < 0 ? false : true;
    };
    return Room;
}(EventHandler));
exports.Room = Room;
