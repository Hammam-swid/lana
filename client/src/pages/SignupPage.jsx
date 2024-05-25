/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../store/authSlice";
import { AnimatePresence, motion } from "framer-motion";
function SignupPage() {
  const [created, setCreated] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      fullName: "",
      gender: "",
      day: "day",
      month: "month",
      year: "year",
      password: "",
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("يجب إدخال البريد الإلكتروني")
        .email("الرجاء إدخال البريد الإلكتروني بشكل صحيح"),
      fullName: Yup.string().required("يجب إدخال الاسم"),
      username: Yup.string()
        .required("يجب إدخال اسم المستخدم")
        .matches(/^[-\w.$@*!]{1,30}$/, "الرجاء إدخال اسم المستخدم بشكل صحيح"),
      password: Yup.string()
        .required("يجب إدخال كلمة المرور")
        .min(8, "يجب أن تحتوي كلمة المرور على أكثر من 8 أحرف")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
          "كلمة المرور ضعيفة"
        ),
      passwordConfirm: Yup.string()
        .required("الرجاء إدخال كلمة المرور مجدداً")
        .oneOf([Yup.ref("password"), null], "كلمة المرور غير متطابقة"),
      gender: Yup.string().required("يجب إدخال الجنس"),
    }),
    onSubmit: async (values) => {
      const dateOfBirth = new Date(values.year, values.month - 1, values.day);
      if (dateOfBirth && dateOfBirth !== "Invalid Date")
        values.dateOfBirth = dateOfBirth;
      try {
        const res = await axios({
          method: "POST",
          url: "/api/v1/users/signup",
          data: values,
        });
        console.log(res);
        if (res.status === 201) {
          setCreated(true);
        }
      } catch (err) {
        console.log(err);
      }
    },
  });
  const verifyFormik = useFormik({
    initialValues: {
      verificationCode: "",
    },
    validationSchema: Yup.object({
      verificationCode: Yup.number("رمز التحقق يتكون من أرقام فقط")
        .integer()
        .min(100000, "يجب أن يتكون رمز التحقق من 6 أرقام")
        .max(999999, "يجب أن يتكون رمز التحقق من 6 أرقام فقط"),
    }),
    onSubmit: async (values) => {
      const { verificationCode } = values;
      const { email } = formik.values;
      const res = await axios({
        method: "POST",
        url: "/api/v1/users/verifySignup",
        data: { verificationCode, email },
      });
      if (res.data.status === "success") {
        const { token, user } = res.data;
        dispatch(setLogin({ token, user }));
        nav("/");
      }
    },
  });
  return (
    <>
      <div className="min-h-screen w-full dark:bg-slate-900 flex items-center justify-center flex-col">
        <h1 className="font-bold text-3xl dark:text-green-100">مرحباً بكم!</h1>
        <p className="text-gray-600">إنشاء حساب جديد</p>

        {!created ? (
          <form
            className="max-w-screen-sm w-full"
            onSubmit={formik.handleSubmit}
          >
            <AnimatePresence>
              <FormSteps
                validateField={formik.validateField}
                touched={formik.touched}
                errors={formik.errors}
                values={formik.values}
                setErrors={formik.setErrors}
                setTouched={formik.setTouched}
                isSubmitting={formik.isSubmitting}
                setSubmitting={formik.setSubmitting}
                created={created}
              >
                <motion.div exit={{ x: 1000 }} className="flex flex-col gap-3">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="email@example.com"
                    dir="ltr"
                    className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 invalid:border-red-400 peer"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.email && formik.touched.email && (
                    <div className="text-red-400">{formik.errors.email}</div>
                  )}
                  <label htmlFor="fullName">الاسم الكامل</label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.fullName && formik.touched.fullName && (
                    <div className="text-red-400">{formik.errors.fullName}</div>
                  )}
                  <label htmlFor="username">اسم المستخدم (username)</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    dir="ltr"
                    className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.username && formik.touched.username && (
                    <div className="text-red-400">{formik.errors.username}</div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ x: -800 }}
                  animate={{ x: 0, transitionDuration: 1.5 }}
                  exit={{ x: 1000 }}
                  className="flex flex-col"
                >
                  <label htmlFor="day" className="font-bold mb-2">
                    تاريخ الميلاد:
                  </label>
                  <div className="flex *:flex-1 gap-5 *:text-2xl *:text-center *:dark:bg-slate-900">
                    <select
                      name="day"
                      id="day"
                      className=""
                      value={formik.values.day}
                      onChange={formik.handleChange}
                    >
                      <option value="day">يوم</option>
                      {(() => {
                        let options = [];
                        let limit;
                        console.log(formik.values);
                        if (
                          [1, 3, 5, 7, 8, 10, 12].includes(+formik.values.month)
                        )
                          limit = 31;
                        else if ([4, 6, 9, 11].includes(+formik.values.month))
                          limit = 30;
                        else if (+formik.values.month === 2)
                          limit = +formik?.values?.year % 4 === 0 ? 29 : 28;
                        else limit = 31;
                        for (let i = 1; i <= limit; i++) {
                          options.push(
                            <option key={`day-${i}`} value={i}>
                              {i}
                            </option>
                          );
                        }
                        return options;
                      })()}
                    </select>
                    <select
                      name="month"
                      id="month"
                      value={formik.values.month}
                      onChange={formik.handleChange}
                    >
                      <option value="month">شهر</option>
                      {(() => {
                        let options = [];
                        for (let i = 1; i <= 12; i++) {
                          options.push(
                            <option key={`month-${i}`} value={i}>
                              {i}
                            </option>
                          );
                        }
                        return options;
                      })()}
                    </select>
                    <select
                      name="year"
                      id="year"
                      value={formik.values.year}
                      onChange={formik.handleChange}
                    >
                      <option value="year">سنة</option>
                      {(() => {
                        let options = [];
                        for (
                          let i = new Date().getFullYear() - 13;
                          i >= 1900;
                          i--
                        ) {
                          options.push(
                            <option key={`year-${i}`} value={i}>
                              {i}
                            </option>
                          );
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                  <div className="text-lg py-6 flex gap-4 items-center">
                    <label className="font-bold">الجنس: </label>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        id="male"
                        value="male"
                        checked={formik.values.gender === "male"}
                        className="peer hidden"
                        onChange={formik.handleChange}
                      />
                      <label
                        htmlFor="male"
                        className="peer-checked:font-bold py-1 cursor-pointer px-4 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                      >
                        ذكر
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        id="female"
                        value="female"
                        className="peer hidden"
                        checked={formik.values.gender === "female"}
                        onChange={formik.handleChange}
                      />
                      <label
                        htmlFor="female"
                        className="peer-checked:font-bold py-1 cursor-pointer px-4 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                      >
                        أنثى
                      </label>
                    </div>
                  </div>
                  {formik.errors.gender && formik.touched.gender && (
                    <div className="text-red-400">{formik.errors.gender}</div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ x: -800 }}
                  animate={{ x: 0 }}
                  exit={{ x: 1000 }}
                >
                  <label htmlFor="password">كلمة المرور</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 w-full my-5"
                  />
                  {formik.errors.password && formik.touched.password && (
                    <div className="text-red-400">{formik.errors.password}</div>
                  )}
                  <label htmlFor="passwordConfirm">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    id="passwordConfirm"
                    value={formik.values.passwordConfirm}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 w-full my-5"
                  />
                  {formik.errors.passwordConfirm &&
                    formik.touched.passwordConfirm && (
                      <div className="text-red-400">
                        {formik.errors.passwordConfirm}
                      </div>
                    )}
                </motion.div>
              </FormSteps>
            </AnimatePresence>
          </form>
        ) : (
          <form
            onSubmit={verifyFormik.handleSubmit}
            className="flex flex-col gap-5"
          >
            <h2 className="text-2xl">
              تم إرسال رمز التحقق إلى البريد الإلكتروني
            </h2>
            <h4 className="text-gray-400">
              الرجاء إدخال رمز التحقق لإكمال عملية التسجيل
            </h4>
            <label htmlFor="verificationCode">رمز التحقق</label>
            <input
              type="text"
              name="verificationCode"
              id="verificationCode"
              className="-mt-2 border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
              onChange={verifyFormik.handleChange}
              onBlur={verifyFormik.handleBlur}
              value={verifyFormik.values.verificationCode}
            />
            {verifyFormik.errors.verificationCode &&
              verifyFormik.errors.verificationCode}
            <button
              type="submit"
              className="bg-gradient-to-b from-green-400 to-green-600 py-4 w-full mt-10 rounded-md text-md font-bold"
            >
              إرسال
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function FormSteps(props) {
  const childrenArray = React.Children.toArray(props.children);

  const [step, setStep] = useState(0);
  return (
    <div className="max-w-screen-sm w-full p-6">
      {childrenArray[step]}

      <div className="flex justify-between mt-10 *:p-3 *:rounded">
        <button
          disabled={props.isSubmitting || step === 0}
          type="button"
          className="bg-red-500 disabled:bg-red-950 disabled:text-gray-500"
          onClick={() => setStep(step - 1)}
        >
          السابق
        </button>
        <button
          type="button"
          disabled={step === childrenArray.length - 1 || props.isSubmitting}
          onClick={async () => {
            if (step === 0) {
              if (
                !props.errors.username &&
                !props.errors.email &&
                !props.errors.fullName &&
                props.touched.email &&
                props.touched.username &&
                props.touched.fullName
              ) {
                try {
                  props.setSubmitting(true);
                  const { username, email } = props.values;
                  const res = await axios({
                    method: "POST",
                    url: "/api/v1/users/checkUsername",
                    data: { username, email },
                  });
                  console.log(props.values.username);
                  console.log(res);
                  props.setSubmitting(false);
                  if (res.data.status === "success") setStep(step + 1);
                } catch (err) {
                  if (err.response.data.message.startsWith("لا"))
                    props.setErrors({ email: err.response.data.message });
                  else
                    props.setErrors({
                      username: err.response.data.message,
                    });
                  props.setSubmitting(false);
                }
              } else {
                console.log(props.validateField("email"));
                props.validateField("fullName");
                props.validateField("username");
                console.log(props.touched, props.errors);
                props.setErrors({ ...props.errors });
                props.setTouched({
                  email: true,
                  fullName: true,
                  username: true,
                });
              }
            } else if (step === 1) {
              if (!props.errors.gender) {
                setStep(step + 1);
              }
            }
          }}
          className="bg-green-500 disabled:bg-green-950 disabled:text-gray-500"
        >
          {props.isSubmitting ? (
            <span>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="animate-spin text-white"
              />
            </span>
          ) : (
            "التالي"
          )}
        </button>
      </div>
      {step === childrenArray.length - 1 && (
        <button
          disabled={props.isSubmitting}
          type="submit"
          className="bg-gradient-to-b from-green-400 to-green-600 py-4 w-full mt-10 rounded-md text-md font-bold"
        >
          {props.isSubmitting ? (
            <span>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="animate-spin text-2xl"
              />
            </span>
          ) : (
            "تسجيل"
          )}
        </button>
      )}
    </div>
  );
}

export default SignupPage;
