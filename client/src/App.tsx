import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ListProvider } from "./contexts/ListContext";
import DeviceCheck from "./components/DeviceCheck";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import CreateListPage from "./pages/CreateListPage";
import ListDetailPage from "./pages/ListDetailPage";
import { useServiceWorker } from "./hooks/useServiceWorker";


function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/main">
        <ProtectedRoute>
          <MainPage />
        </ProtectedRoute>
      </Route>
      <Route path="/create-list">
        <ProtectedRoute>
          <CreateListPage />
        </ProtectedRoute>
      </Route>
      <Route path="/list-detail">
        <ProtectedRoute>
          <ListDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useServiceWorker();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <ListProvider>
            <DeviceCheck>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </DeviceCheck>
          </ListProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
