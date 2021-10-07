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
exports.TicTacToe = exports.Game = void 0;
var Game = /** @class */ (function () {
    function Game() {
    }
    return Game;
}());
exports.Game = Game;
var TicTacToe = /** @class */ (function (_super) {
    __extends(TicTacToe, _super);
    function TicTacToe(rows, columns) {
        if (rows === void 0) { rows = 3; }
        if (columns === void 0) { columns = 3; }
        var _this = _super.call(this) || this;
        _this.rows = 3;
        _this.columns = 3;
        _this.rows = rows;
        _this.columns = columns;
        _this.grid = new Array(rows * columns);
        return _this;
    }
    TicTacToe.prototype.val = function (i, j) {
        return this.grid[this.columns * i + j];
    };
    TicTacToe.prototype.setVal = function (val, i, j) {
        this.grid[this.columns * i + j] = val;
    };
    TicTacToe.prototype.action = function (player, i, j) {
        this.setVal(player, i, j);
    };
    TicTacToe.prototype.GetState = function () {
        return {
            'state': this.grid
        };
    };
    return TicTacToe;
}(Game));
exports.TicTacToe = TicTacToe;
