import { Outlet, useLocation } from 'react-router-dom';
import { AppBackground } from '../components/AppBackground';

export function RootLayout() {
  const { pathname } = useLocation();
  const showSubtleBg = pathname !== '/login';

  return (
    <div className="app-root">
      {showSubtleBg ? <AppBackground variant="subtle" /> : null}
      <div className="app-root__content">
        <Outlet />
      </div>
    </div>
  );
}
