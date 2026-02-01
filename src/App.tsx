import { useEffect, useState } from 'react';
import { isPlatform } from '@ionic/react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonLoading,
  IonMenuButton,
  IonHeader,
  IonToolbar,
  IonButtons,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { homeSharp, person, searchOutline, compassOutline } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { AuthProvider, useAuth } from './contexts/authContext';
import SlideMenu from './components/SlideMenu';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccount';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import PasswordResetPage from './pages/PasswordReset';
import RestaurantPage from './pages/RestaurantPage';
import EditProfilePage from './pages/EditProfilePage';
import PersonalizedMenuPage from './pages/PersonalizedMenu';
import CreateMenuPage from './pages/CreateMenuPage';
import SearchPage from './pages/SearchPage';
import SavedMenuPage from './pages/SavedMenuPage';
import CreatedMenuPage from './pages/CreatedMenuPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AddDishesPage from './pages/AddDishesPage';
import AllRestaurantsPage from './pages/AllRestaurantsPage';
import LandingPage from './pages/LandingPage';

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './styles/App.css';
import './styles/UserProfile.css';
import './styles/HomePage.css';
import './styles/PersonalizedMenu.css';
import './styles/RestaurantPage.css';
import './styles/CreatedMenu.css';
import './styles/SlideMenu.css';
import './styles/LandingPage.css';

setupIonicReact();

const PUBLIC_PATHS = ['/', '/login', '/create-account', '/password-reset'];

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isPlatform('hybrid') && window.location.pathname === '/') {
      history.replace('/login');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);

      if (user) {
        const authPaths = ['/login', '/create-account'];
        if (authPaths.includes(location.pathname)) {
          history.push('/home');
        }
      } else {
        const currentPath = window.location.pathname;
        if (!PUBLIC_PATHS.includes(currentPath)) {
          sessionStorage.setItem('redirectPath', currentPath);
          history.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [history, location.pathname]);

  if (isLoading) {
    return <IonLoading isOpen={isLoading} message="Loading..." />;
  }

  if (!currentUser) {
    return (
      <IonRouterOutlet id="main-content">
        <Switch>
          <Route path="/login" component={LoginPage} exact />
          <Route path="/create-account" component={CreateAccountPage} exact />
          <Route path="/password-reset" component={PasswordResetPage} exact />
          <Route path="/" component={LandingPage} exact />
        </Switch>
      </IonRouterOutlet>
    );
  }

  return (
    <>
      <SlideMenu />
      <IonHeader>
        <IonToolbar className="app-header-toolbar">
          <IonButtons slot="start">
            <IonMenuButton className="app-header-menu-button" />
          </IonButtons>
          <div className="app-header-content">
            <img
              src="/assets/WeEat_logo_transparent.webp"
              alt="WeEat Logo"
              className="app-logo"
            />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonTabs>
        <IonRouterOutlet id="main-content">
          <Switch>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route exact path="/login">
              <Redirect to="/home" />
            </Route>
            <Route path="/create-account">
              <Redirect to="/home" />
            </Route>
            <Route path="/password-reset" component={PasswordResetPage} exact />

            <PrivateRoute path="/home" component={HomePage} exact />
            <PrivateRoute path="/personalized-menu" component={PersonalizedMenuPage} exact />
            <PrivateRoute path="/create-menu" component={CreateMenuPage} exact />
            <PrivateRoute path="/add-dishes/:menuId" component={AddDishesPage} exact />
            <PrivateRoute path="/restaurants/:restaurantId/full" component={RestaurantPage} exact />
            <PrivateRoute path="/saved-menus/:savedMenuDocId" component={SavedMenuPage} exact />
            <PrivateRoute path="/created-menus/:menuDocId" component={CreatedMenuPage} exact />
            <PrivateRoute path="/search" component={SearchPage} exact />
            <PrivateRoute path="/all-restaurants" component={AllRestaurantsPage} exact />
            <PrivateRoute path="/restaurant/:restaurantName/create" component={CreateMenuPage} />
            <PrivateRoute path="/edit-profile" component={EditProfilePage} exact />
            <PrivateRoute path="/recommendations" component={RecommendationsPage} exact />

            <PrivateRoute path="/profile">
              <ErrorBoundary>
                <UserProfilePage />
              </ErrorBoundary>
            </PrivateRoute>
          </Switch>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeSharp} />
            <IonLabel className="tab-bar-label">Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="search" href="/search">
            <IonIcon icon={searchOutline} />
            <IonLabel className="tab-bar-label">Search</IonLabel>
          </IonTabButton>

          <IonTabButton tab="recommendations" href="/recommendations">
            <IonIcon aria-hidden="true" icon={compassOutline} />
            <IonLabel className="tab-bar-label">Explore</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel className="tab-bar-label">Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <AppContent />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
