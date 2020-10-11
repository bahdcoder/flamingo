import Field from './Field'

export class BooleanField extends Field {
    public databaseFieldType: string = 'boolean'

    public component = 'BooleanField'

    private booleanConfig = {
        trueLabel: 'Yes',
        falseLabel: 'No'
    }

    /**
     * Instantiate a new field. Requires the name,
     * and optionally the corresponding database
     * field. This field if not provided will
     * default to the camel case version of
     * the name.
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.rules('boolean')
    }

    public trueLabel(value: string) {
        this.booleanConfig.trueLabel = value

        return this
    }

    public falseLabel(value: string) {
        this.booleanConfig.falseLabel = value

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            trueLabel: this.booleanConfig.trueLabel,
            falseLabel: this.booleanConfig.falseLabel
        }
    }
}

export const boolean = (name: string, databaseField?: string) =>
    new BooleanField(name, databaseField)

export default BooleanField
