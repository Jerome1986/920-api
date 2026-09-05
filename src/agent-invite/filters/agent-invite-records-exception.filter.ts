import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class AgentInviteRecordsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    const rawMessage = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as { message?: string | string[] }).message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('，')
      : rawMessage ?? exception.message

    response.status(status).json({ code: status, message, data: null })
  }
}
