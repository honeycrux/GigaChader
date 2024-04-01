import React from 'react'

const profile = ({ params }: { params: { username: string } }) => {
  let profileUsername = params.username;
  if (!profileUsername) {
    profileUsername = "self";
  }
  return (
    <div>profile of {profileUsername}</div>
  )
}

export default profile