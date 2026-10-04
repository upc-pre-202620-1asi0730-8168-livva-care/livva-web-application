import { LifeInsuranceApplication } from '../domain/model/life-insurance-application.entity.js';

export class LifeInsuranceApplicationAssembler {
    static toEntity(resource) {
        return new LifeInsuranceApplication({
            applicationId: resource.applicationId
        });
    }

    static toEntities(resources = []) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(application) {
        return {
            applicationId: application.applicationId
        };
    }
}