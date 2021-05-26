import {} from './setup'
import { resource, text } from '@tensei/common'

test('can mark a resource as publishable', () => {
    const postResource = resource('Post')
        .fields([
            text('Title').nullable()
        ])
        .publishable()

    expect(postResource.data.publishable).toBe(true)
    expect(postResource.data.fields.find(f => f.name === 'Published At')).toBeDefined()

    expect(postResource.data.filters.find(f => f.config.name === 'Published')).toBeDefined()
    expect(postResource.data.filters.find(f => f.config.name === 'Drafted')).toBeDefined()

    postResource.notPublishable()

    expect(postResource.data.publishable).toBe(false)
    expect(postResource.data.fields.find(f => f.name === 'Published At')).not.toBeDefined()

    expect(postResource.data.filters.find(f => f.config.name === 'Published')).not.toBeDefined()
    expect(postResource.data.filters.find(f => f.config.name === 'Drafted')).not.toBeDefined()
})
