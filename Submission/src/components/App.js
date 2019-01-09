import React from 'react'

import Main from './Main'
import Navbar from './Navbar'

class App extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        <Main />
      </div>
    )
  }
}

export default App
