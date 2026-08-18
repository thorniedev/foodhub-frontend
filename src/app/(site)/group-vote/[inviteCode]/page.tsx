import SharedVotingPage from "@/components/food-page/location/group/SharedVotingPage";

interface GroupVotePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

export default async function GroupVotePage({ params }: GroupVotePageProps) {
  const { inviteCode } = await params;

  return <SharedVotingPage inviteCode={inviteCode} />;
}
