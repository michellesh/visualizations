import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import styled from 'styled-components';

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

const Home = () => <div>hi!</div>;
const About = () => <div>about</div>;
const Projects = () => <div>projects</div>;

export default App;
