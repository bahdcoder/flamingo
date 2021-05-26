import Faker from 'faker'
import { EntityManager } from '@mikro-orm/core'
import { MongoDriver } from '@mikro-orm/mongodb'
import {
    Tag,
    Comment,
    User,
    Post,
    Reaction,
    ReactionHiddenFromApi
} from './resources'
import {
    TenseiContract,
    plugin,
    tensei,
    PluginContract,
    DatabaseConfiguration
} from '@tensei/core'
import { ResourceContract } from '@tensei/common/resources'

export const resources = () => [
    Tag,
    Comment,
    User(),
    Post(),
    Reaction,
    ReactionHiddenFromApi
]

let loggedDatabase = false

export const fakeTag = () =>
    ({
        name: Faker.lorem.word(),
        priority: 3,
        description: Faker.lorem.sentence()
    } as {
        id?: string | number
        name: string
        description: string
        priority: number
    })

export const fakeUser = () => ({
    id: undefined,
    full_name: Faker.name.findName(),
    email: Faker.internet.exampleEmail(),
    password: 'password'
})

export const fakePost = () => ({
    id: undefined,
    title: Faker.lorem.sentence(),
    description: Faker.lorem.sentence(),
    slug: Faker.lorem.sentence(),
    content: Faker.lorem.sentence(),
    av_cpc: Faker.random.number(),
    category: Faker.random.arrayElement([
        'javascript',
        'angular',
        'pg',
        'mysql'
    ]),
    approved: Faker.random.boolean(),
    scheduled_for: Faker.date.future(),
    published_at: Faker.date.past()
})

export const getDatabaseCredentials = () => {
    const databaseType = (process.env.DATABASE_TYPE || 'mysql') as any

    const config: DatabaseConfiguration = {
        type: databaseType,
        forceUtcTimezone: true
    }

    if (databaseType === 'postgresql') {
        config.dbName = process.env.DATABASE_NAME || 'postgres'
        config.user = process.env.DATABASE_USER || 'postgres'
        config.password = process.env.DATABASE_PASSWORD || 'postgres'
    } else {
        config.dbName = process.env.DATABASE_NAME || 'mikrotensei'
        config.user = process.env.DATABASE_USER || 'root'
        config.password = process.env.DATABASE_PASSWORD || ''
    }

    return config
}

export const setup = async (plugins: PluginContract[] = [], reset = true, otherResources: ResourceContract[] = []) => {
    const instance = await tensei()
        .resources([
            ...resources(),
            ...otherResources
        ])
        .plugins(plugins)
        .db(getDatabaseCredentials())
        .start(() => {}, false)

    reset && (await cleanupDatabase(instance))

    // @ts-ignore
    if (!loggedDatabase) {
        instance.ctx.logger.info(
            `Running tensei tests for ${instance.ctx.orm.em.config.get('type')}`
        )

        loggedDatabase = true
    }

    return instance
}

export const cleanupDatabase = async (instance: TenseiContract) => {
    const type = instance.ctx.orm.config.get('type')

    if (type === 'mongo') {
        return cleanupMongodbDatabase(instance)
    }

    const schemaGenerator = instance.ctx.orm.getSchemaGenerator()

    await schemaGenerator.dropSchema()

    await schemaGenerator.createSchema()
}

export const cleanupMongodbDatabase = async (instance: TenseiContract) => {
    await ((instance.ctx.orm.em.getDriver() as unknown) as EntityManager<MongoDriver>)
        .getConnection()
        .getDb()
        .dropDatabase()
}

export const sortArrayById = (items: any[]) =>
    items.sort((i1: any, i2: any) => (i1.id > i2.id ? 1 : -1))

export let gql = (t: any) => t.toString()

export const getFakeMailer = () => ({
    send: jest.fn(),
    sendRaw: jest.fn()
})

export const setupFakeMailer = ({ sendRaw, send }) =>
    plugin('Mock mailer').register(async ({ mailer }) => {
        mailer.send = send
    })
