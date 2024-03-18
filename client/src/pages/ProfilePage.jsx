import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";

function ProfilePage() {
  const dataPromise = useLoaderData();
  console.log(dataPromise);
  return (
    <>
      <Suspense fallback={<h1>جارٍ التحميل...</h1>}>
        <Await resolve={dataPromise.user}>
          {(user) => {
            console.log(user);
            return <h1>{user?.username}</h1>;
          }}
        </Await>
      </Suspense>
    </>
  );
}

export default ProfilePage;
