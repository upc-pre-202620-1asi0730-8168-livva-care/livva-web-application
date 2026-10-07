export class VehicleClaim {
    constructor({
                    id,
                    policyId,
                    incidentDate,
                    incidentLocation,
                    description,
                    estimatedDamageAmount,
                    status,
                    reportedAt,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.policyId = policyId;
        this.incidentDate = incidentDate;
        this.incidentLocation = incidentLocation;
        this.description = description;
        this.estimatedDamageAmount = estimatedDamageAmount;
        this.status = status;
        this.reportedAt = reportedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}