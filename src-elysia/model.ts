import { t } from 'elysia'

export namespace ModulaR {
  // Module configuration that apps send to register
  export const ModuleConfig = t.Object({
    moduleId: t.String({
      description: 'Unique identifier for the module'
    }),
    moduleName: t.String({
      description: 'Human-readable name of the module'
    }),
    version: t.String({
      description: 'Module version (semver format)'
    }),
    description: t.Optional(t.String({
      description: 'Module description'
    })),
    capabilities: t.Array(t.Object({
      name: t.String(),
      description: t.String(),
      version: t.Optional(t.String())
    })),
    endpoints: t.Array(t.Object({
      path: t.String(),
      method: t.String(),
      description: t.String(),
      protected: t.Optional(t.Boolean())
    }))
  })
  
  export type ModuleConfig = typeof ModuleConfig.static
  
  // Registration response
  export const RegistrationResponse = t.Object({
    success: t.Boolean(),
    message: t.String(),
    moduleId: t.String(),
    registeredAt: t.String()
  })
  
  export type RegistrationResponse = typeof RegistrationResponse.static
  
  // Heartbeat payload
  export const HeartbeatPayload = t.Object({
    moduleId: t.String(),
    status: t.Optional(t.String()),
    memory: t.Optional(t.Object({
      used: t.Number(),
      total: t.Number(),
      percentage: t.Number()
    })),
    cpu: t.Optional(t.Object({
      percentage: t.Number(),
      load: t.Optional(t.Array(t.Number()))
    }))
  })
  
  export type HeartbeatPayload = typeof HeartbeatPayload.static
  
  // Health response
  export const HealthResponse = t.Object({
    status: t.String(),
    timestamp: t.String(),
    uptime: t.Number(),
    modules: t.Optional(t.Object({
      total: t.Number(),
      active: t.Number(),
      inactive: t.Number()
    }))
  })
  
  export type HealthResponse = typeof HealthResponse.static
  
  // Modules list response
  export const ModulesListResponse = t.Object({
    modules: t.Array(ModuleConfig),
    total: t.Number(),
    timestamp: t.String()
  })
  
  export type ModulesListResponse = typeof ModulesListResponse.static
}
