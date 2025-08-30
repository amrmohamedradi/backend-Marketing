import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Spec document - using flexible Mixed type
export interface ISpec extends Document {
  slug: string;
  data: Record<string, unknown>; // Store all spec data as flexible object
  createdAt: Date;
  updatedAt: Date;
}

// Define the Spec schema - simple and flexible
const SpecSchema = new Schema<ISpec>(
  {
    slug: { 
      type: String, 
      unique: true, 
      required: true 
    },
    data: {
      type: Schema.Types.Mixed, // Flexible storage for any JSON structure
      required: true
    }
  },
  { 
    timestamps: true,
    strict: false // Allow additional fields
  }
);

// Create index on slug field
SpecSchema.index({ slug: 1 });

// Create the Spec model
const Spec = mongoose.model<ISpec>('Spec', SpecSchema);

export default Spec;