export class UserProfile {
    constructor({
                    id,
                    userId,
                    documentType,
                    documentNumber,
                    birthDate,
                    address,
                    district,
                    province,
                    department,
                    country,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.userId = userId;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.birthDate = birthDate;
        this.address = address;
        this.district = district;
        this.province = province;
        this.department = department;
        this.country = country;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}