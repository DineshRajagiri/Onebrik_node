import { Test, TestingModule } from '@nestjs/testing';
import { NeftService } from './neft.service';

describe('NeftService', () => {
  let service: NeftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeftService],
    }).compile();

    service = module.get<NeftService>(NeftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
