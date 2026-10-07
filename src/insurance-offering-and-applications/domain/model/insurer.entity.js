export class Insurer {
    constructor({
                    id,
                    externalReference,
                    name,
                    active,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.externalReference = externalReference;
        this.name = name;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}