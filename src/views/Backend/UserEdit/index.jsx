import React from 'react'
import { useLocation } from 'react-router-dom'
import Useradd from '../UserAdd'

export default function UserEdit() {
  const location = useLocation()
  const state = location.state

  return (
    <Useradd state={state} />
  )
}
