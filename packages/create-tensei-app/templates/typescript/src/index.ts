import { cms } from '@tensei/cms'
import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'
import { welcome, tensei } from '@tensei/core'

tensei()
    .root(__dirname)
    .plugins([welcome(), cms().plugin(), auth().plugin(), graphql().plugin()])
    .start()
    .catch(console.error)
