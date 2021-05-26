import { rest } from '@tensei/rest'
import { PluginContract } from '@tensei/core'

import { setup as baseSetup } from '../../../helpers'
import { ResourceContract } from '@tensei/common/resources'

export * from '../../../helpers'

export const setup = (plugins: PluginContract[] = [], reset = true, otherResources: ResourceContract[] = []) =>
    baseSetup([...plugins, rest().plugin()], reset, otherResources)
