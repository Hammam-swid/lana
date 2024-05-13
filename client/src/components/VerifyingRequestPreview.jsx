/* eslint-disable react/prop-types */
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { Link } from "react-router-dom";

function VerifyingRequestPreview({ request }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState(0);
  return (
    <div className="dark:bg-slate-900 bg-slate-100 rounded-md overflow-hidden p-3">
      {request.verificationFile.split(".")[1] === "pdf" ? (
        // <iframe
        //   className="w-64 aspect-square"
        //   src={`/verificationFiles/${request.verificationFile}`}
        // />
        <>
          <div className="max-h-64 overflow-scroll w-fit rounded-md">
            <Document
              file={`/verificationFiles/${request.verificationFile}`}
              onLoadSuccess={(doc) => {
                setNumOfPages(doc.numPages);
              }}
              onLoadError={(error) => console.log(error)}
            >
              <Page
                width={300}
                className={"h-fit w-fit overflow-hidden"}
                pageNumber={currentPage}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                renderForms={false}
              />
            </Document>
          </div>
          <p>
            {" "}
            {currentPage} من {numOfPages}
          </p>
          <button
            onClick={() =>
              setCurrentPage((prev) => (prev === numOfPages ? prev : prev + 1))
            }
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </>
      ) : (
        <img
          className="w-64"
          src={`/verificationFiles/${request.verificationFile}`}
        />
      )}
      <a
        className="block"
        href={`/verificationFiles/${request.verificationFile}`}
        target="_blank"
      >
        عرض في صفحة منفصلة
      </a>
      <Link to={request.profileUrl}>الملف الشخصي</Link>
    </div>
  );
}

export default VerifyingRequestPreview;
