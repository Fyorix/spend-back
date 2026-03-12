
export class UserNotFoundException extends Error {
    constructor(userId: string) {
        super(`User with ID ${userId} not found`);
        this.name = 'UserNotFoundException';
        Object.setPrototypeOf(this, UserNotFoundException.prototype);
    }
}

export class UserAlreadyExistsException extends Error {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
        this.name = 'UserAlreadyExistsException';
        Object.setPrototypeOf(this, UserAlreadyExistsException.prototype);
    }
}


export class InvalidPasswordException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPasswordException';
        Object.setPrototypeOf(this, InvalidPasswordException.prototype);
    }
}