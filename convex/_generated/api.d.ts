/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminUsers from "../adminUsers.js";
import type * as admissions from "../admissions.js";
import type * as authSeeds from "../authSeeds.js";
import type * as authSync from "../authSync.js";
import type * as beds from "../beds.js";
import type * as billing from "../billing.js";
import type * as caseEntries from "../caseEntries.js";
import type * as compteRendus from "../compteRendus.js";
import type * as dispenseRecords from "../dispenseRecords.js";
import type * as doctorPatients from "../doctorPatients.js";
import type * as hospitals from "../hospitals.js";
import type * as http from "../http.js";
import type * as imagingFiles from "../imagingFiles.js";
import type * as init from "../init.js";
import type * as labOrders from "../labOrders.js";
import type * as labResults from "../labResults.js";
import type * as notifications from "../notifications.js";
import type * as patientDocuments from "../patientDocuments.js";
import type * as patients from "../patients.js";
import type * as prescriptions from "../prescriptions.js";
import type * as security from "../security.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as specialities from "../specialities.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";
import type * as vitals from "../vitals.js";
import type * as wards from "../wards.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminUsers: typeof adminUsers;
  admissions: typeof admissions;
  authSeeds: typeof authSeeds;
  authSync: typeof authSync;
  beds: typeof beds;
  billing: typeof billing;
  caseEntries: typeof caseEntries;
  compteRendus: typeof compteRendus;
  dispenseRecords: typeof dispenseRecords;
  doctorPatients: typeof doctorPatients;
  hospitals: typeof hospitals;
  http: typeof http;
  imagingFiles: typeof imagingFiles;
  init: typeof init;
  labOrders: typeof labOrders;
  labResults: typeof labResults;
  notifications: typeof notifications;
  patientDocuments: typeof patientDocuments;
  patients: typeof patients;
  prescriptions: typeof prescriptions;
  security: typeof security;
  seed: typeof seed;
  sessions: typeof sessions;
  specialities: typeof specialities;
  stats: typeof stats;
  users: typeof users;
  vitals: typeof vitals;
  wards: typeof wards;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
