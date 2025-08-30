import { SpecDocument, SpecPayload } from '../types/spec';

// In-memory storage for quick demo
class InMemorySpecStore {
  private specs = new Map<string, SpecDocument>();

  async upsert(id: string, data: SpecPayload): Promise<{ isNew: boolean; spec: SpecDocument }> {
    const existing = this.specs.get(id);
    const now = new Date();
    
    const spec: SpecDocument = {
      id,
      data,
      updatedAt: now,
      createdAt: existing?.createdAt || now
    };

    this.specs.set(id, spec);
    return { isNew: !existing, spec };
  }

  async findById(id: string): Promise<SpecDocument | null> {
    return this.specs.get(id) || null;
  }

  async delete(id: string): Promise<boolean> {
    return this.specs.delete(id);
  }

  async list(): Promise<SpecDocument[]> {
    return Array.from(this.specs.values());
  }
}

// Singleton instance
export const specStore = new InMemorySpecStore();

// Future: MongoDB/Prisma implementation
/*
import { MongoClient } from 'mongodb';

class MongoSpecStore {
  private collection: any;

  constructor(mongoUrl: string) {
    const client = new MongoClient(mongoUrl);
    this.collection = client.db('specs').collection('specs');
  }

  async upsert(id: string, data: SpecPayload): Promise<{ isNew: boolean; spec: SpecDocument }> {
    const now = new Date();
    const result = await this.collection.findOneAndUpdate(
      { id },
      { 
        $set: { data, updatedAt: now },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    return { 
      isNew: !result.lastErrorObject?.updatedExisting,
      spec: result.value 
    };
  }

  async findById(id: string): Promise<SpecDocument | null> {
    return await this.collection.findOne({ id });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}
*/
