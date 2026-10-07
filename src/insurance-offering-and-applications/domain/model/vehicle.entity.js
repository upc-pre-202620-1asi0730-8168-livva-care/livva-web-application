export class Vehicle {
    constructor({
                    id,
                    userId,
                    licensePlate,
                    brand,
                    model,
                    manufactureYear,
                    estimatedValue,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.userId = userId;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.manufactureYear = manufactureYear;
        this.estimatedValue = estimatedValue;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}