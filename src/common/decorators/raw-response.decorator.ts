import { SetMetadata } from '@nestjs/common'

/** 与 ResponseInterceptor 配合：为 true 时不包 { code, message, data } */
export const SKIP_RESPONSE_WRAP_KEY = 'skipResponseWrap'

export const RawResponse = () => SetMetadata(SKIP_RESPONSE_WRAP_KEY, true)
