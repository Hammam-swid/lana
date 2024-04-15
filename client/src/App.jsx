import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  defer,
  redirect,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainLayout from "./pages/MainLayout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import SettingsLayout from "./pages/SettingsLayout";
import store from "./store";
import axios from "axios";
import ProfileSettings from "./pages/ProfileSettings";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DeactivateAccountPage from "./pages/DeactivateAccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { jwtDecode } from "jwt-decode";
import { setLogout } from "./store/authSlice";
import ErrorPage from "./pages/ErrorPage";
function App() {
  const routes = createRoutesFromElements(
    <>
      <Route
        path="/login"
        element={<LoginPage />}
        loader={() => {
          const state = store.getState();
          if (state.token && state.user) return redirect("/");
          return null;
        }}
      />
      <Route
        path="/signup"
        element={<SignupPage />}
        loader={() => {
          const state = store.getState();
          if (state.token && state.user) return redirect("/");
          return null;
        }}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
        loader={() => {
          const state = store.getState();
          if (state.token && state.user) return redirect("/");
          return null;
        }}
      />
      <Route
        path="/reset-password/:resetToken"
        element={<ResetPasswordPage />}
        loader={async ({ params }) => {
          const state = store.getState();
          if (state.token && state.user) return redirect("/");
          try {
            const res = await axios({
              method: "GET",
              url: `/api/v1/users/tokenExist/${params.resetToken}`,
            });
            if (res.data.status === "success") return null;
          } catch (error) {
            if (error.response.status === 404) {
              return redirect("/forgot-password");
            }
          }
          return null;
        }}
      />
      <Route
        path="/"
        element={<MainLayout />}
        loader={() => {
          const state = store.getState();
          if (!state.token || !state.user) return redirect("/login");
          const decodedToken = jwtDecode(state.token);
          if (Date.now() > decodedToken.exp * 1000) {
            store.dispatch(setLogout());
            return redirect("/login");
          }
          return null;
        }}
      >
        <Route
          index
          element={<HomePage />}
          errorElement={<h1>حدث خطأ في تحميل الصفحة</h1>}
          loader={() => {
            const token = store.getState().token;
            const getPosts = async () => {
              try {
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "GET",
                  url: "/api/v1/posts",
                });
                console.log(res);
                if (res.data.status === "success") {
                  return res.data.posts;
                }
              } catch (err) {
                console.log(err.message);
              }
            };
            const getFollowing = async () => {
              try {
                const res = await axios({
                  method: "GET",
                  url: `/api/v1/users/followingUsers`,
                  headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res);
                if (res.data.status === "success") {
                  return res.data.followingUsers;
                }
              } catch (error) {
                console.log(error);
              }
            };
            return defer({ posts: getPosts(), followingUsers: getFollowing() });
          }}
        />
        <Route path="trending" element={<h1>صفحة المحتوى الرائج</h1>} />
        <Route
          path="profile/:username"
          element={<ProfilePage />}
          errorElement={<ErrorPage />}
          loader={({ params }) => {
            const state = store.getState();
            const getUser = async () => {
              const res = await axios({
                url: `/api/v1/users/${params.username}`,
                method: "GET",
                headers: { Authorization: `Bearer ${state.token}` },
              });
              return res.data;
            };
            return defer({ data: getUser() });
          }}
        />
        <Route
          path="post/:postId"
          element={<PostPage />}
          loader={({ params }) => {
            const getPost = async () => {
              try {
                const res = await axios({
                  method: "GET",
                  url: `/api/v1/posts/${params.postId}`,
                });
                if (res.data.status === "success") return res.data.post;
              } catch (error) {
                return error;
              }
            };
            return defer({ post: getPost() });
          }}
        />
        <Route
          path="settings/:username"
          loader={({ params }) => {
            const user = store.getState().user;
            if (user?.username !== params?.username) {
              throw "لا يمكنك الوصول إلى هذه الصفحة";
            }
            return null;
          }}
          element={<SettingsLayout />}
          errorElement={<h1>حدث خطأ في تحميل الصفحة</h1>}
        >
          <Route index element={<ProfileSettings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
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
