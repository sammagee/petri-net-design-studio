const { getMetaAttr } = require("./utils");

module.exports = class PetriNet {
  constructor(core, nodes, error) {
    this.core = core;
    this.nodes = nodes;
    this.error = error;
  }

  get arcs() {
    return this.nodes.reduce(
      (arcs, node) => {
        const metaAttr = getMetaAttr(node);

        if (["ArcToPlace", "ArcToTransition"].includes(metaAttr)) {
          const src = this.core.getPointerPath(node, "src");
          const dst = this.core.getPointerPath(node, "dst");

          arcs[metaAttr].push({ src, dst });
        }

        return arcs;
      },
      { ArcToPlace: [], ArcToTransition: [] }
    );
  }

  get places() {
    return this.getFilteredNodes("Place");
  }

  get transitions() {
    return this.getFilteredNodes("Transition");
  }

  getFilteredNodes(metaAttr) {
    return this.nodes
      .filter((node) => getMetaAttr(this.core, node) === metaAttr)
      .map((node) => ({
        path: this.core.getPath(node),
        node,
      }));
  }
};
