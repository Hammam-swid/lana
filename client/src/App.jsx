import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainLayout from "./pages/MainLayout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import SettingsLayout from "./pages/SettingsLayout";
import ProfileSettings from "./pages/ProfileSettings";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DeactivateAccountPage from "./pages/DeactivateAccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ErrorPage from "./pages/ErrorPage";
import BlockedUsers from "./pages/BlockedUsers";
import NotificationsPage from "./pages/NotificationsPage";
import SearchPage from "./pages/SearchPage";
import DashboardLayout from "./pages/DashboardLayout";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import {
  blockedUsersLoader,
  dashboardLoader,
  homePageLoader,
  loginLoader,
  mainLayoutLoader,
  moderatorsPageLoader,
  notificationsPageLoader,
  postPageLoader,
  profilePageLoader,
  reportsPageLoader,
  resetPasswordLoader,
  searchPageLoader,
  settingsLayoutLoader,
  usersPageLoader,
} from "./utils/loaders";
import ModeratorsPage from "./pages/ModeratorsPage";
function App() {
  const routes = createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} loader={loginLoader} />
      <Route path="/signup" element={<SignupPage />} loader={loginLoader} />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
        loader={loginLoader}
      />
      <Route
        path="/reset-password/:resetToken"
        element={<ResetPasswordPage />}
        loader={resetPasswordLoader}
      />
      <Route
        path="/"
        element={<MainLayout />}
        errorElement={
          <button onClick={() => window.location.reload()}>تحديث</button>
        }
        loader={mainLayoutLoader}
      >
        <Route
          index
          element={<HomePage />}
          errorElement={<h1>حدث خطأ في تحميل الصفحة</h1>}
          loader={homePageLoader}
        />
        <Route
          path="dashboard"
          element={<DashboardLayout />}
          loader={dashboardLoader}
        >
          <Route index element={<ReportsPage />} loader={reportsPageLoader} />
          <Route
            path="users"
            element={<UsersPage />}
            loader={usersPageLoader}
          />
          <Route
            path="moderators"
            element={<ModeratorsPage />}
            loader={moderatorsPageLoader}
          />
        </Route>
        <Route path="trending" element={<h1>صفحة المحتوى الرائج</h1>} />
        <Route
          path="search"
          element={<SearchPage />}
          loader={searchPageLoader}
        />
        <Route
          path="notifications"
          element={<NotificationsPage />}
          loader={notificationsPageLoader}
        />
        <Route
          path="profile/:username"
          element={<ProfilePage />}
          errorElement={<ErrorPage />}
          loader={profilePageLoader}
        />
        <Route
          path="post/:postId"
          element={<PostPage />}
          loader={postPageLoader}
        />
        <Route
          path="settings/:username"
          loader={settingsLayoutLoader}
          element={<SettingsLayout />}
          errorElement={<h1>حدث خطأ في تحميل الصفحة</h1>}
        >
          <Route index element={<ProfileSettings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route
            path="blocked-users"
            element={<BlockedUsers />}
            loader={blockedUsersLoader}
          />
          <Route
            path="deactivate-account"
            element={<DeactivateAccountPage />}
          />
        </Route>
        <Route path="*" element={<h1>هذه الصفحة غير موجودة</h1>} />
      </Route>
    </>
  );
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
