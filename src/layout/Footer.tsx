import { RefObject, useRef, useState } from "react";
import "../assets/css/footer.css";
import { toast } from "react-toastify";
import { Construct } from "../construct";
import { KeyHandler } from "@maxgraph/core";

interface FooterProps {
  constructRef: RefObject<Construct>;
}
export default function Footer({ constructRef }: FooterProps) {
  const [pageCount, setPageCount] = useState(1);
  const keyHandlerRef = useRef<KeyHandler | null>(null);

  setInterval(() => {
    setPageCount(constructRef.current?.getPagesCount() || 1);
  }, 100);
  // const addPage = () => {
  //   constructRef.current?.addPage();
  //   setPageCount(constructRef.current?.getPagesCount() || 1);
  //   // if (pageCount != 0) {
  //   //   switchPage(constructRef.current?.pages.length - 1);
  //   // }
  // };

  const switchPage = (index: number) => {
    constructRef.current?.switchPage(index);
    if (constructRef.current?.pages[constructRef.current.currentPageIndex]) {
      keyHandlerRef.current = new KeyHandler(
        constructRef.current?.pages[index]
      );
    }
  };

  const deletePage = (index: number) => {
    if (constructRef.current) {
      if (pageCount > 1) {
        constructRef.current.deletePage(index);
        const newPageCount = constructRef.current.getPagesCount();
        setPageCount(newPageCount);
        switchPage(constructRef.current?.pages.length - 1);
      } else {
        toast.error("there is a minimum of 1 page");
      }
    }
  };

  return (
    <footer className="fixed-bottom bg-light">
      <div className="all-page d-flex">
        {[...Array(pageCount)].map((_, index) => (
          <div
            className="d-flex btn-group border border-secondary"
            role="group"
            key={index}
          >
            <a
              className="btn-primary btn"
              // type="reset"
              onClick={() => switchPage(index)}
            >
              Page-{index + 1}
            </a>
            <button
              className="btn-primary btn dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            ></button>
            <ul className="dropdown-menu">
              <li>
                {/* <a className="dropdown-item" href="#" onClick={addPage}>
                  Rename
                </a> */}
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => deletePage(index)}
                >
                  Delete
                </a>
              </li>
            </ul>
          </div>
        ))}
        {/* <button className="btn border add-page" onClick={addPage}>
          <i className="bi bi-file-earmark-plus"></i>
        </button> */}
      </div>
    </footer>
  );
}
