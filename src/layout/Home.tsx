import { ChangeEvent, RefObject, createRef, useState } from "react";
import applogo from "/Logo2.png";
import { Construct } from "../construct";
import { Codec, xmlUtils } from "@maxgraph/core";
interface HomeProps {
  OnFilename: (string: string) => void;
  constructRef: RefObject<Construct>;
}
export function Home({ OnFilename, constructRef }: HomeProps) {
  const [namefile, setNamefile] = useState("");
  const fileInputRef = createRef<HTMLInputElement>();
  function handleOpenDiagram() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
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
      // const newPages: MyCustomGraph[] = [];
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
  function handleSubmit() {
    if (!namefile) return;
    OnFilename(namefile);
    document.getElementById("close")?.click();
  }
  return (
    <>
      <div className="container">
        <div className="bg-dark p-5 rounded bg-opacity-10 first-pop-up">
          <div className="d-flex gap-4 justift-content-center">
            <a className="navbar-brand" href="/" title="MakeUrDFD">
              <img src={applogo} alt="" className="logo" />
            </a>
            <h5 className="p-2 title">Make Ur DFD</h5>
          </div>
          <hr className="fs-1 text-dark" />
          <div className=" d-flex flex-column gap-2 ">
            <button
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
              type="button"
              // onClick={handleNewDiagram}
              className="btn btn-primary btn-lg "
              title="Create New Diagram"
            >
              Create New Diagram
            </button>
            <a
              href=""
              type="button"
              onClick={handleOpenDiagram}
              className="btn btn-primary btn-lg"
              title="Open Existing Diagram"
            >
              Open Existing Diagram
              <input
                type="file"
                name=""
                id=""
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </a>
          </div>
        </div>
      </div>

      {/* Modal Create Diagram Start */}
      <div
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Create New Diagram
              </h1>
              <button
                id="close"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form action="" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder=""
                    onChange={(e) => setNamefile(e.target.value)}
                  ></input>

                  <label htmlFor="floatingInput">Filename</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Modal Create Diagram End */}
    </>
  );
}
