"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = void 0;
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
exports.PORT = process.env.PORT || 7474;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({
        "state": "running"
    });
});
export * from './index';
app.use('/api', userRoutes_1.default);
app.listen(exports.PORT, () => {
    console.log(`Server is listening on port ${exports.PORT}`);
});
