'use client';

import type { ReactElement } from 'react';
import type { FlowMode } from '@/lib/api/studio-flow';
import { StudioFlow } from './flow/studio-flow';
import { LessonEditor } from './lesson-editor';
import { StudioBoard } from './studio-board';
import { StudioGate } from './studio-gate';

export function StudioBoardPage(): ReactElement {
  return <StudioGate>{(me) => <StudioBoard isAdmin={me.is_admin} />}</StudioGate>;
}

export function StudioLessonPage({ id }: { id: number }): ReactElement {
  return <StudioGate>{() => <LessonEditor id={id} />}</StudioGate>;
}

function modeFromUrl(): FlowMode {
  return new URLSearchParams(window.location.search).get('mode') === 'review' ? 'review' : 'voice';
}

export function StudioFlowPage(): ReactElement {
  return <StudioGate>{() => <StudioFlow initialMode={modeFromUrl()} />}</StudioGate>;
}
