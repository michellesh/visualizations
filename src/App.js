import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import styled from 'styled-components';

import Home from './Home';

const About = () => <div>about</div>;
const Projects = () => <div>projects</div>;

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
        <Route path="/projects">
          <Projects />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  </Container>
);

export default App;
