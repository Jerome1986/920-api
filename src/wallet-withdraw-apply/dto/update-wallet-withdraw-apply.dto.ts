import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletWithdrawApplyDto } from './create-wallet-withdraw-apply.dto';

export class UpdateWalletWithdrawApplyDto extends PartialType(CreateWalletWithdrawApplyDto) {}
