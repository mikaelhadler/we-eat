import { Route, Redirect, RouteProps } from 'react-router-dom';
import { auth } from '../firebaseConfig';

interface PrivateRouteProps extends Omit<RouteProps, 'component'> {
  component?: React.ComponentType<RouteProps>;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  children,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (!auth.currentUser) {
        return <Redirect to="/login" />;
      }

      if (Component) {
        return <Component {...props} />;
      }

      return children;
    }}
  />
);

export default PrivateRoute;
