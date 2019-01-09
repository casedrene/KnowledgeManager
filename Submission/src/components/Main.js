import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Login from './Login'
import Home from './Header'
import Translate from './Translate'
import Teanscribe from './Transcribe'
import Tts from './Tts'
import TextDetection from './TextDetection'

const Main = () => (
  <main>
    <Switch>
      <Route path='/login' component={Login}/>
      <Route exact path='/' component={Home}/>
      <Route path='/translate' component={Translate}/>
      <Route path='/transcribe' component={Teanscribe}/>
      <Route path='/text-to-speach' component={Tts}/>
      <Route path='/text-detection' component={TextDetection}/>

    </Switch>
  </main>
)

export default Main