import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3BucketService } from './aws-s3-bucket.service';

describe('AwsS3BucketService', () => {
  let service: AwsS3BucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsS3BucketService],
    }).compile();

    service = module.get<AwsS3BucketService>(AwsS3BucketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
