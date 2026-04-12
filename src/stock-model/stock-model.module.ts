import { Module } from '@nestjs/common';
import { StockModelService } from './stock-model.service';
import { StockModelController } from './stock-model.controller';
import { StockModelRepository } from './stock-model.repositroy';
import { StockModelPorductRepository } from './stock-model-product.repositroy';

@Module({
  controllers: [StockModelController],
  providers: [StockModelService, StockModelRepository, StockModelPorductRepository],
})
export class StockModelModule { }
