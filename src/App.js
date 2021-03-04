import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import styled from 'styled-components';

import Home from './Home';
import Network from './Network';
import Dance from './Dance';
import DanceDance from './DanceDance';

const About = () => <div>about</div>;

const Container = styled.div`
  text-align: center;
`;

const App = () => (
  <Container>
    <Router>
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/dance">
          <Dance />
        </Route>
        <Route path="/dancedance">
          <DanceDance />
        </Route>
        <Route path="/network">
          <Network />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  </Container>
);

export default App;
