import { User } from '../domain/model/user.entity.js';

export class UserAssembler {
    static toEntity(resource) {
        return new User({
            id: resource.id,
            firstName: resource.firstName,
            lastName: resource.lastName,
            email: resource.email,
            passwordHash: resource.passwordHash,
            phone: resource.phone,
            role: resource.role,
            active: resource.active,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map(resource =>
            UserAssembler.toEntity(resource)
        );
    }

    static toResource(user) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            phone: user.phone,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}