"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// @ts-ignore
global.__db = {};
// define simply a global object for our DB.. we don't need persistence or specific queries
// @ts-ignore
const db = () => global.__db;
exports.db = db;
//# sourceMappingURL=db.js.map