import Express from 'express'

class FindResourceController {
    public show = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { manager } = request

        const resourceManager = manager(request.params.resource)

        await resourceManager.authorize('authorizedToShow')

        const model = await resourceManager.findOneById(
            request.params.resourceId
        )

        if (!model) {
            return response.status(404).json({
                message: `Resource with id ${request.params.resourceId} was not found.`
            })
        }

        return response.json(model)
    }

    public showRelation = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { manager } = request

        const resourceManager = manager(request.params.resource)

        await resourceManager.authorize('authorizedToShow')

        return response.json(
            await resourceManager.findAllRelatedResource(
                request.params.resourceId,
                request.params.relatedResource
            )
        )
    }
}

export default new FindResourceController()
