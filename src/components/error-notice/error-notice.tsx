import { FC } from "react";
import "./error-notice.css";

const ErrorNotice: FC<{ message: string | undefined }> = ({ message }) =>
  message ? (
    <div className="error-notice" role="alert">
      {message}
    </div>
  ) : null;

export default ErrorNotice;
