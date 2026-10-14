export const ErrorResponse = ({message="Error" , statusCode = 400 , extra = undefined}) => {
    const error = new Error(
        typeof message === 'string' ? message : message?.message
    );
    error.statusCode = statusCode;
    error.extra = extra;
    return error;
};
export const BadRequestException = ({message="BadRequestException" , extra }) => {
    return ErrorResponse({message , statusCode: 400 , extra});
}
export const ConflictException = ({message="ConflictException" , extra }) => {
    return ErrorResponse({message , statusCode: 409 , extra});
}
export const NotFoundException = ({message="NotFoundException" , extra }) => {
    return ErrorResponse({message , statusCode: 404 , extra});
}
export const UnauthorizedException = ({message="UnauthorizedException" , extra }) => {
    return ErrorResponse({message , statusCode: 401 , extra});
}
export const ForbiddenException = ({message="ForbiddenException" , extra }) => {
    return ErrorResponse({message , statusCode: 403 , extra});
}
export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode ?? 500;
    const extra = err.extra || undefined;
    return res.status(statusCode).json({message: err.message || "Internal Server Error" , stack : err.stack , extra});
}