import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProfileProvider } from "./contexts/ProfileContext";
import Home from "./pages/Home";
import History from "./pages/History";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path={"//"} component={Home} />
      <Route path={"/history"} component={History} />
      <Route path={"/about"} component={About} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
        <ProfileProvider>
            <Router />
        </ProfileProvider>
    </ErrorBoundary>
  );
}

export default App;
