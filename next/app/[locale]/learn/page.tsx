import { redirect } from '@/i18n/navigation';

interface LearnPageProps {
  params: { locale: string };
}

export default function LearnPage({ params }: LearnPageProps): never {
  return redirect({ href: '/learn/path', locale: params.locale });
}
