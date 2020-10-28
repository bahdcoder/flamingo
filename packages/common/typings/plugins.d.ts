declare module '@tensei/common/plugins' {
    import { Application } from 'express'
    import {
        StorageManager,
        Storage,
        StorageManagerConfig
    } from '@slynova/flydrive'
    import { EntityManager } from '@mikro-orm/core'
    import { ResourceContract, ManagerContract } from '@tensei/common/resources'
    import {
        Asset,
        EndpointMiddleware,
        Config,
        Permission,
        SupportedStorageDrivers,
        StorageConstructor
    } from '@tensei/common/config'

    type PluginSetupFunction = (config: PluginSetupConfig) => Promise<any>

    type SetupFunctions =
        | 'setup'
        | 'beforeDatabaseSetup'
        | 'afterDatabaseSetup'
        | 'beforeMiddlewareSetup'
        | 'afterMiddlewareSetup'
        | 'beforeCoreRoutesSetup'
        | 'afterCoreRoutesSetup'

    interface PluginSetupConfig extends Config {
        resources: ResourceContract[]
        app: Application
        resourcesMap: {
            [key: string]: ResourceContract
        }
        storageDriver<
            StorageDriverImplementation extends Storage,
            DriverConfig extends unknown
        >(
            driverName: SupportedStorageDrivers,
            driverConfig: DriverConfig,
            storageImplementation: StorageConstructor<
                StorageDriverImplementation
            >
        ): void
        manager: EntityManager | null
        pushResource: (resource: ResourceContract) => void
        pushMiddleware: (middleware: EndpointMiddleware) => void
        style: (name: Asset['name'], path: Asset['path']) => void
        script: (name: Asset['name'], path: Asset['path']) => void
    }

    export abstract class PluginContract {
        name: string
        slug: string
        data: {
            permissions: Permission[]
            setup: (config: PluginSetupConfig) => Promise<void>
            beforeDatabaseSetup: (config: PluginSetupConfig) => Promise<void>
            afterDatabaseSetup: (config: PluginSetupConfig) => Promise<void>
            beforeMiddlewareSetup: (config: PluginSetupConfig) => Promise<void>
            afterMiddlewareSetup: (config: PluginSetupConfig) => Promise<void>
            beforeCoreRoutesSetup: (config: PluginSetupConfig) => Promise<void>
            afterCoreRoutesSetup: (config: PluginSetupConfig) => Promise<void>
        }
        setup(setupFunction: PluginSetupFunction): this
        beforeDatabaseSetup(setupFunction: PluginSetupFunction): this
        afterDatabaseSetup(setupFunction: PluginSetupFunction): this
        beforeMiddlewareSetup(setupFunction: PluginSetupFunction): this
        afterMiddlewareSetup(setupFunction: PluginSetupFunction): this
        beforeCoreRoutesSetup(setupFunction: PluginSetupFunction): this
        afterCoreRoutesSetup(setupFunction: PluginSetupFunction): this
    }

    export declare class Plugin extends PluginContract {}

    export const plugin: (name: string) => PluginContract
}
