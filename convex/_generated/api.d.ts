/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_users from "../admin_users.js";
import type * as admissions from "../admissions.js";
import type * as auth_seeds from "../auth_seeds.js";
import type * as auth_sync from "../auth_sync.js";
import type * as beds from "../beds.js";
import type * as billing from "../billing.js";
import type * as case_entries from "../case_entries.js";
import type * as compte_rendus from "../compte_rendus.js";
import type * as dispense_records from "../dispense_records.js";
import type * as doctor_patients from "../doctor_patients.js";
import type * as hospitals from "../hospitals.js";
import type * as http from "../http.js";
import type * as imaging_files from "../imaging_files.js";
import type * as init from "../init.js";
import type * as lab_orders from "../lab_orders.js";
import type * as lab_results from "../lab_results.js";
import type * as mockData from "../mockData.js";
import type * as notifications from "../notifications.js";
import type * as patient_documents from "../patient_documents.js";
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
  admin_users: typeof admin_users;
  admissions: typeof admissions;
  auth_seeds: typeof auth_seeds;
  auth_sync: typeof auth_sync;
  beds: typeof beds;
  billing: typeof billing;
  case_entries: typeof case_entries;
  compte_rendus: typeof compte_rendus;
  dispense_records: typeof dispense_records;
  doctor_patients: typeof doctor_patients;
  hospitals: typeof hospitals;
  http: typeof http;
  imaging_files: typeof imaging_files;
  init: typeof init;
  lab_orders: typeof lab_orders;
  lab_results: typeof lab_results;
  mockData: typeof mockData;
  notifications: typeof notifications;
  patient_documents: typeof patient_documents;
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
