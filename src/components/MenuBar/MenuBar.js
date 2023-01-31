import React from 'react'
import NavigationBar from '../NavigationBar/NavigationBar'
import { ManagePage, MappingPage, SetupPage } from '..'
import ConnectPage from '../ConnectPage/ConnectPage'

const MenuBar = () => {
  const navConfig = [
    {
      key: 'manager',
      label: 'Manage mappings',
      path: '/',
      selected: true,
      component: <ManagePage />,
    },
    {
      key: 'create',
      label: 'Create new mapping',
      path: '/create',
      component: <SetupPage />,
    },
    {
      key: 'edit',
      label: 'Edit mapping',
      path: '/edit',
      component: <MappingPage />,
    },
    {
      key: 'connect',
      label: 'Connect to AP',
      path: '/connect',
      component: <ConnectPage />,
    },
  ]
  return <NavigationBar config={navConfig} title="Data set alignment" />
}

export default MenuBar
