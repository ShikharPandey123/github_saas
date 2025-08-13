import React from 'react'

type Props ={
    params: Promise<{ meetingId: string }>
}

const  MeetingDetailsPage = async({ params }: Props) => {
  const { meetingId } = await params;
  return (
    <div>
      {meetingId}
    </div>
  )
}

export default  MeetingDetailsPage
