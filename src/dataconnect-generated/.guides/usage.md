# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createAppointment, listAvailableSlots, updateAppointmentStatus, cancelAppointment } from '@dataconnect/generated';


// Operation CreateAppointment:  For variables, look at type CreateAppointmentVars in ../index.d.ts
const { data } = await CreateAppointment(dataConnect, createAppointmentVars);

// Operation ListAvailableSlots:  For variables, look at type ListAvailableSlotsVars in ../index.d.ts
const { data } = await ListAvailableSlots(dataConnect, listAvailableSlotsVars);

// Operation UpdateAppointmentStatus:  For variables, look at type UpdateAppointmentStatusVars in ../index.d.ts
const { data } = await UpdateAppointmentStatus(dataConnect, updateAppointmentStatusVars);

// Operation CancelAppointment:  For variables, look at type CancelAppointmentVars in ../index.d.ts
const { data } = await CancelAppointment(dataConnect, cancelAppointmentVars);


```