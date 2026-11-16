'use client';

import type { ReactElement } from 'react';
import { LessonEditor } from './lesson-editor';
import { StudioBoard } from './studio-board';
import { StudioGate } from './studio-gate';

export function StudioBoardPage(): ReactElement {
  return <StudioGate>{(me) => <StudioBoard isAdmin={me.is_admin} />}</StudioGate>;
}

export function StudioLessonPage({ id }: { id: number }): ReactElement {
  return <StudioGate>{() => <LessonEditor id={id} />}</StudioGate>;
}
