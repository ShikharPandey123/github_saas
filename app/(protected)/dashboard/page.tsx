"use client"
import { useUser } from '@clerk/nextjs';
import React from 'react'

const DashboardPage = () => {
  const {user} = useUser();
  return (
    <div>
      <h1>Welcome to your dashboard, {user?.firstName}!</h1>
      {/* <p>Your email address is: {user?.emailAddress}</p> */}
    </div>
  )
}

export default DashboardPage
