import React from 'react'
import PropTypes from 'prop-types'
import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory,
  useLocation,
} from 'react-router-dom'
import './NavigationBar.css'

const TopBar = ({ config, title }) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const toHome = () => {
    if (pathname !== '/') {
      history.push('/')
    }
  }

  return (
    <>
      <div className="barContents">
        <h2 id="appTitle" className="barTitle" onClick={toHome}>
          {title}
        </h2>
        {config.map(
          ({ key, label, icon, path, hide }) =>
            !hide && (
              <div
                onClick={() => history.push(path)}
                key={key}
                className={`barItem ${pathname === path ? 'selected' : ''}`}
              >
                {icon}
                {label}
              </div>
            )
        )}
      </div>
    </>
  )
}

const NavigationBar = ({ config, title }) => {
  return (
    <Router>
      <TopBar config={config} title={title} />
      <div className="routeContent">
        <Switch>
          {config.map(({ key, path, component }) => (
            <Route exact key={key} path={path}>
              {component}
            </Route>
          ))}
        </Switch>
      </div>
    </Router>
  )
}

const configProps = PropTypes.arrayOf(
  PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    component: PropTypes.element.isRequired,
    icon: PropTypes.element,
  })
)

TopBar.propTypes = {
  config: configProps,
  title: PropTypes.string,
}

NavigationBar.propTypes = {
  config: configProps,
  title: PropTypes.string,
}

export default NavigationBar
