import applogo from "/Logo2.png";
import "../assets/css/header.css";
import {
  ChangeSymbol,
  Copy,
  Cut,
  Delete,
  Duplicate,
  Paste,
  Print,
  Redo,
  ResetView,
  SaveAs,
  SelectAll,
  SelectNone,
  Undo,
  ZoomIn,
  ZoomOut,
} from "./function-header/Header-menu";
import { ChangeEvent, RefObject, createRef, useState } from "react";
// import { Notation } from "./function-leftbar/notation";
import { Codec, xmlUtils } from "@maxgraph/core";
import { Construct } from "../construct";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface HeaderProps {
  OnFilename: (string: string) => void;
  filename: string;
  constructRef: RefObject<Construct>;
}
function Header({ OnFilename, filename, constructRef }: HeaderProps) {
  const [namefile, setNamefile] = useState("diagram");

  //Open Logic Start
  const fileInputRef: RefObject<HTMLInputElement> = createRef();
  function handleButtonClick() {
    fileInputRef.current?.click();
  }
  function handleFileChange(event: ChangeEvent<HTMLInputElement | null>) {
    const file = event.target?.files![0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;

      const newContent = content?.toString();
      const doc = xmlUtils.parseXml(newContent!);
      const file = doc.querySelector("file");
      const filename = file!.getAttribute("name");
      const pages = file!.querySelectorAll("diagram");
      const codec = new Codec(doc);
      pages.forEach((page, key) => {
        const celll = constructRef.current?.pages[key].selectAll();
        constructRef.current?.pages[key].removeCells(celll!);
        constructRef.current?.addPage();
        const nodes = page.firstElementChild?.querySelector("root")!.childNodes;
        const cells: Element[] = [];
        nodes?.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            cells.push(node as Element);
          }
        });
        cells?.forEach((cell) => {
          // console.log(cell);
          const newCell = codec.decodeCell(cell, false);
          constructRef.current?.pages[key].removeCells();
          // const parent = constructRef.current?.pages[key].getDefaultParent();
          constructRef.current?.pages[key].addCell(
            newCell,
            null,
            parseInt(newCell.getId()!)
          );
        });
      });
      constructRef.current?.deletePage(constructRef.current.currentPageIndex);
      constructRef.current?.switchPage(0);
      setNamefile(filename!);
    };
    reader.readAsText(file);
  }
  //Open Logic End
  function changeNamefile() {
    const newValue = prompt(t("renamefile"));
    if (newValue) {
      setNamefile(newValue);
      OnFilename(newValue);
    }
  }
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(t("notif_bhs"), { autoClose: 2000 });
  };
  return (
    <header className="">
      <nav className="border navbar navbar-expand-lg  bg-light fixed-top ">
        <div className="container-fluid d-flex justify-content-between">
          <a className="navbar-brand" target="_blank" href="" title="index">
            <img src={applogo} alt="" className="logo" />
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item ">
                {/* File */}
                <div className="dropdown">
                  <button
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {t("file")}
                  </button>
                  <ul className="dropdown-menu pop-up">
                    <li className="">
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        target="_blank"
                        href=""
                      >
                        {t("new")}
                        <p className="text-secondary text-sm">Ctrl+N</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={handleButtonClick}
                      >
                        <input
                          type="file"
                          name=""
                          id=""
                          hidden
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        {t("openn")}
                        <p className="text-secondary text-sm">Ctrl+O</p>
                      </a>
                    </li>
                    {/* <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => Save({ constructRef, filename })}
                      >
                        {t("save")}
                        <p className="text-secondary text-sm">Ctrl+S</p>
                      </a>
                    </li> */}
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => SaveAs({ constructRef, filename })}
                      >
                        {t("saveas")}...
                        <p className="text-secondary text-sm">Ctrl+Shift+S</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => Print({ constructRef }, namefile)}
                      >
                        {t("print")}...
                        <p className="text-secondary text-sm">Ctrl+P</p>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider"></hr>
                    </li>

                    {/* <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("makea")}...
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("import")}...
                      </a>
                    </li> */}
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() =>
                          constructRef.current?.exportMultipleGraphsToJPEG(
                            namefile
                          )
                        }
                      >
                        {t("export")}...
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                {/* Edit */}
                <div className="dropdown">
                  <button
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {t("edit")}
                  </button>
                  <ul className="dropdown-menu pop-up">
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Undo({ constructRef });
                        }}
                      >
                        {t("undo")}

                        <p className="text-secondary text-sm">Ctrl+Z</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Redo({ constructRef });
                        }}
                      >
                        {t("redo")}
                        <p className="text-secondary text-sm">Ctrl+Y</p>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider"></hr>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Cut({ constructRef });
                        }}
                      >
                        {t("cut")}
                        <p className="text-secondary text-sm">Ctrl+X</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Copy({ constructRef });
                        }}
                      >
                        {t("copy")}
                        <p className="text-secondary text-sm">Ctrl+C</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Paste({ constructRef });
                        }}
                      >
                        {t("paste")}
                        <p className="text-secondary text-sm">Ctrl+V</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Delete({ constructRef });
                        }}
                      >
                        {t("delete")}
                        <p className="text-secondary text-sm">Delete</p>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider"></hr>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          Duplicate({ constructRef });
                        }}
                      >
                        {t("dup")}
                        <p className="text-secondary text-sm">Ctrl+D</p>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider"></hr>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          SelectAll({ constructRef });
                        }}
                      >
                        {t("selall")}
                        <p className="text-secondary text-sm">Ctrl+A</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          SelectNone({ constructRef });
                        }}
                      >
                        {t("selnon")}
                        <p className="text-secondary text-sm">Ctrl+Shift+A</p>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                {/* View */}
                <div className="dropdown">
                  <button
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {t("view")}
                  </button>
                  <ul className="dropdown-menu pop-up">
                    {/* <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        <div>
                          <i className="bi bi-check2 me-2"></i>
                          Format
                        </div>
                        <p className="text-secondary text-sm">Ctrl+Shift+P</p>
                      </a>
                    </li> */}
                    {/* <li>
                      <hr className="dropdown-divider"></hr>
                    </li> */}
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          ResetView({ constructRef });
                        }}
                      >
                        {t("reset")}
                        <p className="text-secondary text-sm">Home</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          ZoomIn({ constructRef });
                        }}
                      >
                        {t("zoomin")}
                        <p className="text-secondary text-sm">
                          Ctrl + (Numpad)
                        </p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                        onClick={() => {
                          ZoomOut({ constructRef });
                        }}
                      >
                        {t("zoomout")}
                        <p className="text-secondary text-sm">
                          Ctrl - (Numpad)
                        </p>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              {/* <li className="nav-item">
                Arrange
                <div className="dropdown">
                  <button
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {t("arrange")}
                  </button>
                  <ul className="dropdown-menu pop-up">
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("tofront")}
                        <p className="text-secondary text-sm">Ctrl+Shift+,</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("toback")}
                        <p className="text-secondary text-sm">Ctrl+Shift+.</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("bringf")}
                        <p className="text-secondary text-sm">Ctrl+.</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("sendb")}
                        <p className="text-secondary text-sm">Ctrl+.</p>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider"></hr>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("group")}
                        <p className="text-secondary text-sm">Ctrl+G</p>
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item d-flex justify-content-between"
                        href="#"
                      >
                        {t("ungroup")}
                        <p className="text-secondary text-sm">Ctrl+Shift+U</p>
                      </a>
                    </li>
                  </ul>
                </div>
              </li> */}
              <li className="nav-item">
                {/* Extras */}
                <div className="dropdown">
                  <button
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-bs-auto-close="outside"
                  >
                    {t("extras")}
                  </button>
                  <ul className="dropdown-menu pop-up">
                    <li className="dropend">
                      <button
                        className="btn dropdown-item justify-content-between d-flex"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="true"
                      >
                        <p>{t("symbol")}</p>
                        <i className="bi bi-caret-right-fill"></i>
                      </button>
                      <ul className="dropdown-menu" style={{ width: "200px" }}>
                        <li>
                          <button
                            className="btn"
                            onClick={() =>
                              ChangeSymbol(
                                constructRef.current!.pages,
                                "yourdon"
                              )
                            }
                          >
                            Yourdon & DeMarco
                          </button>
                        </li>
                        <li>
                          <button
                            className="btn"
                            onClick={() =>
                              ChangeSymbol(constructRef.current!.pages, "gane")
                            }
                          >
                            Gane & Sarson
                          </button>
                        </li>
                      </ul>
                    </li>
                    <li className="dropend">
                      {/* <div > */}
                      <button
                        className="btn dropdown-item justify-content-between d-flex"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="true"
                      >
                        <p>{t("language")}</p>
                        <i className="bi bi-caret-right-fill"></i>
                      </button>
                      <ul className="dropdown-menu ">
                        <li>
                          <button
                            className="btn"
                            onClick={() => changeLanguage("id")}
                          >
                            Bahasa Indonesia
                          </button>
                        </li>
                        <li>
                          <button
                            className="btn"
                            onClick={() => changeLanguage("en")}
                          >
                            English
                          </button>
                        </li>
                      </ul>
                      {/* </div> */}
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Filename */}
        <div className="filename">
          <button className="btn btn-primary p-2 m-1" onClick={changeNamefile}>
            {namefile}
          </button>
        </div>
      </nav>
    </header>
  );
}
export default Header;
