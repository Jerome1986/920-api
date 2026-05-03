import { Injectable } from '@nestjs/common';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';
import { WallettransactionRepository } from './wallet-transaction.repository';
import { WalletFilterTab } from './dto/query-wallet-transaction.dto';

@Injectable()
export class WalletTransactionService {
  constructor(private repo: WallettransactionRepository) { }

  create(createWalletTransactionDto: CreateWalletTransactionDto) {
    return this.repo.create(createWalletTransactionDto)
  }

  findAll() {
    return `This action returns all walletTransaction`;
  }

  // 获取个人流水
  async findByUser(userId: string, tab: WalletFilterTab, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findByUser(userId, tab, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  update(id: number, updateWalletTransactionDto: UpdateWalletTransactionDto) {
    return `This action updates a #${id} walletTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} walletTransaction`;
  }
}
