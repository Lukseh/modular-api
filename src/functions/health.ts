import { Request, Response } from 'express';
import { PORT } from '../index';
import * as net from 'net';

interface Health {
    state: string;
    isHealthy: boolean;
    port: number;
    message: string;
}

let AppPort: number;
let healthystate: string = "unknown";

export const healthCheck = async (req: Request, res: Response) => {
  await doctor();
  const health: Health[] = [
    { 
      state: healthystate, 
      isHealthy: healthystate === "healthy",
      port: AppPort,
      message: healthystate === "healthy" ? `App is listening on port ${AppPort}` : `App is not responding on port ${AppPort}`
    }
  ];

  res.json(health);
};

async function doctor(): Promise<void> {
    // Set the port to check
    if(process.env.PORT)
        AppPort = Number(process.env.PORT);
    else if(PORT)
        AppPort = Number(PORT);
    else
        AppPort = 7474;

    // Check if the app is listening on the port
    try {
        const isListening = await checkPortListening(AppPort);
        if (isListening) {
            healthystate = "healthy";
        } else {
            healthystate = "unhealthy";
        }
    } catch (error) {
        healthystate = "error";
    }
}

function checkPortListening(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.close(() => {
                resolve(false); // Port is available, so app is not listening
            });
        });
        
        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true); // Port is in use, so app is listening
            } else {
                resolve(false);
            }
        });
    });
}