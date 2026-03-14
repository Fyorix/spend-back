export class UserNotFoundException extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found`);
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
  constructor(email: string) {
    super(`message: Invalid password for user with email ${email}`);
    this.name = 'InvalidPasswordException';
    Object.setPrototypeOf(this, InvalidPasswordException.prototype);
  }
}

export class UnexpectedErrorException extends Error {
  constructor(message: string) {
    super(`message: ${message}`);
    this.name = 'UnexpectedErrorException';
    Object.setPrototypeOf(this, UnexpectedErrorException.prototype);
  }
}
