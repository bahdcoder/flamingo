import Qs from 'qs'
import Faker from 'faker'
import Supertest from 'supertest'
import { plugin, event, resource, text  } from '@tensei/common'

import { setup, fakeUser, fakePost } from './setup'

const buildingResource = resource('Building')
.fields([
    text('Title')
])
.publishable()

test('Generates types only for resources not hidden from API', async () => {
    const { app } = await setup()

    const client = Supertest(app)

    const responses = await Promise.all([
        client.post('/api/comments'),
        client.post('/api/reaction-hidden-from-apis')
    ])

    expect(responses.map(r => r.status)).toEqual([422, 404])
})

test('Only resources exposed to API have index_resources endpoints', async () => {
    const { app } = await setup()

    const client = Supertest(app)

    const responses = await Promise.all([
        client.get('/api/comments'),
        client.get('/api/reaction-hidden-from-apis')
    ])

    expect(responses.map(r => r.status)).toEqual([200, 404])
})

test('Only resources exposed to DELETE API have delete_resources endpoints', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    const userPayload = fakeUser()

    await orm.em.persistAndFlush(orm.em.create('User', userPayload))

    const user = await orm.em.findOne<{
        id: string
        email: string
    }>('User', { email: userPayload.email })

    const postPayload = fakePost()

    await orm.em.persistAndFlush(
        orm.em.create('Post', {
            ...postPayload,
            user: user.id
        })
    )

    const post = await orm.em.findOne<{
        id: string
        title: string
    }>('Post', { title: postPayload.title })

    const { status: deletePostStatus } = await client.delete(
        `/api/posts/${post.id}`
    )

    await orm.em.removeAndFlush(post)

    const [
        { status: deleteUserStatus, body },
        { status: deleteReactionStatus }
    ] = await Promise.all([
        client.delete(`/api/users/${user.id}`),
        client.delete(`/api/reaction-hidden-from-apis/1`)
    ])

    orm.em.clear()

    expect([deletePostStatus, deleteUserStatus, deleteReactionStatus]).toEqual([
        404,
        200,
        404
    ])
})

test('Only resources exposed to PUT AND PATCH API have update_resources endpoints', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    const userPayload = fakeUser()

    await orm.em.persistAndFlush(orm.em.create('User', userPayload))

    const user = await orm.em.findOne<{
        id: string
        email: string
    }>('User', { email: userPayload.email })

    const postPayload = fakePost()

    await orm.em.persistAndFlush(
        orm.em.create('Post', {
            ...postPayload,
            user: user.id
        })
    )

    const reactionPayload = { like: true }

    await orm.em.persistAndFlush(
        orm.em.create('ReactionHiddenFromApi', reactionPayload)
    )

    const reaction: any = await orm.em.findOne(
        'ReactionHiddenFromApi',
        reactionPayload
    )

    const post = await orm.em.findOne<{
        id: string
        title: string
    }>('Post', { title: postPayload.title })

    const [
        { status: updatePostStatus },
        { status: updateUserStatus },
        { status: updateReactionStatus }
    ] = await Promise.all([
        client.patch(`/api/posts/${post.id}`).send({}),
        client.patch(`/api/users/${user.id}`).send(fakeUser()),
        client
            .patch(`/api/reaction-hidden-from-apis/${reaction.id}`)
            .send({ like: false })
    ])

    orm.em.clear()

    expect([updatePostStatus, updateUserStatus, updateReactionStatus]).toEqual([
        404,
        200,
        404
    ])
})

test('emits inserted event after resource is inserted', async () => {
    const listener = jest.fn()

    const {
        app,
        ctx: { emitter, orm }
    } = await setup([
        plugin('Register listeners').register(({ extendEvents }) => {
            extendEvents([
                event('user::inserted').listen(({ payload }) =>
                    listener(payload.toJSON())
                )
            ])
        })
    ])

    const client = Supertest(app)

    const fake_user = fakeUser()

    const response = await client.post('/api/users').send(fake_user)

    const expectedPayload = {}

    expect(response.status).toBe(201)
    expect(response.body.data).toEqual({
        id: expect.anything(),
        full_name: fake_user.full_name,
        password: fake_user.password,
        email: fake_user.email,
        posts: [],
        created_at: expect.any(String),
        updated_at: expect.any(String)
    })
    expect(listener).toHaveBeenCalledWith({
        ...response.body.data,
        created_at: new Date(response.body.data.created_at),
        updated_at: new Date(response.body.data.updated_at)
    })
})

test('emits updated event after resource is updated', async () => {
    const listener = jest.fn()

    const {
        app,
        ctx: { emitter, orm }
    } = await setup([
        plugin('Register listeners').register(({ extendEvents }) => {
            extendEvents([
                event('user::updated').listen(({ payload }) =>
                    listener(payload.toJSON())
                )
            ])
        })
    ])

    const client = Supertest(app)

    const userPayload = fakeUser()
    const updatedUserPayload = fakeUser()

    await orm.em.persistAndFlush(orm.em.create('User', userPayload))

    const user = await orm.em.findOne<any>('User', { email: userPayload.email })

    const response = await client.patch(`/api/users/${user.id}`).send({
        email: updatedUserPayload.email,
        full_name: updatedUserPayload.full_name
    })

    const expectedPayload: any = {
        full_name: updatedUserPayload.full_name,
        password: user.password,
        email: updatedUserPayload.email
    }

    if (orm.config.get('type') === 'mongo') {
        expectedPayload.posts = []
    }

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({
        id: expect.anything(),
        ...expectedPayload,
        updated_at: expect.any(String),
        created_at: expect.any(String)
    })
    expect(listener).toHaveBeenCalledWith({
        id: response.body.data.id,
        ...expectedPayload,
        updated_at: new Date(response.body.data.updated_at),
        created_at: new Date(response.body.data.created_at)
    })
})

test('emits deleted event after resource is deleted', async () => {
    const listener = jest.fn()

    const {
        app,
        ctx: { orm }
    } = await setup([
        plugin('Register listeners').register(({ extendEvents }) => {
            extendEvents([
                event('user::deleted').listen(({ payload }) =>
                    listener(payload.map(p => p.toJSON()))
                )
            ])
        })
    ])

    const client = Supertest(app)

    const userPayload = fakeUser()
    await orm.em.persistAndFlush(orm.em.create('User', userPayload))

    const user = await orm.em.findOne<any>('User', { email: userPayload.email })

    const response = await client.delete(`/api/users/${user.id}`)

    expect(response.status).toBe(200)
    expect(listener).toHaveBeenCalledWith([
        {
            ...response.body.data,
            created_at: new Date(response.body.data.created_at),
            updated_at: new Date(response.body.data.updated_at)
        }
    ])
})

test('publishable resources hide drafts by default', async () => {
    const { app, ctx: { orm: { em } } } = await setup([], true, [buildingResource])

    const client = Supertest(app)

    const publishedBuilding = em.create('Building', {
        title: Faker.lorem.sentence(),
        published_at: new Date()
    })
    const draftedBuilding = em.create('Building', {
        title: Faker.lorem.sentence()
    })

    // Insert fake building
    await em.persistAndFlush([
        publishedBuilding,
        draftedBuilding
    ])

    const response = await client.get('/api/buildings')

    expect(response.status).toBe(200)
    expect(response.body.data.length).toBe(1)

    response.body.data.forEach((row) => {
        expect(row.published_at).toBeDefined()
    })
})
