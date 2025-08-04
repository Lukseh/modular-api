import { Request, Response, Router } from 'express';
import { modularService } from '../services/modularService';
import { ModuleConfig, ModularApiResponse } from '../types/modular';

const router = Router();

// Module registration endpoint
router.post('/register', async (req: Request, res: Response) => {
    try {
        const moduleConfig: ModuleConfig = req.body;
        const result = await modularService.registerModule(moduleConfig);
        
        const statusCode = result.success ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error during module registration',
            timestamp: new Date().toISOString()
        });
    }
});

// Get all registered modules
router.get('/modules', async (req: Request, res: Response) => {
    try {
        const modules = modularService.getRegisteredModules();
        
        const response: ModularApiResponse = {
            success: true,
            data: {
                modules,
                totalCount: modules.length
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve modules',
            timestamp: new Date().toISOString()
        });
    }
});

// Get specific module information
router.get('/modules/:moduleId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { moduleId } = req.params;
        const module = modularService.getModule(moduleId);
        
        if (!module) {
            res.status(404).json({
                success: false,
                error: 'Module not found',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const health = modularService.getModuleHealth(moduleId);

        const response: ModularApiResponse = {
            success: true,
            data: {
                module,
                health
            },
            moduleId,
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve module',
            timestamp: new Date().toISOString()
        });
    }
});

// Module heartbeat endpoint
router.post('/heartbeat/:moduleId', async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const healthData = req.body;

        const result = await modularService.updateHeartbeat(moduleId, healthData);
        
        const statusCode = result.success ? 200 : 404;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to process heartbeat',
            timestamp: new Date().toISOString()
        });
    }
});

// Unregister module
router.delete('/modules/:moduleId', async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const result = await modularService.unregisterModule(moduleId);
        
        const statusCode = result.success ? 200 : 404;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to unregister module',
            timestamp: new Date().toISOString()
        });
    }
});

// Communication endpoint for CMS to module
router.post('/communicate/:moduleId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { moduleId } = req.params;
        const { action, data } = req.body;

        if (!action) {
            res.status(400).json({
                success: false,
                error: 'Action is required for communication',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const result = await modularService.sendCommunication(moduleId, action, data);
        
        const statusCode = result.success ? 200 : 404;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Communication failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Broadcast endpoint for CMS to all modules
router.post('/broadcast', async (req: Request, res: Response): Promise<void> => {
    try {
        const { action, data } = req.body;

        if (!action) {
            res.status(400).json({
                success: false,
                error: 'Action is required for broadcast',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const result = await modularService.broadcastToModules(action, data);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Broadcast failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Health check for all modules
router.get('/health', async (req: Request, res: Response) => {
    try {
        const healthStatuses = modularService.getAllModuleHealth();
        
        const response: ModularApiResponse = {
            success: true,
            data: {
                overallHealth: healthStatuses.every(h => h.status === 'active') ? 'healthy' : 'degraded',
                modules: healthStatuses,
                totalModules: healthStatuses.length,
                activeModules: healthStatuses.filter(h => h.status === 'active').length,
                inactiveModules: healthStatuses.filter(h => h.status === 'inactive').length,
                errorModules: healthStatuses.filter(h => h.status === 'error').length
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get health status',
            timestamp: new Date().toISOString()
        });
    }
});

// Get communication log
router.get('/logs', async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const logs = modularService.getCommunicationLog(limit);
        
        const response: ModularApiResponse = {
            success: true,
            data: {
                logs,
                totalLogs: logs.length
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve communication logs',
            timestamp: new Date().toISOString()
        });
    }
});

// Module capabilities endpoint
router.get('/modules/:moduleId/capabilities', async (req: Request, res: Response): Promise<void> => {
    try {
        const { moduleId } = req.params;
        const module = modularService.getModule(moduleId);
        
        if (!module) {
            res.status(404).json({
                success: false,
                error: 'Module not found',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const response: ModularApiResponse = {
            success: true,
            data: {
                moduleId,
                moduleName: module.moduleName,
                capabilities: module.capabilities,
                endpoints: module.endpoints
            },
            moduleId,
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve module capabilities',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;