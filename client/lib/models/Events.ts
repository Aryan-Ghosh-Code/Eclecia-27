import { IEvent } from "@/types/interface";
import mongoose, { model, Schema } from "mongoose";
import { models } from "mongoose";

export interface IEventDocument extends IEvent, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

export const EVENT_CATEGORIES = [
  "Celeste",
  "Taal Tarang",
  "Anubhuti",
  "BakyaRongo",
  "Aetheria",
  "Cadence",
  "Brahmand",
] as const;

const eventSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    eventName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    category: {
      type: String,
      enum: EVENT_CATEGORIES,
      required: true,
    },
    kind: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    banner: {
      type: String,
      default: "",
    },
    rules: {
      type: [String],
      default: [],
    },
    clubs: {
      type: [String],
      default: [],
    },
    isTeamEvent: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    doc: {
      type: String,
    },
    pocs: [
      {
        name: {
          type: String,
          required: true,
        },
        mobile: {
          type: String,
          required: true,
        },
      },
    ],
    maxMembersPerTeam: {
      type: Number,
      required: true,
    },
    minMembersPerTeam: {
      type: Number,
      required: true,
    },
    teamLimit: {
      type: Number,
    },
    isPaidEvent: {
      type: Boolean,
      required: true,
    },
    isFoodProvided: {
      type: Boolean,
      required: true,
      default: false,
    },
    maxFoodServingsPerParticipant: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    fees: {
      type: Number,
      default: 0,
    },
    prizePool: {
      type: String,
      default: "TBD",
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
    ],
  },
  { timestamps: true },
);

const Event = models.Event ?? model<IEventDocument>("Event", eventSchema);

export default Event;
