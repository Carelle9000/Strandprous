# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAvailableSlots*](#listavailableslots)
- [**Mutations**](#mutations)
  - [*CreateAppointment*](#createappointment)
  - [*UpdateAppointmentStatus*](#updateappointmentstatus)
  - [*CancelAppointment*](#cancelappointment)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAvailableSlots
You can execute the `ListAvailableSlots` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailableSlots(vars: ListAvailableSlotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAvailableSlotsData, ListAvailableSlotsVariables>;

interface ListAvailableSlotsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAvailableSlotsVariables): QueryRef<ListAvailableSlotsData, ListAvailableSlotsVariables>;
}
export const listAvailableSlotsRef: ListAvailableSlotsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailableSlots(dc: DataConnect, vars: ListAvailableSlotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAvailableSlotsData, ListAvailableSlotsVariables>;

interface ListAvailableSlotsRef {
  ...
  (dc: DataConnect, vars: ListAvailableSlotsVariables): QueryRef<ListAvailableSlotsData, ListAvailableSlotsVariables>;
}
export const listAvailableSlotsRef: ListAvailableSlotsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailableSlotsRef:
```typescript
const name = listAvailableSlotsRef.operationName;
console.log(name);
```

### Variables
The `ListAvailableSlots` query requires an argument of type `ListAvailableSlotsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAvailableSlotsVariables {
  staffId: UUIDString;
  startTime: TimestampString;
}
```
### Return Type
Recall that executing the `ListAvailableSlots` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailableSlotsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAvailableSlotsData {
  availabilities: ({
    startTime: TimestampString;
    endTime: TimestampString;
  })[];
}
```
### Using `ListAvailableSlots`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailableSlots, ListAvailableSlotsVariables } from '@dataconnect/generated';

// The `ListAvailableSlots` query requires an argument of type `ListAvailableSlotsVariables`:
const listAvailableSlotsVars: ListAvailableSlotsVariables = {
  staffId: ..., 
  startTime: ..., 
};

// Call the `listAvailableSlots()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailableSlots(listAvailableSlotsVars);
// Variables can be defined inline as well.
const { data } = await listAvailableSlots({ staffId: ..., startTime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailableSlots(dataConnect, listAvailableSlotsVars);

console.log(data.availabilities);

// Or, you can use the `Promise` API.
listAvailableSlots(listAvailableSlotsVars).then((response) => {
  const data = response.data;
  console.log(data.availabilities);
});
```

### Using `ListAvailableSlots`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailableSlotsRef, ListAvailableSlotsVariables } from '@dataconnect/generated';

// The `ListAvailableSlots` query requires an argument of type `ListAvailableSlotsVariables`:
const listAvailableSlotsVars: ListAvailableSlotsVariables = {
  staffId: ..., 
  startTime: ..., 
};

// Call the `listAvailableSlotsRef()` function to get a reference to the query.
const ref = listAvailableSlotsRef(listAvailableSlotsVars);
// Variables can be defined inline as well.
const ref = listAvailableSlotsRef({ staffId: ..., startTime: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailableSlotsRef(dataConnect, listAvailableSlotsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.availabilities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.availabilities);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateAppointment
You can execute the `CreateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAppointmentRef:
```typescript
const name = createAppointmentRef.operationName;
console.log(name);
```

### Variables
The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAppointmentVariables {
  startTime: TimestampString;
  endTime: TimestampString;
  salonId: UUIDString;
  clientId: UUIDString;
  staffId: UUIDString;
  serviceId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}
```
### Using `CreateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAppointment, CreateAppointmentVariables } from '@dataconnect/generated';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  startTime: ..., 
  endTime: ..., 
  salonId: ..., 
  clientId: ..., 
  staffId: ..., 
  serviceId: ..., 
};

// Call the `createAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAppointment(createAppointmentVars);
// Variables can be defined inline as well.
const { data } = await createAppointment({ startTime: ..., endTime: ..., salonId: ..., clientId: ..., staffId: ..., serviceId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointment(dataConnect, createAppointmentVars);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointment(createAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

### Using `CreateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAppointmentRef, CreateAppointmentVariables } from '@dataconnect/generated';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  startTime: ..., 
  endTime: ..., 
  salonId: ..., 
  clientId: ..., 
  staffId: ..., 
  serviceId: ..., 
};

// Call the `createAppointmentRef()` function to get a reference to the mutation.
const ref = createAppointmentRef(createAppointmentVars);
// Variables can be defined inline as well.
const ref = createAppointmentRef({ startTime: ..., endTime: ..., salonId: ..., clientId: ..., staffId: ..., serviceId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentRef(dataConnect, createAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

## UpdateAppointmentStatus
You can execute the `UpdateAppointmentStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateAppointmentStatus(vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface UpdateAppointmentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAppointmentStatus(dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface UpdateAppointmentStatusRef {
  ...
  (dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAppointmentStatusRef:
```typescript
const name = updateAppointmentStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAppointmentStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateAppointmentStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAppointmentStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAppointmentStatusData {
  appointment_update?: Appointment_Key | null;
}
```
### Using `UpdateAppointmentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentStatus, UpdateAppointmentStatusVariables } from '@dataconnect/generated';

// The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`:
const updateAppointmentStatusVars: UpdateAppointmentStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateAppointmentStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAppointmentStatus(updateAppointmentStatusVars);
// Variables can be defined inline as well.
const { data } = await updateAppointmentStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAppointmentStatus(dataConnect, updateAppointmentStatusVars);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
updateAppointmentStatus(updateAppointmentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

### Using `UpdateAppointmentStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentStatusRef, UpdateAppointmentStatusVariables } from '@dataconnect/generated';

// The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`:
const updateAppointmentStatusVars: UpdateAppointmentStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateAppointmentStatusRef()` function to get a reference to the mutation.
const ref = updateAppointmentStatusRef(updateAppointmentStatusVars);
// Variables can be defined inline as well.
const ref = updateAppointmentStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAppointmentStatusRef(dataConnect, updateAppointmentStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

## CancelAppointment
You can execute the `CancelAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cancelAppointment(vars: CancelAppointmentVariables): MutationPromise<CancelAppointmentData, CancelAppointmentVariables>;

interface CancelAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelAppointmentVariables): MutationRef<CancelAppointmentData, CancelAppointmentVariables>;
}
export const cancelAppointmentRef: CancelAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
cancelAppointment(dc: DataConnect, vars: CancelAppointmentVariables): MutationPromise<CancelAppointmentData, CancelAppointmentVariables>;

interface CancelAppointmentRef {
  ...
  (dc: DataConnect, vars: CancelAppointmentVariables): MutationRef<CancelAppointmentData, CancelAppointmentVariables>;
}
export const cancelAppointmentRef: CancelAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cancelAppointmentRef:
```typescript
const name = cancelAppointmentRef.operationName;
console.log(name);
```

### Variables
The `CancelAppointment` mutation requires an argument of type `CancelAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CancelAppointmentVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `CancelAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CancelAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CancelAppointmentData {
  appointment_delete?: Appointment_Key | null;
}
```
### Using `CancelAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cancelAppointment, CancelAppointmentVariables } from '@dataconnect/generated';

// The `CancelAppointment` mutation requires an argument of type `CancelAppointmentVariables`:
const cancelAppointmentVars: CancelAppointmentVariables = {
  id: ..., 
};

// Call the `cancelAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cancelAppointment(cancelAppointmentVars);
// Variables can be defined inline as well.
const { data } = await cancelAppointment({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cancelAppointment(dataConnect, cancelAppointmentVars);

console.log(data.appointment_delete);

// Or, you can use the `Promise` API.
cancelAppointment(cancelAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_delete);
});
```

### Using `CancelAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, cancelAppointmentRef, CancelAppointmentVariables } from '@dataconnect/generated';

// The `CancelAppointment` mutation requires an argument of type `CancelAppointmentVariables`:
const cancelAppointmentVars: CancelAppointmentVariables = {
  id: ..., 
};

// Call the `cancelAppointmentRef()` function to get a reference to the mutation.
const ref = cancelAppointmentRef(cancelAppointmentVars);
// Variables can be defined inline as well.
const ref = cancelAppointmentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cancelAppointmentRef(dataConnect, cancelAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_delete);
});
```

