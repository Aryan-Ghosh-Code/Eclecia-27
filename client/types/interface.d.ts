import mongoose, { Types } from "mongoose";

export type EventCategory =
  | "Celeste"
  | "Taal Tarang"
  | "Anubhuti"
  | "BakyaRongo"
  | "Aetheria"
  | "Cadence"
  | "Brahmand";

export interface IAtlasCategory {
  /** Slug id, e.g. "kalakriti". */
  id: string;
  name: string;
  kind: string;
  line: string;
  /** Cloudinary URL for the category artwork. */
  image: string;
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  /** Free-form for now; nothing enforces or reads roles yet. */
  roles: string[];
  passwordHash?: string;
  image?: string;
  avatar?: number;
  provider: "google" | "credentials";
  emailVerified?: Date;
  verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName?: string;
  phoneNumber?: string;
  college?: string;
  stream?: string;
  isProfileComplete: boolean;
}

export interface IPoc {
  name: string;
  mobile: string;
}

export interface IEvent {
  /** Atlas id (e.g. "short-film"); ties the record to its artwork. */
  slug: string;
  eventName: string;
  category: EventCategory;
  /** Short genre label shown in the atlas (e.g. "Filmmaking"). */
  kind?: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  description: string;
  banner?: string | null;
  rules: string[];
  clubs: string[];
  isTeamEvent: boolean;
  isActive: boolean;
  doc?: string;
  pocs: IPoc[];
  maxMembersPerTeam: number;
  minMembersPerTeam: number;
  teamLimit?: number;
  prizePool: string;
  isPaidEvent: boolean;
  isFoodProvided: boolean;
  maxFoodServingsPerParticipant: number;
  fees: number;
  registrations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicEventProps {
  _id: string;
  slug: string;
  eventName: string;
  category: EventCategory;
  kind?: string;
  description: string;
  banner?: string | null;
  clubs: string[];
  date: string;
  time: string;
  venue: string;
  isTeamEvent: boolean;
  minMembersPerTeam: number;
  maxMembersPerTeam: number;
  prizePool: string;
  isActive: boolean;
}
