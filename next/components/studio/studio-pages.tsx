'use client';

import type { ReactElement } from 'react';
import type { FlowMode } from '@/lib/api/studio-flow';
import { useTranslations } from 'next-intl';
import { EventEditor } from './events/event-editor';
import { EventsList } from './events/events-list';
import { GreetingsAdmin } from './events/greetings-admin';
import { StudioFlow } from './flow/studio-flow';
import { LessonEditor } from './lesson-editor';
import { ReminderButton } from './reminder-button';
import { StudioBoard } from './studio-board';
import { StudioGate } from './studio-gate';

export function StudioBoardPage(): ReactElement {
  return <StudioGate>{(me) => <StudioBoard isAdmin={me.is_admin} />}</StudioGate>;
}

export function StudioLessonPage({ id }: { id: number }): ReactElement {
  return <StudioGate>{() => <LessonEditor id={id} />}</StudioGate>;
}

function modeFromUrl(): FlowMode {
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'review' || mode === 'words' ? mode : 'voice';
}

export function StudioFlowPage(): ReactElement {
  return (
    <StudioGate>
      {() => <StudioFlow initialMode={modeFromUrl()} reminderSlot={<ReminderButton />} />}
    </StudioGate>
  );
}

function AdminGate({ children }: { children: ReactElement }): ReactElement {
  const t = useTranslations('studioEvents.common');
  return (
    <StudioGate>
      {(me) =>
        me.is_admin ? (
          children
        ) : (
          <div className="container" style={{ paddingTop: 48 }} data-testid="studio-admin-only">
            <div
              className="card"
              style={{ padding: 24, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
            >
              {t('adminOnly')}
            </div>
          </div>
        )
      }
    </StudioGate>
  );
}

export function StudioEventsPage(): ReactElement {
  return (
    <AdminGate>
      <EventsList />
    </AdminGate>
  );
}

export function StudioEventPage({ id }: { id: number }): ReactElement {
  return (
    <AdminGate>
      <EventEditor id={id} />
    </AdminGate>
  );
}

export function StudioGreetingsPage(): ReactElement {
  return (
    <AdminGate>
      <GreetingsAdmin />
    </AdminGate>
  );
}
