/**
 * Demonstration of different import methods for @modular/api
 * This file shows how to use the package after yarn build
 */
import * as ModularAPI from './index';
declare function runDemonstration(): Promise<{
    cms: ModularAPI.ModularCMS;
    client: ModularAPI.ModularClient;
}>;
export { runDemonstration };
//# sourceMappingURL=demo-imports.d.ts.map