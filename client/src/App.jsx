import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainLayout from "./pages/MainLayout";
import HomePage from "./pages/HomePage";
import store from "./store";
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
      <Route
        path="/"
        element={<MainLayout />}
        loader={() => {
          const state = store.getState();
          if (!state.token) return redirect("/login");
          return null;
        }}
      >
        <Route index element={<HomePage />} />
        <Route path="*" element={<h1>هذه الصفحة غير موجودة</h1>}/>
      </Route>
    </>
  );
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
