import { Test, TestingModule } from '@nestjs/testing';
import { SidebarController } from '../sidebar.controller';


describe('SidebarController', () => {
  let controller: SidebarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SidebarController],
    }).compile();

    controller = module.get<SidebarController>(SidebarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
