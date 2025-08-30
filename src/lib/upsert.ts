import { connectDB, isConnected } from './db';
import Spec from '../models/Spec';
import { normalizeSpec } from './normalize';

// Mock storage for when DB is not available
const mockSpecs: Record<string, any> = {};

export async function upsertSpec(slug: string, data: any) {
  await connectDB();
  
  // Normalize the data before saving
  const normalizedData = normalizeSpec(data);
  
  if (isConnected()) {
    // Check if we need to preserve existing support data
    const shouldPreserveSupport = !('support' in data);
    
    if (shouldPreserveSupport) {
      // Get existing spec to preserve support data
      const existingSpec = await Spec.findOne({ slug });
      if (existingSpec && existingSpec.data && existingSpec.data.support) {
        normalizedData.support = existingSpec.data.support;
      }
    }
    
    return await Spec.findOneAndUpdate(
      { slug },
      { 
        $set: { 
          slug,
          data: normalizedData,
          updatedAt: new Date() 
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  } else {
    // Use mock storage - preserve support data if not provided
    const shouldPreserveSupport = !('support' in data);
    if (shouldPreserveSupport && mockSpecs[slug]?.data?.support) {
      normalizedData.support = mockSpecs[slug].data.support;
    }
    
    mockSpecs[slug] = {
      slug,
      data: normalizedData,
      createdAt: mockSpecs[slug]?.createdAt || new Date(),
      updatedAt: new Date(),
      id: slug,
      _id: slug
    };
    console.log(`[DEV] Upserted spec to mock storage with slug: ${slug}${shouldPreserveSupport ? ' (preserved support data)' : ''}`);
    return mockSpecs[slug];
  }
}

export async function getSpecBySlug(slug: string) {
  await connectDB();
  
  if (isConnected()) {
    return await Spec.findOne({ slug });
  } else {
    return mockSpecs[slug] || null;
  }
}
