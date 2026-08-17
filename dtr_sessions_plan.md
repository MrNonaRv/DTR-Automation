1. Interface `DTRSession`
```ts
interface DTRSession {
  id: string;
  name: string; // e.g., "August 2026 - No Biometric"
  updatedAt: any;
  data: EmployeeAttendance[];
}
```
2. Add "Save Progress to Cloud" button in the editor toolbar.
3. Add a "Load Recent Progress" section on the home screen that lists documents from `dtr_sessions` collection.
