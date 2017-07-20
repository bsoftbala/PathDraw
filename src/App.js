import React from 'react';

import Toolbar from './components/Toolbar';
import SVGRoot from './components/SVGRoot';
import Properties from './components/Modals/Properties';
import AllDraws from './components/Modals/AllDraws';
import Editor from './components/Modals/Editor';
import Source from './components/Modals/Source';
import Guide from './components/Modals/Guide';

const App = () => (
  <div className="pathMathWrapper">
    
      <Toolbar />
      <SVGRoot />
      <Properties />
      <AllDraws />
      <Editor />
      <Source />
      <Guide />
    
  </div>
);

export default App;
