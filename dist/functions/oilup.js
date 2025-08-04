"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oilup = void 0;
const oilup = (req, res) => {
    const users = [
        { WhoIsOiledUp: "Mateusz Wojtal" }
    ];
    res.json(users);
};
exports.oilup = oilup;
