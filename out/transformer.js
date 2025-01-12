"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformContext = void 0;
var ts = __importStar(require("typescript"));
var TransformContext = /** @class */ (function () {
    function TransformContext(program, context, config) {
        this.program = program;
        this.context = context;
        this.config = config;
        this.factory = context.factory;
    }
    TransformContext.prototype.transform = function (node) {
        var _this = this;
        return ts.visitEachChild(node, function (node) { return visitNode(_this, node); }, this.context);
    };
    return TransformContext;
}());
exports.TransformContext = TransformContext;
function visitNode(context, node) {
    if (ts.isClassDeclaration(node)) {
        var decorators = ts.getDecorators(node);
        var needContinue_1 = false;
        decorators === null || decorators === void 0 ? void 0 : decorators.forEach(function (decorator) {
            var identifier = decorator.expression;
            if (identifier.escapedText === "Provider" || identifier.escapedText === "Service") {
                needContinue_1 = true;
            }
        });
        if (needContinue_1) {
            var members = Array.from(node.members);
            var injections_1 = [];
            node.members.forEach(function (member) {
                if (ts.isPropertyDeclaration(member)) {
                    var decorators_1 = ts.getDecorators(member);
                    decorators_1 === null || decorators_1 === void 0 ? void 0 : decorators_1.forEach(function (decorator) {
                        var _a;
                        var identifier = decorator.expression;
                        if (identifier.escapedText === "Inject") {
                            var name_1 = member.name;
                            injections_1.push(ts.factory.createStringLiteral("".concat(name_1.escapedText.toString(), "#").concat((_a = member.type) === null || _a === void 0 ? void 0 : _a.getFullText().trim())));
                        }
                    });
                }
            });
            members.push(ts.factory.createPropertyDeclaration(undefined, ts.factory.createIdentifier("injections"), undefined, ts.factory.createTypeReferenceNode("string[]"), ts.factory.createArrayLiteralExpression(injections_1)));
            return ts.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, members);
        }
    }
    return context.transform(node);
}
