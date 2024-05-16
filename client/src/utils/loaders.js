import { defer, redirect } from "react-router-dom";
import store from "../store";
import axios from "axios";
import { setLogout } from "../store/authSlice";
import translate from "translate";

export const loginLoader = () => {
  const state = store.getState();
  if (state.token && state.user) return redirect("/");
  return null;
};

export const resetPasswordLoader = async ({ params }) => {
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
};

export const mainLayoutLoader = () => {
  const state = store.getState();
  if (!state.token || !state.user) return redirect("/login");
  const isActive = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "/api/v1/users/isActive",
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (res.status === 200) return null;
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        store.dispatch(setLogout());
        return redirect("/login");
      } else return;
    }
  };
  return isActive();
};

export const homePageLoader = () => {
  const token = store.getState().token;
  const getPosts = async () => {
    try {
      const res = await axios({
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
        url: "/api/v1/posts",
      });
      console.log(res.data);
      if (res.data.status === "success") {
        return res.data.posts;
      }
    } catch (err) {
      console.log(err);
      return null;
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
};

export const dashboardLoader = () => {
  const { token, user } = store.getState();
  if (!token || !user) return redirect("/login");
  return axios({
    method: "GET",
    url: "/api/v1/users/isModerator",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(() => null)
    .catch(() => redirect("/"));
};

export const reportsPageLoader = () => {
  const { token } = store.getState();
  const getReports = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "/api/v1/reports",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      if (res.status === 200) return res.data.reports;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  return defer({ reports: getReports() });
};

export const verifyingRequestsLoader = () => {
  const getRequests = async () => {
    try {
      const { token } = store.getState();
      console.log(`this token in line 122 ${token}`);
      const res = await axios({
        method: "GET",
        url: "/api/v1/verifyingRequests",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      if (res.status === 200) return res.data.verifyingRequests;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  console.log("error");
  return defer({ verifyingRequests: getRequests() });
};

export const usersPageLoader = () => {
  const getUsers = async () => {
    try {
      const { token } = store.getState();
      const res = await axios({
        method: "GET",
        url: `/api/v1/users`,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) return res.data.users;
      else return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  return defer({ users: getUsers() });
};

export const moderatorsPageLoader = () => {
  const getModerators = async () => {
    try {
      const { token } = store.getState();
      const res = await axios({
        method: "GET",
        url: "/api/v1/users/moderators",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      return res.data.moderators;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  return defer({ moderators: getModerators() });
};

export const searchPageLoader = ({ request }) => {
  const getSearchResult = async () => {
    console.log(true);
    try {
      const values = {};
      values.search = new URL(request.url).searchParams.get("search");
      const token = store.getState().token;
      if (/[أ-ي]/gi.test(values.search)) {
        values.arSearch = await translate(values.search, {
          from: "ar",
          to: "en",
        });
      }
      const res = await axios({
        method: "POST",
        url: "/api/v1/search",
        headers: { Authorization: `Bearer ${token}` },
        data: values,
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  return defer({ data: getSearchResult() });
};

export const notificationsPageLoader = () => {
  const getNotifications = async () => {
    try {
      const token = store.getState().token;
      const res = await axios({
        method: "GET",
        url: "/api/v1/notifications",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.notifications;
    } catch (error) {
      console.log(error);
    }
  };
  return defer({ notifications: getNotifications() });
};

export const profilePageLoader = ({ params }) => {
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
};

export const postPageLoader = ({ params }) => {
  const getPost = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: `/api/v1/posts/${params.postId}`,
      });
      if (res.data.status === "success") return res.data.post;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  return defer({ post: getPost() });
};

export const settingsLayoutLoader = ({ params }) => {
  const user = store.getState().user;
  if (user?.username !== params?.username) {
    throw "لا يمكنك الوصول إلى هذه الصفحة";
  }
  return null;
};

export const blockedUsersLoader = () => {
  const getBlockedUsers = async () => {
    try {
      const token = store.getState().token;
      const res = await axios({
        method: "GET",
        url: "/api/v1/users/blockedUsers",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) return res.data.blockedUsers;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  return defer({ blockedUsers: getBlockedUsers() });
};
