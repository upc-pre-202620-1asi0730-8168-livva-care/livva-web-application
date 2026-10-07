import { Insurer } from '../domain/model/insurer.entity.js';

export class InsurerAssembler {
    static toEntity(resource) {
        return new Insurer({
            id: resource.id,
            externalReference: resource.externalReference,
            name: resource.name,
            active: resource.active,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources = []) {
        return resources.map((resource) => this.toEntity(resource));
    }
}