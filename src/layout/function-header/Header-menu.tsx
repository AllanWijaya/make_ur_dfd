import {
  AutoSaveManager,
  Codec,
  EventObject,
  InternalEvent,
  MaxLog,
  UndoManager,
  xmlUtils,
} from "@maxgraph/core";
import { RefObject } from "react";
import { Construct, MyCustomGraph } from "../../construct";
// import "../../assets/css/";

const xxx = xmlUtils.createXmlDocument();
interface Props {
  constructRef: RefObject<Construct>;
  filename: string;
}
interface ConsProps {
  constructRef: RefObject<Construct>;
}
export function Save({ constructRef, filename }: Props) {
  const file = xxx.createElement("file");
  file.setAttribute("name", filename);
  const encoder = new Codec();

  constructRef.current?.pages.map((tes: MyCustomGraph, index: number) => {
    const page = xxx.createElement("diagram");
    page.setAttribute("page", (index + 1).toString());
    page.setAttribute("level", tes.getLevelDFD().toString());
    const node = encoder.encode(tes?.getDataModel());
    // const xml = xmlUtils.getXml(node!);
    page.appendChild(node!);
    file.appendChild(page);
    const mgr = new AutoSaveManager(tes);
    mgr.save();
  });
  console.log(file);

  // console.log(constructRef.current?.pages);

  MaxLog.show;
  MaxLog.debug("save");
}
export function SaveAs({ constructRef, filename }: Props) {
  const file = xxx.createElement("file");
  file.setAttribute("name", filename);
  const encoder = new Codec();

  constructRef.current?.pages.map((tes: MyCustomGraph, index: number) => {
    const page = xxx.createElement("diagram");
    page.setAttribute("page", (index + 1).toString());
    page.setAttribute("level", tes.getLevelDFD().toString());
    const node = encoder.encode(tes?.getDataModel());
    page.appendChild(node!);
    // console.log(xml);
    file.appendChild(page);
  });
  const xml = xmlUtils.getXml(file);
  try {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (filename || "diagram") + ".xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.log(error);
  }
}

export function Print({ constructRef }: ConsProps, filename: string) {
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    // Write the basic structure of the new document
    printWindow.document.write(`<html><head><title>` + filename + `</title>`);
    // printWindow.document.write(
    //   "<style>body { font-family: Arial, sans-serif; } .graph-container { border: 1px solid black; margin: 20px; padding: 10px; }</style>"
    // );
    printWindow.document.write("</head><body>");

    // Append each graph container to the new window's document
    constructRef.current?.pages.forEach((graph) => {
      graph.container.style.display = "block";
      const graphClone = graph.container.cloneNode(true) as HTMLElement;

      // graphClone.classList.add("graph-container");
      printWindow.document.body.appendChild(graphClone);
    });

    // Close the document writing process
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Print the content of the new window
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1);
  } else {
    console.error("Failed to open a new tab for printing.");
  }
}
export function ChangeSymbol(graphs: MyCustomGraph[], symbol: string) {
  if (symbol == "yourdon") {
    graphs.map((graph) => {
      graph.selectAll();
      const cells = graph.getSelectionCells();
      // const parent = graph.getDefaultParent();
      cells.map((cell) => {
        if (cell.style.shape == "data-store-gane") {
          const newCell = graph.getCellStyle(cell);
          newCell.shape = "data-store-yourdon";
          graph.setCellStyle(newCell, [cell]);
        }
        if (cell.style.shape == "process-gane") {
          const newCell = graph.getCellStyle(cell);
          newCell.shape = "process-yourdon";
          graph.setCellStyle(newCell, [cell]);
        }
      });
    });
  } else if (symbol == "gane") {
    graphs.map((graph) => {
      graph.selectAll();
      const cells = graph.getSelectionCells();
      cells.map((cell) => {
        if (cell.style.shape == "data-store-yourdon") {
          const newCell = graph.getCellStyle(cell);
          newCell.shape = "data-store-gane";
          graph.setCellStyle(newCell, [cell]);
        }
        if (cell.style.shape == "process-yourdon") {
          const newCell = graph.getCellStyle(cell);
          newCell.shape = "process-gane";
          graph.setCellStyle(newCell, [cell]);
        }
      });
      // graph.removeCells(cells);
    });
  }
}
export function Undo({ constructRef }: ConsProps) {
  const undoManager = new UndoManager();
  const listener = function (_sender: null, evt: EventObject) {
    undoManager.undoableEditHappened(evt.getProperty("edit"));
  };
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.getDataModel().addListener(InternalEvent.UNDO, listener);
  graph?.getView().addListener(InternalEvent.UNDO, listener);
  undoManager.undo();
}
export function Redo({ constructRef }: ConsProps) {
  const undoManager = new UndoManager();
  const listener = function (_sender: null, evt: EventObject) {
    undoManager.undoableEditHappened(evt.getProperty("edit"));
  };
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.getDataModel().addListener(InternalEvent.UNDO, listener);
  graph?.getView().addListener(InternalEvent.UNDO, listener);
  undoManager.redo();
}
export function Cut({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  const cells = graph?.getSelectionCells();
  const cutCells = graph?.cloneCells(cells!);
  cutCells?.map((cell) => {
    cell.setId(Math.random().toString(36).substr(2, 9));
  });
  graph?.setTemporaryCells(cutCells!);
  graph?.removeCells(cells);
}
export function Copy({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  const cells = graph?.getSelectionCells();
  const cutCells = graph?.cloneCells(cells!);
  cutCells?.map((cell) => {
    cell.setId(Math.random().toString(36).substr(2, 9));
  });
  graph?.setTemporaryCells(cutCells!);
}
export function Paste({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  const cells = graph?.getTemporaryCells();
  cells?.map((cell) => {
    const geo = cell.getGeometry();
    if (geo != null) {
      geo.translate(30, 30);
    }
    graph?.addCell(cell, null, null, null, null);
  });
}
export function Delete({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  const cells = graph?.getSelectionCells();
  graph?.removeCells(cells);
}
export function Duplicate({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  const cells = graph?.getSelectionCells();
  graph?.duplicateCells(cells!);
}
export function SelectAll({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.selectAll();
}
export function SelectNone({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.clearSelection();
}
export function ResetView({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.zoomActual();
}
export function ZoomIn({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.zoomIn();
}
export function ZoomOut({ constructRef }: ConsProps) {
  const graph =
    constructRef.current?.pages[constructRef.current.currentPageIndex];
  graph?.zoomOut();
}
