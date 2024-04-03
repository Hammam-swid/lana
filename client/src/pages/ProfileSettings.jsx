import { useFormik } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";

function ProfileSettings() {
  const user = useSelector((state) => state.user);
  const [image, setImage] = useState(null);
  const formik = useFormik({
    initialValues: {
      photo: user?.photo,
      fullName: user?.fullName,
      gender: user?.gender,
      day: user?.dateOfBirth ? new Date(user.dateOfBirth).getDate() : 1,
      month: user?.dateOfBirth ? new Date(user.dateOfBirth).getMonth() : 1,
      year: user?.dateOfBirth
        ? new Date(user.dateOfBirth).getFullYear()
        : new Date().getFullYear() - 13,
      dateOfBirth: user.dateOfBirth,
    },
    onSubmit: (values) => console.log(values),
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col p-6 max-w-[40rem] mx-auto gap-2"
    >
      <div className="self-center mb-5">
        <label htmlFor="photo" className="block">
          <img
            title="اضغط لاختيار الصورة"
            src={
              formik.values.photo === user.photo
                ? `/img/users/${user.photo}`
                : formik.values.photo
                ? image
                : "/img/users/default.jpg"
            }
            alt={`صورة ${user.fullName}`}
            className="object-cover w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden outline outline-4 outline-green-500"
          />
        </label>
      </div>
      <input
        type="file"
        name="photo"
        id="photo"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.readyState === 2) {
              setImage(reader.result);
            }
          };
          reader.readAsDataURL(e.target.files[0]);
          console.log(image);
          formik.setFieldValue("photo", e.target.files[0]);
        }}
        onBlur={formik.handleBlur}
      />
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
          {(() => {
            let options = [];
            for (let i = 1; i <= 31; i++) {
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
          {(() => {
            let options = [];
            for (let i = new Date().getFullYear() - 13; i >= 1900; i--) {
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
      <button
        type="submit"
        className="p-3 mt-10 rounded-sm font-bold text-lg bg-gradient-to-b from-green-400 to-green-600"
      >
        تعديل البيانات
      </button>
    </form>
  );
}

export default ProfileSettings;
