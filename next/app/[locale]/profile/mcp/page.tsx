import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { McpTokens } from '@/components/profile/mcp-tokens';

export const metadata: Metadata = {
  title: 'MCP',
};

interface McpPageProps {
  params: { locale: string };
}

export default function McpPage({ params }: McpPageProps) {
  setRequestLocale(params.locale);
  return <McpTokens />;
}
