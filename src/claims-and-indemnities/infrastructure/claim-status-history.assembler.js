import { ClaimStatusHistory } from '../domain/model/claim-status-history.entity.js';

export class ClaimStatusHistoryAssembler {
    static toEntity(resource) {
        return new ClaimStatusHistory({
            id: resource.id,
            claimId: resource.claimId,
            status: resource.status,
            comment: resource.comment,
            changedAt: resource.changedAt,
            createdAt: resource.createdAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(claimStatusHistory) {
        return {
            claimId: claimStatusHistory.claimId,
            status: claimStatusHistory.status,
            comment: claimStatusHistory.comment,
            changedAt: claimStatusHistory.changedAt,
            createdAt: claimStatusHistory.createdAt
        };
    }
}