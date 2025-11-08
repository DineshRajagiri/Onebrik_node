import { Test, TestingModule } from '@nestjs/testing';
import { SidebarService } from '../sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SidebarService],
    }).compile();

    service = module.get<SidebarService>(SidebarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
