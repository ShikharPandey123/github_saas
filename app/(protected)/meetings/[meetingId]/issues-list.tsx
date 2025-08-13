import useMeetingById from "@/app/hooks/use-meeting-by-id";

export default function IssuesList({ meetingId }: { meetingId: string }) {
  const { data: meeting, isLoading } = useMeetingById(meetingId);

  if (isLoading) return <div>Loading...</div>;
  if (!meeting) return <div>No meeting found</div>;

  return (
    <div>
      {meeting.issues.map(issue => (
        <div key={issue.id}>{issue.headline}</div>
      ))}
    </div>
  );
}
