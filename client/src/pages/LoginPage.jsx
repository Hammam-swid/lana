import { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setLogin } from "../store/authSlice";

function LoginPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState("idle");
  async function login(e) {
    try {
      setFormState("submitting");
      const email = e.email.value;
      const password = e.password.value;
      const body = { email, password };
      console.log(body);
      const data = await axios({
        url: "http://localhost:3000/api/v1/users/login",
        method: "POST",
        data: body,
      });
      console.log(data.data.status);
      if (data.data.status === "success") {
        const { token } = data.data;
        const { user } = data.data.data;
        dispatch(setLogin({ token, user }));
        return nav("/");
      }
      setFormState("idle");
    } catch (error) {
      setFormState("idle");
      console.log(error);
    }
  }
  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50 dark:bg-slate-900">
      <Form
        onSubmit={async (e) => await login(e.target)}
        replace
        className="p-6 flex flex-col w-full max-w-screen-sm mx-auto rounded-md md:border-2 border-green-500 gap-5"
      >
        <h1 className="self-center font-bold text-3xl dark:text-green-100">
          مرحباً بكم!
        </h1>
        <p className="self-center text-gray-600">تسجيل الدخول إلى حسابك</p>
        <label htmlFor="email" className="dark:text-green-100">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          name="email"
          required
          id="email"
          placeholder="example@email.com"
          dir="ltr"
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 invalid:border-red-400 peer"
        />
        <p className="text-red-400 mt-[-15px] peer-invalid:block hidden">
          الرجاء إدخال البريد الإلكتروني بشكل صحيح
        </p>
        <label htmlFor="password" className="dark:text-green-100">
          كلمة المرور
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          placeholder="أدخل كلمة المرور الخاصة بك هنا"
          className="border-green-500 outline-none border-2 p-3 rounded-lg  dark:bg-slate-900 dark:text-green-100"
        />
        <Link to="/forgot-password" className="text-green-500 underline w-fit">
          هل نسيت كلمة المرور؟
        </Link>
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="bg-gradient-to-t from-green-600 py-5 to-green-400 text-white mt-16 rounded-lg font-bold"
        >
          {formState === "submitting" ? (
            <span className="w-6 h-6 border-2 border-white dark:border-green-50 border-r-green-900 dark:border-r-slate-900 animate-spin inline-block rounded-full"></span>
          ) : (
            "تسجيل الدخول"
          )}
        </button>
        <p className="self-center dark:text-green-100">
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-green-500 underline">
            دعنا نقوم بإنشاء حساب
          </Link>
        </p>
      </Form>
    </div>
  );
}

export default LoginPage;
