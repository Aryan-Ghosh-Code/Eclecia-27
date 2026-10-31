import mongoose, { model, Schema } from "mongoose";
import { models } from "mongoose";

export interface IAtlasCategory {
  /** Slug id, e.g. "kalakriti" — must be unique. */
  id: string;
  name: string;
  kind: string;
  line: string;
  /** Cloudinary URL for the category artwork. Empty string until populated. */
  image: string;
}

export interface IAtlasCategoryDocument extends Omit<IAtlasCategory, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  /** Slug identifier stored as a dedicated field (not Mongoose's virtual id). */
  id: string;
}

const atlasCategorySchema = new Schema<IAtlasCategoryDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    kind: {
      type: String,
      required: true,
      trim: true,
    },
    line: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const AtlasCategory =
  models.AtlasCategory ??
  model<IAtlasCategoryDocument>("AtlasCategory", atlasCategorySchema);

export default AtlasCategory;
