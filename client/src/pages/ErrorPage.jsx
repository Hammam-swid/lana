import { faFaceFrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouteError } from "react-router-dom";
function ErrorPage() {
  const error = useRouteError();
  console.log(error.response);
  console.log(error)
  return (
    <div className="grow gap-5 flex justify-center items-center font-bold text-4xl text-center">
      <FontAwesomeIcon icon={faFaceFrown} className="text-red-500"/>
      <span>{error.response?.data?.message}</span>
      <span>{error.response?.status}</span>
    </div>
  );
}

export default ErrorPage;
