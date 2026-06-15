import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Availability_Key {
  id: UUIDString;
  __typename?: 'Availability_Key';
}

export interface CancelAppointmentData {
  appointment_delete?: Appointment_Key | null;
}

export interface CancelAppointmentVariables {
  id: UUIDString;
}

export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentVariables {
  startTime: TimestampString;
  endTime: TimestampString;
  salonId: UUIDString;
  clientId: UUIDString;
  staffId: UUIDString;
  serviceId: UUIDString;
}

export interface ListAvailableSlotsData {
  availabilities: ({
    startTime: TimestampString;
    endTime: TimestampString;
  })[];
}

export interface ListAvailableSlotsVariables {
  staffId: UUIDString;
  startTime: TimestampString;
}

export interface Salon_Key {
  id: UUIDString;
  __typename?: 'Salon_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface UpdateAppointmentStatusData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  operationName: string;
}
export const createAppointmentRef: CreateAppointmentRef;

export function createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;
export function createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface ListAvailableSlotsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAvailableSlotsVariables): QueryRef<ListAvailableSlotsData, ListAvailableSlotsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAvailableSlotsVariables): QueryRef<ListAvailableSlotsData, ListAvailableSlotsVariables>;
  operationName: string;
}
export const listAvailableSlotsRef: ListAvailableSlotsRef;

export function listAvailableSlots(vars: ListAvailableSlotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAvailableSlotsData, ListAvailableSlotsVariables>;
export function listAvailableSlots(dc: DataConnect, vars: ListAvailableSlotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAvailableSlotsData, ListAvailableSlotsVariables>;

interface UpdateAppointmentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
  operationName: string;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;

export function updateAppointmentStatus(vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
export function updateAppointmentStatus(dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface CancelAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelAppointmentVariables): MutationRef<CancelAppointmentData, CancelAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CancelAppointmentVariables): MutationRef<CancelAppointmentData, CancelAppointmentVariables>;
  operationName: string;
}
export const cancelAppointmentRef: CancelAppointmentRef;

export function cancelAppointment(vars: CancelAppointmentVariables): MutationPromise<CancelAppointmentData, CancelAppointmentVariables>;
export function cancelAppointment(dc: DataConnect, vars: CancelAppointmentVariables): MutationPromise<CancelAppointmentData, CancelAppointmentVariables>;

