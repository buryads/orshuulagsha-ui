import { apiCall } from './client';

export interface VolunteerApplicationInput {
  name: string;
  telegram: string;
  help_types: string[];
  about?: string;
  locale: string;
  website: string;
}

export async function submitVolunteerApplication(
  input: VolunteerApplicationInput,
): Promise<void> {
  await apiCall('POST', '/api/volunteer-applications', { data: input });
}
