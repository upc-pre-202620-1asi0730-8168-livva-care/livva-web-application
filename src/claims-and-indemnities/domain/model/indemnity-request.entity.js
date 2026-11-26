export class IndemnityRequest {
    constructor({
                    id,
                    policyId,
                    beneficiaryId,
                    requestDate,
                    description,
                    status,
                    indemnityAmount,
                    submittedAt,
                    resolvedAt,
                    statusHistories = []
                }) {
        this.id = id;
        this.policyId = policyId;
        this.beneficiaryId = beneficiaryId;
        this.requestDate = requestDate;
        this.description = description;
        this.status = status;
        this.indemnityAmount = indemnityAmount;
        this.submittedAt = submittedAt;
        this.resolvedAt = resolvedAt;
        this.statusHistories = statusHistories;
    }

    get isOpen() {
        return ['submitted', 'under_review'].includes(this.status);
    }
}
