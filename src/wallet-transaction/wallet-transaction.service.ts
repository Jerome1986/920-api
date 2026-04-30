import { Injectable } from '@nestjs/common';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';
import { WallettransactionRepository } from './wallet-transaction.repository';

@Injectable()
export class WalletTransactionService {
  constructor(private repo: WallettransactionRepository) { }

  create(createWalletTransactionDto: CreateWalletTransactionDto) {
    return 'This action adds a new walletTransaction';
  }

  findAll() {
    return `This action returns all walletTransaction`;
  }

  // 获取个人流水
  async findByUser(userId: string) {
    return this.repo.findByUser(userId)
  }

  update(id: number, updateWalletTransactionDto: UpdateWalletTransactionDto) {
    return `This action updates a #${id} walletTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} walletTransaction`;
  }
}
