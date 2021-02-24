import { paramCase } from 'change-case'

export interface PlanConfig {
    name: string
    slug: string
    description: string
    monthlyID?: string
    yearlyID?: string
    features: string[]
    archived?: boolean
}

class Plan {
    private config: PlanConfig = {
        name: '',
        slug: '',
        description: '',
        features: []
    }

    constructor(name: string, slug?: string) {
        this.config.name = name
        this.config.slug = slug || paramCase(name)
    }

    public yearly(id: string) {
        this.config.yearlyID = id

        return this
    }

    public monthly(id: string) {
        this.config.monthlyID = id

        return this
    }

    public features(features: string[]) {
        this.config.features = features

        return this
    }

    public archived() {
        this.config.archived = true

        return this
    }

    public serialize() {
        return this.config
    }
}

export default Plan
