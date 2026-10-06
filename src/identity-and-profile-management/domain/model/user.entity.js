export class User {
    constructor({
                    id,
                    firstName,
                    lastName,
                    email,
                    passwordHash,
                    phone,
                    role,
                    active,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}