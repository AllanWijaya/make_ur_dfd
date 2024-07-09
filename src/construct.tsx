import "@maxgraph/core/css/common.css";

import {
  Graph,
  InternalEvent,
  KeyHandler,
  RubberBandHandler,
  ConnectionConstraint,
  Point,
  ConnectionHandler,
  CellState,
  CellEditorHandler,
  SelectionCellsHandler,
  SelectionHandler,
  Geometry,
  Codec,
  PopupMenuHandler,
  Cell,
  CodecRegistry,
  ObjectCodec,
  CellRenderer,
  InternalMouseEvent,
  EventObject,
  TooltipHandler,
  Client,
  domUtils,
  PanningHandler,
  UndoManager,
  CellOverlay,
  Shape,
} from "@maxgraph/core";
import "@maxgraph/core/css/common.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { t } from "i18next";
import html2canvas from "html2canvas";
export class CustomData {
  constructor(
    public value?: string,
    public id1?: number,
    public id2?: number
  ) {}
}
export type CustomCell = Cell & {
  data?: CustomData;
};
const codec = new ObjectCodec(new CustomData());
codec.encode = function (enc, obj) {
  const node = enc.document.createElement("CustomData");
  domUtils.setTextContent(node, JSON.stringify(obj));
  return node;
};
codec.decode = function (_dec, node) {
  const obj = JSON.parse(domUtils.getTextContent(node as unknown as Text));
  obj.constructor = CustomData;
  return obj;
};
CodecRegistry.register(codec);
class MyCustomConnectionHandler extends ConnectionHandler {
  // Enables connect preview for the default edge style

  connect(source: CustomCell, target: CustomCell) {
    if (target) {
      if (
        (source.data?.value === "datastore" &&
          target.data?.value === "entity") ||
        (source.data?.value === "entity" && target.data?.value === "datastore")
      ) {
        alert("Connection between Datastore and Entity is not allowed");
        return null;
      } else if (
        source.data?.value === "datastore" &&
        target.data?.value === "datastore"
      ) {
        alert("Connection between Datastore and Datastore is not allowed");
        return null;
      } else if (
        source.data?.value === "entity" &&
        target.data?.value === "entity"
      ) {
        alert("Connection between Entity and Entity is not allowed");
        return null;
      }
      // return super.connect(source, target, evt, dropTarget);
      this.graph.insertEdge(
        this.graph.getDefaultParent(),
        Math.random().toString(36).substr(2, 9),
        "Data Flow",
        source,
        target
      );
    }
  }
  // createEdgeState() {
  //   const edge = this.graph.createEdge(
  //     null,
  //     Math.random().toString(36).substr(2, 9),
  //     "Data flow",
  //     null,
  //     null
  //   );
  //   return new CellState(this.graph.view, edge, this.graph.getCellStyle(edge));
  // }
}
class CustomSelectionHandler extends SelectionHandler {
  guidesEnabled: boolean = true;
}
class MyCustomCellRenderer extends CellRenderer {
  installCellOverlayListeners(
    state: CellState,
    overlay: CellOverlay,
    shape: Shape
  ) {
    // super.installCellOverlayListeners.apply(this, arguments);
    const graph = state.view.graph;
    InternalEvent.addGestureListeners(
      shape.node,
      function (evt) {
        graph.fireMouseEvent(
          InternalEvent.MOUSE_DOWN,
          new InternalMouseEvent(evt, state)
        );
      },
      function (evt) {
        graph.fireMouseEvent(
          InternalEvent.MOUSE_MOVE,
          new InternalMouseEvent(evt, state)
        );
      }
      // function (evt) {}
    );
    if (!Client.IS_TOUCH) {
      InternalEvent.addListener(
        shape.node,
        "mouseup",
        function (evt: MouseEvent) {
          overlay.fireEvent(
            new EventObject(
              InternalEvent.CLICK,
              "event",
              evt,
              "cell",
              state.cell
            )
          );
        }
      );
    }
  }
}

