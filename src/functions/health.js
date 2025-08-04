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
exports.healthCheck = void 0;
const index_1 = require("../index");
const net = __importStar(require("net"));
let AppPort;
let healthystate = "unknown";
const healthCheck = async (req, res) => {
    await doctor();
    const health = [
        {
            state: healthystate,
            isHealthy: healthystate === "healthy",
            port: AppPort,
            message: healthystate === "healthy" ? `App is listening on port ${AppPort}` : `App is not responding on port ${AppPort}`
        }
    ];
    res.json(health);
};
exports.healthCheck = healthCheck;
async function doctor() {
    // Set the port to check
    if (process.env.PORT)
        AppPort = Number(process.env.PORT);
    else if (index_1.PORT)
        AppPort = Number(index_1.PORT);
    else
        AppPort = 7474;
    // Check if the app is listening on the port
    try {
        const isListening = await checkPortListening(AppPort);
        if (isListening) {
            healthystate = "healthy";
        }
        else {
            healthystate = "unhealthy";
        }
    }
    catch (error) {
        healthystate = "error";
    }
}
function checkPortListening(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => {
                resolve(false); // Port is available, so app is not listening
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true); // Port is in use, so app is listening
            }
            else {
                resolve(false);
            }
        });
    });
}
