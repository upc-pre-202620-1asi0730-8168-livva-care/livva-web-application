import { IndemnityRequest } from '../domain/model/indemnity-request.entity.js';
import { IndemnityStatusHistory } from '../domain/model/indemnity-status-history.entity.js';

export class IndemnityRequestAssembler {
    static toEntity(resource) {
        const statusHistories = (resource.statusHistories ?? [])
            .map((history) => new IndemnityStatusHistory(history))
            .sort(
                (first, second) =>
                    new Date(second.changedAt) - new Date(first.changedAt)
            );

        return new IndemnityRequest({
            id: resource.id,
            policyId: resource.policyId,
            beneficiaryId: resource.beneficiaryId,
            requestDate: resource.requestDate,
            description: resource.description,
            status: resource.status,
            indemnityAmount: resource.indemnityAmount,
            submittedAt: resource.submittedAt,
            resolvedAt: resource.resolvedAt,
            statusHistories
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(indemnityRequest) {
        return {
            policyId: indemnityRequest.policyId,
            beneficiaryId: indemnityRequest.beneficiaryId,
            requestDate: indemnityRequest.requestDate,
            description: indemnityRequest.description,
            indemnityAmount: indemnityRequest.indemnityAmount ?? null
        };
    }
}
