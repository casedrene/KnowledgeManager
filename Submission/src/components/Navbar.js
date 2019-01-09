import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => (
    <nav className="navbar navbar-default navbar-fixed-top navbar-custom">
        <div className="container">
            <ul className="nav navbar-nav pull-left">
                <li className="hidden-xs "><Link to='/'>Home</Link></li>
                <li className="hidden-xs"><Link to='/transcribe'>Transcribe</Link></li>
                <li className="hidden-xs"><Link to='/translate'>Translate</Link></li>
                <li className="hidden-xs"><Link to='/text-to-speach'>Text-to-Speach</Link></li>
                <li className="hidden-xs"><Link to='/text-detection'>Text Detection</Link></li>
            </ul>
            <ul className="nav navbar-nav pull-right">
                <li>
                    <a target="_blank" rel="noopener noreferrer" href="https://au.linkedin.com/in/nikolak/" className="btn-social btn-outline-nav"><i className="fa fa-fw fa-linkedin"></i></a>
                </li>
                <li>
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/casedrene" className="btn-social btn-outline-nav"><i className="fa fa-fw fa-github"></i></a>
                </li>
            </ul>
        </div>
    </nav>
)

export default Navbar     