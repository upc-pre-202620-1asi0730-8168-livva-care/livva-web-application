import { UserProfile } from '../domain/model/user-profile.entity.js';

export class UserProfileAssembler {
    static toEntity(resource) {
        return new UserProfile({
            id: resource.id,
            userId: resource.userId,
            documentType: resource.documentType,
            documentNumber: resource.documentNumber,
            birthDate: resource.birthDate,
            address: resource.address,
            district: resource.district,
            province: resource.province,
            department: resource.department,
            country: resource.country,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map(resource =>
            UserProfileAssembler.toEntity(resource)
        );
    }

    static toResource(profile) {
        return {
            id: profile.id,
            userId: profile.userId,
            documentType: profile.documentType,
            documentNumber: profile.documentNumber,
            birthDate: profile.birthDate,
            address: profile.address,
            district: profile.district,
            province: profile.province,
            department: profile.department,
            country: profile.country,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
        };
    }
}