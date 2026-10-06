import { useSheet } from '@/ui/hooks';
import { QuickLogSheet } from '../sheets/QuickLogSheet';
import { ReadingSheet } from '../sheets/ReadingSheet';
import { IssueSheet } from '../sheets/IssueSheet';
import { AccountSheet } from '../sheets/AccountSheet';
import { SwitchSheet } from '../sheets/SwitchSheet';
import { WorkshopSheet } from '../sheets/WorkshopSheet';
import { EditVehicleSheet } from '../sheets/EditVehicleSheet';
import { DeleteVehicleSheet } from '../sheets/DeleteVehicleSheet';
import { DocumentSheet } from '../sheets/DocumentSheet';
import { ServiceSheet } from '../sheets/ServiceSheet';
import { RecordSheet } from '../sheets/RecordSheet';
import { IntervalSheet } from '../sheets/IntervalSheet';
import { ReminderSheet } from '../sheets/ReminderSheet';

/** Renders whichever sheet the URL asks for. Unmounted means closed. */
export function SheetHost() {
  const { name } = useSheet();
  switch (name) {
    case 'log':
      return <QuickLogSheet />;
    case 'reading':
      return <ReadingSheet />;
    case 'issue':
      return <IssueSheet />;
    case 'account':
      return <AccountSheet />;
    case 'switch':
      return <SwitchSheet />;
    case 'workshop':
      return <WorkshopSheet />;
    case 'edit-vehicle':
      return <EditVehicleSheet />;
    case 'delete-vehicle':
      return <DeleteVehicleSheet />;
    case 'document':
      return <DocumentSheet />;
    case 'document-edit':
      return <DocumentSheet editing />;
    case 'service':
      return <ServiceSheet />;
    case 'service-edit':
      return <ServiceSheet editing />;
    case 'record':
      return <RecordSheet />;
    case 'interval':
      return <IntervalSheet />;
    case 'reminders':
      return <ReminderSheet />;
    default:
      return null;
  }
}
