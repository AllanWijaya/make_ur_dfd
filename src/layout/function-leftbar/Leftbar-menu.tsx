import {
  AbstractCanvas2D,
  CellRenderer,
  CylinderShape,
  EllipseShape,
  Graph,
  SwimlaneShape,
} from "@maxgraph/core";
import {
  CustomCell,
  CustomData,
  MyCustomGeometryClass,
  MyCustomGraph,
} from "../../construct";

class DataStoreGaneClass extends CylinderShape {
  redrawPath(
    path: AbstractCanvas2D,
    _x: number,
    _y: number,
    w: number,
    h: number
  ) {
    // if (isForeground) {
    // console.log(x);
    // console.log(y);
    path.moveTo(-15, 0);
    path.lineTo(w / 3 - 15, 0);
    path.lineTo(w / 3 - 15, h);
    path.lineTo(-15, h);
    path.lineTo(-15, 0);
    path.moveTo(w - 15, 0);
    path.lineTo(w / 3 - 15, 0);
    path.lineTo(w / 3 - 15, h);
    path.lineTo(w - 15, h);
    // } else {
    path.close();
    // }
  }
}

class DataStoreYourdonClass extends CylinderShape {
  redrawPath(
    path: AbstractCanvas2D,
    _x: number,
    _y: number,
    w: number,
    h: number
  ): void {
    path.state.strokeColor = "blue";
    path.moveTo(0, 0);
    path.lineTo(w, 0);
    path.moveTo(0, h);
    path.lineTo(w, h);
    path.close();
  }
}
class ProcessGaneClass extends SwimlaneShape {}
class ProcessYourdonClass extends EllipseShape {}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
CellRenderer.registerShape("process-gane", ProcessGaneClass);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
CellRenderer.registerShape("process-yourdon", ProcessYourdonClass);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
CellRenderer.registerShape("data-store-gane", DataStoreGaneClass);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
CellRenderer.registerShape("data-store-yourdon", DataStoreYourdonClass);

export function Entity(graph: Graph, x: number, y: number): void {
  const parent = graph.getDefaultParent();

  graph?.batchUpdate(() => {
    const tes = graph?.insertVertex({
      parent,
      relative: false,
      position: [x, y],
      size: [100, 60],
      value: "Entity",

      style: {
        shape: "rectangle",
        fontSize: 12,
        fillColor: "blue",
        fontColor: "white",
      },
      // id: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
      geometryClass: MyCustomGeometryClass,
    }) as CustomCell;

    tes.data = new CustomData("entity");
  });
}

export function Process(graph: MyCustomGraph, x: number, y: number): void {
  const parent = graph.getDefaultParent();
  const processID = graph.getProcessID();

  const levelDFD = graph.getLevelDFD();
  const id1 = graph.getID1();
  const id2 = graph.getID2();
  graph?.batchUpdate(() => {
    const tes = graph?.insertVertex({
      parent,
      position: [x, y],
      size: [100, 100],
      value: null,
      style: {
        shape: "process-yourdon",

        backgroundOutline: true,
        fontSize: 12,
        fillColor: "blue",
        fontColor: "white",
      },
      id: Math.random().toString(36).substr(2, 9),
      geometryClass: MyCustomGeometryClass,
    }) as CustomCell;
    if (levelDFD == 0) {
      tes.setValue("1 \n Process");
    } else if (levelDFD == 1) {
      tes.setValue(id1 + "." + processID + " \n Process");
    } else if (levelDFD == 2) {
      tes.setValue(id2 + "." + id1 + "." + processID + " \n Process");
    }
    tes.data = new CustomData("process", processID);
  });
}

export function Datastore(graph: Graph, x: number, y: number): void {
  const parent = graph.getDefaultParent();
  graph?.batchUpdate(() => {
    const tes = graph?.insertVertex({
      parent,
      position: [x, y],
      size: [120, 60],
      value: "Datastore",
      style: {
        fontSize: 12,
        fillColor: "blue",
        shape: "data-store-yourdon",
        fontColor: "black",
      },
      id: Math.random().toString(36).substr(2, 9),
      geometryClass: MyCustomGeometryClass,
    }) as CustomCell;

    tes.data = new CustomData("datastore");
  });
}
