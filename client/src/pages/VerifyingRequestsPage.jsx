import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";

function VerifyingRequestsPage() {
  const promiseData = useLoaderData();
  return (
    <div>
      <Suspense fallback={<>جار التحميل...</>}>
        <Await resolve={promiseData.verifyingRequests}>
          {(requests) =>
            requests.map((request) => (
              <div key={request._id}>
                {request.verificationFile.split(".")[1] === "pdf" ? (
                  <iframe
                    src={`/verificationFiles/${request.verificationFile}`}
                  ></iframe>
                ) : (
                  <></>
                )}
                <a
                  href={`/verificationFiles/${request.verificationFile}`}
                  target="_blank"
                >
                  انقر هنا
                </a>
              </div>
            ))
          }
        </Await>
      </Suspense>
    </div>
  );
}

export default VerifyingRequestsPage;
