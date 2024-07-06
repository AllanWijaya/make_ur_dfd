import { Process, Entity, Datastore } from "./function-leftbar/Leftbar-menu";
import "../assets/css/leftbar.css";
import { RefObject, useState } from "react";
import { Construct } from "../construct";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface LeftbarProps {
  constructRef: RefObject<Construct>;
}

function LeftBar({ constructRef }: LeftbarProps) {
  const { t } = useTranslation();
  const [x, setX] = useState(230);
  const [y, setY] = useState(200);

  function btnEntity() {
    if (constructRef.current?.pages) {
      Entity(
        constructRef.current?.pages[constructRef.current.currentPageIndex],
        x,
        y
      );
      setX(x + 15);
      setY(y + 15);
    }
  }
  function btnDatastore() {
    if (
      constructRef.current?.pages[
        constructRef.current.currentPageIndex
      ].getLevelDFD() == 0
    ) {
      toast.error(t("datastoreerror"));
    } else if (constructRef.current?.pages) {
      Datastore(
        constructRef.current?.pages[constructRef.current.currentPageIndex],
        x,
        y
      );
      setX(x + 15);
      setY(y + 15);
    }
  }

  function btnProcess() {
    if (constructRef.current?.pages) {
      const processID =
        constructRef.current?.pages[
          constructRef.current.currentPageIndex
        ].getProcess1ID();
      const levelDFD =
        constructRef.current?.pages[
          constructRef.current.currentPageIndex
        ].getLevelDFD();
      // if () {
      if (processID > 0 && levelDFD == 0) {
        toast.error(t("processerror"));
      } else {
        Process(
          constructRef.current?.pages[constructRef.current.currentPageIndex],
          x,
          y
        );
        setX(x + 15);
        setY(y + 15);
      }
    }
  }
  return (
    <>
      <div className="menu-diagram position-fixed border bg-light">
        <div className="convert-symbol ">
          <a
            id="ent"
            type="button"
            className="btn btn-lg btn-primary p-3 m-3"
            onClick={btnEntity}
          >
            {t("entity")}
          </a>
          <a
            type="button"
            className="btn btn-lg btn-primary p-3 m-3"
            onClick={btnProcess}
          >
            {t("process")}
          </a>
          <a
            type="button"
            className="btn btn-lg btn-primary p-3 m-3"
            onClick={btnDatastore}
          >
            {t("datastore")}
          </a>
        </div>
      </div>
    </>
  );
}
export default LeftBar;
