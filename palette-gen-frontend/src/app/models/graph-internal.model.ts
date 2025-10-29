export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  color: number[];
  x?: number;
  y?: number;
  r?: number; 
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}