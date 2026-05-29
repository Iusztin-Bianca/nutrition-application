class AppException(Exception):
    def __init__(self, message: str, status_code: int):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class EmailAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__("Emailul este deja înregistrat!", 400)


class InvalidCredentialsError(AppException):
    def __init__(self):
        super().__init__("Email sau parolă incorectă!", 401)


class EmailNotVerifiedError(AppException):
    def __init__(self):
        super().__init__("Te rugăm să îți confirmi adresa de email înainte de a te loga.", 403)


class InvalidTokenError(AppException):
    def __init__(self):
        super().__init__("Link invalid sau expirat.", 400)


class UserNotFoundError(AppException):
    def __init__(self):
        super().__init__("Utilizatorul nu există.", 404)
