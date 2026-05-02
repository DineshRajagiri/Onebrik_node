import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import TypesenseClient from 'typesense/lib/Typesense/Client';
import { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger(TypesenseService.name);

  readonly client: TypesenseClient;

  constructor() {
    const options: ConfigurationOptions = {
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || '40.192.6.63',
          port: Number(process.env.TYPESENSE_PORT) || 8108,
          protocol: (process.env.TYPESENSE_PROTOCOL as 'http' | 'https') || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz123',
      connectionTimeoutSeconds: 5,
    };
    this.client = new TypesenseClient(options);
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  /** Create the products collection if it doesn't already exist. */
  private async ensureCollection() {
    try {
      await this.client.collections('products').retrieve();
      this.logger.log('Typesense "products" collection already exists');
    } catch {
      try {
        await this.client.collections().create({
          name: 'products',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'brand', type: 'string', facet: true, optional: true },
            { name: 'category', type: 'string', facet: true, optional: true },
            { name: 'description', type: 'string', optional: true },
            { name: 'price', type: 'float', optional: true },
            { name: 'isActive', type: 'bool', optional: true },
          ],
        });
        this.logger.log('Typesense "products" collection created');
      } catch (err) {
        this.logger.error('Failed to create Typesense collection', err?.message);
      }
    }
  }

  /** Upsert a product document into Typesense. */
  async upsertProduct(product: {
    id: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    price?: number;
    isActive?: boolean;
  }) {
    try {
      await this.client
        .collections('products')
        .documents()
        .upsert({
          id: product.id,
          name: product.name,
          brand: product.brand || '',
          category: product.category || '',
          description: product.description || '',
          price: product.price || 0,
          isActive: product.isActive ?? true,
        });
    } catch (err) {
      this.logger.warn(`Typesense upsert failed for product ${product.id}: ${err?.message}`);
    }
  }

  /** Remove a product document from Typesense. */
  async deleteProduct(id: string) {
    try {
      await this.client.collections('products').documents(id).delete();
    } catch (err) {
      this.logger.warn(`Typesense delete failed for product ${id}: ${err?.message}`);
    }
  }

  /** Full-text search across name, brand, description. */
  async searchProducts(query: string, options?: {
    page?: number;
    perPage?: number;
    filterBy?: string;
  }) {
    return this.client
      .collections('products')
      .documents()
      .search({
        q: query || '*',
        query_by: 'name,brand,description',
        prefix: true,
        num_typos: 2,
        page: options?.page || 1,
        per_page: options?.perPage || 20,
        ...(options?.filterBy ? { filter_by: options.filterBy } : {}),
      });
  }
}
