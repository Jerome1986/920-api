import { CreateStoreServiceOrderDto } from "./create-store-service-order.dto";
import { IsString } from "class-validator";

export class FreeStoreServiceOrderDto extends CreateStoreServiceOrderDto {
  @IsString()
  memberPhone: string
}