export class MyCustomPopUpmenuHandler extends PopupMenuHandler {
  autoExpand = true;
  construct: Construct;
  constructor(graph: MyCustomGraph, construct: Construct) {
    super(graph);
    this.construct = construct;
    this.factoryMethod = (menu, cell, evt) => {
      const customcell = cell as CustomCell;
      evt.defaultPrevented;
      menu.willAddSeparator = true;

      // if (cell) {
      this.addItem(
        "Font Size +",
        null,
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fontSize! += 6;
          graph.setCellStyle(newCell, [cell!]);
        },
        null,
        null,
        cell ? true : false, //setActive
        true
      );
      this.addItem(
        "Font Size -",
        null,
        () => {
          const newCell = graph.getCellStyle(cell!);
          const font = newCell.fontSize;
          if (font! < 1) {
            return;
          } else {
            newCell.fontSize! -= 6;
          }
          graph.setCellStyle(newCell, [cell!]);
        },
        null,
        null,
        cell ? true : false, //setActive
        true
      );
      this.addItem(
        "Cut",
        null,
        () => {
          const cells = graph.getSelectionCells();
          const cutCells = graph.cloneCells(cells);
          cutCells.map((cell) => {
            cell.setId(Math.random().toString(36).substr(2, 9));
          });
          graph.setTemporaryCells(cutCells);
          graph.removeCells(cells);
        },
        null,
        null,
        cell ? true : false, //setActive
        true
      );
      this.addItem(
        "Copy",
        null,
        () => {
          const cells = graph.getSelectionCells();
          const copyCells = graph.cloneCells(cells);

          copyCells.map((cell) => {
            cell.setId(Math.random().toString(36).substr(2, 9));
          });
          graph.setTemporaryCells(copyCells);
        },
        null,
        null,
        cell ? true : false, //setActive
        true
      );
      this.addItem(
        "Paste",
        null,
        () => {
          const cells = graph.getTemporaryCells();
          cells.map((cell) => {
            const geo = cell.getGeometry();
            if (geo != null) {
              geo.setRect(evt.offsetX, evt.offsetY, geo._width, geo._height);
            }
            graph.addCell(cell, null, null, null, null);
          });
        },
        null,
        null,
        true, //setActive
        true
      );
      if (graph.levelDFD != 2 && customcell?.data?.value == "process") {
        this.addItem(
          "Decompose process",
          null,
          () => {
            const beforeIndex = construct.currentPageIndex;
            construct.addPage();
            const newPageIndex = construct.currentPageIndex;
            const selectedCells = customcell.edges;
            const id = customcell?.data?.id1;
            // if (selectedCells != null) {
            const dupCell: CustomCell[] = [];
            selectedCells.map((cell: CustomCell) => {
              const customTarget = cell.target as CustomCell;
              if (customTarget?.data?.value != "process") {
                dupCell.push(cell.target!);
              }
            });
            graph.clearSelection();
            // console.log(newPageIndex);
            construct.decomposition(
              dupCell,
              beforeIndex,
              newPageIndex,
              id!.toString()
            );
          },
          null,
          "decomposition",
          cell ? true : false,
          true
        );
      } else {
        this.addItem("Decompose process", null, () => {});
      }

      this.addItem(
        "Duplicate",
        null,
        () => {
          const selectedCells = graph.getSelectionCells();
          graph.duplicateCells(selectedCells);
        },
        null,
        "duplicate",
        cell ? true : false, //setActive
        true
      );
      this.addSeparator();
      const submenu_color = this.addItem(
        "Color",
        null,
        () => {},
        null,
        "",
        cell ? true : false, //setActive
        true
      );
      this.addItem(
        "Red",
        "red.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "red";
          newCell.fontColor = "white";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
      this.addItem(
        "Green",
        "green.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "green";
          newCell.fontColor = "white";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
      this.addItem(
        "Yellow",
        "yellow.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "yellow";
          newCell.fontColor = "black";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
      this.addItem(
        "Blue",
        "blue.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "blue";
          newCell.fontColor = "white";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
      this.addItem(
        "Black",
        "black.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "black";
          newCell.fontColor = "white";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
      this.addItem(
        "White",
        "white.jpg",
        () => {
          const newCell = graph.getCellStyle(cell!);
          newCell.fillColor = "white";
          newCell.fontColor = "black";
          graph.setCellStyle(newCell, [cell!]);
        },
        submenu_color,
        null,
        true, //setActive
        true
      );
    };
  }
}
export class MyCustomGeometryClass extends Geometry {
  // Defines the default constraints for the vertices
  constraints = [
    new ConnectionConstraint(new Point(0.25, 0), true),
    new ConnectionConstraint(new Point(0.5, 0), true),
    new ConnectionConstraint(new Point(0.75, 0), true),
    new ConnectionConstraint(new Point(0, 0.25), true),
    new ConnectionConstraint(new Point(0, 0.5), true),
    new ConnectionConstraint(new Point(0, 0.75), true),
    new ConnectionConstraint(new Point(1, 0.25), true),
    new ConnectionConstraint(new Point(1, 0.5), true),
    new ConnectionConstraint(new Point(1, 0.75), true),
    new ConnectionConstraint(new Point(0.25, 1), true),
    new ConnectionConstraint(new Point(0.5, 1), true),
    new ConnectionConstraint(new Point(0.75, 1), true),
  ];
}
export class MyCustomGraph extends Graph {
  constructor(container: HTMLElement) {
    super(
      container,
      undefined,
      // Use a dedicated set of plugins to use MyCustomConnectionHandler and to not use extra plugins not needed here
      [
        CellEditorHandler,
        SelectionCellsHandler,
        MyCustomConnectionHandler,
        TooltipHandler,
        RubberBandHandler,
        PanningHandler,
        CustomSelectionHandler,
        PopupMenuHandler,
      ]
    );
    const newID = this.getDefaultParent();
    const parent = newID.getParent();
    parent?.setId(Math.random().toString(36).substr(2, 9));
    newID.setId(Math.random().toString(36).substr(2, 9));
  }
  private temporaryCells: Cell[] = [];
  getTemporaryCells() {
    return this.temporaryCells;
  }
  setTemporaryCells(cells: Cell[]) {
    this.temporaryCells = cells;
  }
  public counter: number = 0;
  getProcessID(): number {
    this.counter += 1;
    return this.counter;
  }
  getProcess1ID(): number {
    return this.counter;
  }
  public levelDFD: number = 0;
  getLevelDFD(): number {
    return this.levelDFD;
  }
  incLevelDFD(): number {
    this.levelDFD += 1;
    return this.levelDFD;
  }
  setLevelDFD(levelDFD: number): void {
    this.levelDFD = levelDFD;
  }
  public id1: string = "";
  getID1(): string {
    return this.id1;
  }
  setID1(id1: string): void {
    this.id1 = id1;
  }
  public id2: string = "";
  getID2(): string {
    return this.id2;
  }
  setID2(id2: string): void {
    this.id2 = id2;
  }

  createCellRenderer() {
    return new MyCustomCellRenderer();
  }
  getAllConnectionConstraints = (terminal: CellState | null) => {
    // Overridden to define per-geometry connection points
    return (
      (terminal?.cell?.geometry as MyCustomGeometryClass)?.constraints ?? null
    );
  };
  duplicateCells(cells: Cell[], dx: number = 20, dy: number = 20): Cell[] {
    if (cells && cells.length > 0) {
      // Copy the cells
      const copiedCells = this.getImportableCells(cells);
      const clonedCells = this.cloneCells(copiedCells);

      // Translate the cloned cells
      this.batchUpdate(() => {
        for (let i = 0; i < clonedCells.length; i++) {
          const geo = clonedCells[i].getGeometry();
          if (geo != null) {
            geo.translate(dx, dy);
          }
          clonedCells[i].setId(Math.random().toString(36).substr(2, 9));
        }
        this.addCells(clonedCells, null, null, null, null, true);
      });
    }
    return [];
  }
}

export class Construct {
  // public container: HTMLElement | null;
  public graph: MyCustomGraph | undefined;
  public pages: MyCustomGraph[] = [];
  public currentPageIndex: number = 0;
  private keyHandler?: KeyHandler;

  constructor() {
    this.addPage();
  }
  addPage() {
    const newContainer = document.createElement("div");
    InternalEvent.disableContextMenu(newContainer);
    newContainer.style.width = "1000px";
    newContainer.style.height = "600px";
    newContainer.style.display = "none";
    newContainer.style.marginTop = "69px";
    newContainer.style.marginLeft = "200px";
    // newContainer.style.overflowY = "auto";
    newContainer.style.backgroundColor = "white";
    document.body.appendChild(newContainer);

    const newGraph = new MyCustomGraph(newContainer);
    this.pages.push(newGraph);
    this.setupGraph(newGraph);

    if (this.pages.length === 1) {
      this.setKeyHandler(newGraph);
    }
    this.switchPage(this.pages.length - 1);
  }
  setKeyHandler(graph: MyCustomGraph) {
    if (this.keyHandler) {
      this.keyHandler.onDestroy();
    }
    this.keyHandler = new KeyHandler(graph);
    //Keyboard Event Start
    //Delete
    this.keyHandler.bindKey(46, function (evt: KeyboardEvent | MouseEvent) {
      evt.preventDefault();
      const select = graph.getSelectionCells();
      if (evt != null) {
        select.map((tes: CustomCell) => {
          if (tes.data?.value == "process") {
            graph.counter -= 1;
          }
          graph.removeCells(select);
        });
      }
    });
    //Enter
    this.keyHandler.bindKey(13, function (evt: KeyboardEvent) {
      if (evt != null) {
        const cell = graph.getSelectionCell();
        changeValue(cell);
      }
    });
    function changeValue(cell: Cell) {
      if (cell) {
        const value = cell.value;
        const newValue = prompt("enter a new value", value);

        if (newValue) {
          graph.batchUpdate(() => {
            graph.model.setValue(cell, newValue);
          });
          const text = newValue;
          if (cell.edge) {
            if (cell.edge == true) {
              if (t("lang") == "English") {
                axios
                  .post("https://34.101.80.4:8000/get_text/" + text)
                  .then((response) => {
                    const data = response.data;
                    if (data?.notif) {
                      toast.error(t("edge"), {
                        autoClose: 5000,
                        closeOnClick: true,
                        // progress: 1,
                      });
                      graph.setCellWarning(cell, data.notif, undefined, true);
                      // return ;
                    } else {
                      graph.removeCellOverlay(cell, null);
                    }
                  })
                  .catch(() => {
                    console.error("error");
                  });
              } else {
                axios
                  .post("https://34.101.80.4:8000/cek_kata/" + text)
                  .then((response) => {
                    const data = response.data;
                    if (data?.notif) {
                      toast.error(t("edge"), {
                        autoClose: 5000,
                        closeOnClick: true,
                        // progress: 1,
                      });
                      graph.setCellWarning(cell, data.notif, undefined, true);
                      // return ;
                    } else {
                      graph.removeCellOverlay(cell, null);
                    }
                  })
                  .catch(() => {
                    console.error("error");
                  });
              }
            }
          }
        } else {
          return;
        }
      } else {
        return;
      }
    }
    //Ctrl+A
    this.keyHandler.bindControlKey(65, function (evt: KeyboardEvent) {
      evt.preventDefault();
      graph.selectAll();
    });
    //Ctrl+Shift+A
    this.keyHandler.bindControlShiftKey(65, function (evt: KeyboardEvent) {
      evt.preventDefault();
      graph.clearSelection();
    });
    this.keyHandler.bindKey(37, () => moveSelectedCell(-10, 0)); // Arrow Left
    this.keyHandler.bindKey(38, () => moveSelectedCell(0, -10)); // Arrow Up
    this.keyHandler.bindKey(39, () => moveSelectedCell(10, 0)); // Arrow Right
    this.keyHandler.bindKey(40, () => moveSelectedCell(0, 10)); // Arrow Down
    function moveSelectedCell(dx: number, dy: number) {
      const cells = graph.getSelectionCells();
      if (cells) {
        graph.batchUpdate(() => {
          cells.map((cell) => {
            const geometry = cell.getGeometry();
            if (geometry) {
              const newGeo = geometry.clone();
              newGeo.translate(dx, dy);
              graph.model.setGeometry(cell, newGeo);
            }
          });
        });
      }
    }
    //Zoom in Zoom out Start
    //Zoom out
    this.keyHandler.bindControlKey(189, (evt: KeyboardEvent) => {
      evt.preventDefault();
      graph.zoomOut();
    });
    //Zoom in
    this.keyHandler.bindControlKey(187, (evt: KeyboardEvent) => {
      evt.preventDefault();
      graph.zoomIn();
    });
    //Reset View
    this.keyHandler.bindKey(36, (evt: KeyboardEvent) => {
      evt.preventDefault();
      graph.zoomActual();
    });
    //Zoom in Zoom out End
    //UNDO REDO start
    const undoManager = new UndoManager();
    const listener = function (_sender: null, evt: EventObject) {
      undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getDataModel().addListener(InternalEvent.UNDO, listener);
    graph.getView().addListener(InternalEvent.UNDO, listener);
    this.keyHandler.bindControlKey(90, (e: KeyboardEvent) => {
      e.preventDefault();
      undoManager.undo();
    });
    this.keyHandler.bindControlKey(89, (e: KeyboardEvent) => {
      e.preventDefault();
      undoManager.redo();
    });
    //UNDO REDO end
    //Keyboard Event End
  }
  switchPage(index: number) {
    if (index >= 0 && index < this.pages.length) {
      this.pages[this.currentPageIndex].container!.style.display = "none";
      this.pages[index].container!.style.display = "block";
      this.pages[index].container.focus();
      this.currentPageIndex = index;
      this.setKeyHandler(this.pages[index]);
    }
  }
  deletePage(index: number) {
    const containerToRemove = this.pages[index]?.container;
    if (containerToRemove && containerToRemove.parentNode) {
      containerToRemove.parentNode.removeChild(containerToRemove);
    }
    if (index >= 0 && index < this.pages.length) {
      this.pages.splice(index, 1);
      if (this.currentPageIndex >= this.pages.length) {
        this.currentPageIndex = this.pages.length - 1;
        this.graph = this.pages[this.currentPageIndex];
      }
    }
  }

  decomposition(
    cell: Cell[],
    beforeIndex: number,
    targetPageIndex: number,
    id: string
  ) {
    if (targetPageIndex >= 0 && targetPageIndex < this.pages.length) {
      const beforeGraph = this.pages[beforeIndex];
      const targetGraph = this.pages[targetPageIndex];
      const beforeLevel = beforeGraph.getLevelDFD();
      let newID: string;
      if (beforeLevel === 1) {
        targetGraph.setLevelDFD(2);
        newID = id;
        targetGraph.setID1(newID);
        targetGraph.setID2(beforeGraph.getID2());
      } else if (beforeLevel === 0) {
        targetGraph.setLevelDFD(1);
        newID = id;
        targetGraph.setID1(newID);
        targetGraph.setID2("1");
      }

      const clonedCell = this.pages[targetPageIndex].cloneCells(cell);
      if (clonedCell) {
        targetGraph.batchUpdate(() => {
          targetGraph.addCells(clonedCell, null, null, null, null, true);
        });
      }
    }
  }

  getPagesCount() {
    return this.pages.length;
  }
  getGraph(index: number) {
    if (index >= 0 && index < this.pages.length) {
      return this.pages[index];
    }
    return null;
  }
  //Export Image
  async exportMultipleGraphsToJPEG(filename: string) {
    const canvasArray = [];
    for (let i = 0; i < this.pages.length; i++) {
      const graph = this.pages[i];
      graph.container.style.display = "block";
      const canvas = await html2canvas(graph.container);

      console.log(canvas);
      if (canvas.width > 0 && canvas.height > 0) {
        canvasArray.push(canvas);
      } else {
        console.error("Canvas halaman kosong: ", canvas);
      }
    }
    console.log(canvasArray);
    const combinedCanvas = document.createElement("canvas");
    const ctx = combinedCanvas.getContext("2d");

    // Menetapkan ukuran gabungan canvas
    combinedCanvas.width = canvasArray[0].width; // Misalnya, menggunakan lebar halaman pertama
    combinedCanvas.height = canvasArray[0].height * canvasArray.length; // Menghitung tinggi total dari semua halaman

    let yOffset = 0;
    canvasArray.map((canvas) => {
      ctx?.drawImage(canvas, 0, yOffset);
      yOffset += canvas.height;
    });

    // Mengonversi gabungan canvas ke format JPEG dan men-downloadnya
    combinedCanvas.toBlob((blob) => {
      const link = document.createElement("a");
      link.download = filename + ".jpg";
      link.href = URL.createObjectURL(blob!);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/jpeg");
  }

  batch(graphh: Graph, parent: Cell) {
    graphh.batchUpdate(() => {
      const tes = graphh.insertVertex({
        parent,
        relative: false,
        position: [-100, -100],
        size: [0, 0],
        value: "",
        style: {
          shape: "rectangle",
          backgroundOutline: false,
          resizable: true,
          editable: true,
          // fillColor: "white",
        },
        id: Math.random().toString(36).substr(2, 9),

        geometryClass: MyCustomGeometryClass,
      });

      const tes1 = graphh.insertVertex({
        parent,
        relative: false,
        position: [-100, -100],
        size: [0, 0],
        value: "",
        style: {
          shape: "rectangle",
          backgroundOutline: false,
          resizable: true,
          editable: true,

          // fillColor: "white",
        },
        id: Math.random().toString(36).substr(2, 9),

        geometryClass: MyCustomGeometryClass,
      });
      // tes1.setStyle({ shape: "ellipse" });
      graphh.insertEdge(
        parent,
        Math.random().toString(36).substr(2, 9),
        "",
        tes,
        tes1
      );
    });
  }
  setupGraph(graphh: MyCustomGraph) {
    new MyCustomPopUpmenuHandler(graphh, this);
    const encoder = new Codec();
    graphh.setTooltips(true);
    const parent = graphh.getDefaultParent();
    this.batch(graphh, parent);
    encoder.encode(graphh.getDataModel());

    graphh.setMultigraph(false);
    graphh.setPanning(false);
    graphh.setConnectable(true);
    graphh.getStylesheet().getDefaultEdgeStyle()["edgeStyle"] =
      "orthogonalEdgeStyle";
    graphh.setCellsEditable(false);

    //change Value cell  start
    function changeValue(cell: Cell) {
      if (cell) {
        const value = cell.value;
        const newValue = prompt("enter a new value", value);

        if (newValue) {
          graphh.batchUpdate(() => {
            graphh.model.setValue(cell, newValue);
          });
          const text = newValue;
          if (cell.edge) {
            if (cell.edge == true) {
              if (t("lang") == "English") {
                axios
                  .post("https://make-ur-dfd.vercel.app/get_text/" + text)
                  .then((response) => {
                    const data = response.data;
                    if (data?.notif) {
                      toast.error(t("edge"), {
                        autoClose: 5000,
                        closeOnClick: true,
                        // progress: 1,
                      });
                      graphh.setCellWarning(cell, data.notif, undefined, true);
                      // return ;
                    } else {
                      graphh.removeCellOverlay(cell, null);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                axios
                  .post("https://make-ur-dfd.vercel.app/cek_kata/" + text)
                  .then((response) => {
                    const data = response.data;
                    if (data?.notif) {
                      toast.error(t("edge"), {
                        autoClose: 5000,
                        closeOnClick: true,
                        // progress: 1,
                      });
                      graphh.setCellWarning(cell, data.notif, undefined, true);
                      // return ;
                    } else {
                      graphh.removeCellOverlay(cell, null);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            }
          }
        } else {
          return;
        }
      } else {
        return;
      }
    }

    graphh.addListener("doubleClick", (_sender: null, evt: EventObject) => {
      const cell = evt.getProperty("cell");
      // console.log(cell);
      changeValue(cell);
    });

    //change Value cell  end
  }
}
