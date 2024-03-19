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
import store from "./store";
import ProfilePage from "./pages/ProfilePage";
import axios from "axios";
function App() {
  const routes = createRoutesFromElements(
    <>
      <Route
        path="/login"
        element={<LoginPage />}
        loader={() => {
          const state = store.getState();
          if (state.token) return redirect("/");
          return null;
        }}
      />
      <Route
        path="/signup"
        element={<SignupPage />}
        loader={() => {
          const state = store.getState();
          if (state.token) return redirect("/");
          return null;
        }}
      />
      <Route path="/forgot-password" element={<h1>هل نسيت كلمة المرور</h1>} />
      <Route
        path="/reset-password/:resetToken"
        element={<h1>صفحة استعادة كلمة المرور</h1>}
      />
      <Route
        path="/"
        element={<MainLayout />}
        loader={() => {
          const state = store.getState();
          if (!state.token) return redirect("/login");
          return null;
        }}
      >
        <Route
          index
          element={<HomePage />}
          loader={() => {
            const getPosts = async () => {
              const token = store.getState().token;
              try {
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "GET",
                  url: "http://localhost:3000/api/v1/posts",
                });
                if (res.data.status === "success") {
                  return res.data.posts;
                }
              } catch (err) {
                console.log(err.message);
              }
            };
            return defer({ posts: getPosts() });
          }}
        />
        <Route path="trending" element={<h1>صفحة المحتوى الرائج</h1>} />
        <Route
          path="profile/:username"
          element={<ProfilePage />}
          loader={({ params }) => {
            const state = store.getState();
            const getUser = async () => {
              const res = await axios({
                url: `http://localhost:3000/api/v1/users/${params.username}`,
                method: "GET",
                headers: { Authorization: `Bearer ${state.token}` },
              });
              return res.data;
            };
            return defer({ data: getUser() });
          }}
        />
        <Route
          path="profile/:username/settings"
          element={<h1>صفحة إعدادات الملف الشخصي</h1>}
        />
        <Route path="*" element={<h1>هذه الصفحة غير موجودة</h1>} />
      </Route>
    </>
  );
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
