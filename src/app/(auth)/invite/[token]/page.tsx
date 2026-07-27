import InviteForm from '@/components/InviteForm';

export function generateStaticParams() {
  return [{ token: 'default' }];
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteForm token={token} />;
}
