import { Test, TestingModule } from '@nestjs/testing';
import { NeftController } from './neft.controller';

describe('NeftController', () => {
  let controller: NeftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeftController],
    }).compile();

    controller = module.get<NeftController>(NeftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
