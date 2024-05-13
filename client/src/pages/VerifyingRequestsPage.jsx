import { Suspense, useState } from "react";
import { Await, Link, useLoaderData } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import VerifyingRequestPreview from "../components/VerifyingRequestPreview";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function VerifyingRequestsPage() {
  const promiseData = useLoaderData();
  return (
    <div className="flex flex-col gap-5 p-6 w-full">
      <h1 className="text-3xl font-bold ">طلبات التوثيق</h1>
      <div className="grid grid-cols-3 w-full gap-5">
        <Suspense fallback={<>جار التحميل...</>}>
          <Await resolve={promiseData.verifyingRequests}>
            {(requests) =>
              requests.map((request) => (
                <VerifyingRequestPreview key={request._id} request={request} />
              ))
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default VerifyingRequestsPage;
