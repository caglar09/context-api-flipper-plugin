"use strict";
exports.__esModule = true;
exports.ContextHelper = void 0;
exports.ContextHelper = {
    generateContextName: function (prefix) {
        var _prefix = prefix ? prefix : new Date().getTime().toString();
        return "".concat(_prefix, "Context");
    }
};
