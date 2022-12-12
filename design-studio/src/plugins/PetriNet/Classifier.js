const Queue = require("../../common/Queue");

module.exports = class Classifier {
  constructor(net) {
    this.net = net;
  }

  get inNodeMap() {
    return this.buildNodeMap("in");
  }

  get outNodeMap() {
    return this.buildNodeMap("out");
  }

  get isFreeChoice() {
    const transitionToPlaces = this.net.transitions.reduce(
      (map, transition) => {
        map[transition.path] = Object.keys(this.outNodeMap).filter(
          (place) => this.outNodeMap[place][transition.path]
        );

        return map;
      },
      {}
    );
    const intersects = (t1, t2) => {
      const places1 = transitionToPlaces[t1];
      const places2 = transitionToPlaces[t2];

      return (
        places1.filter((place) => places2.includes(place)).length === 0 ||
        t1 === t2
      );
    };

    return Object.keys(transitionToPlaces).every((transition1) =>
      Object.keys(transitionToPlaces).every((transition2) =>
        intersects(transition1, transition2)
      )
    );
  }

  get isMarkedGraph() {
    const placesHaveOneInTransition = (place) =>
      Object.keys(this.inNodeMap[place.path]).filter(
        (transition) => this.inNodeMap[place.path][transition]
      ).length === 1;
    const placesHaveOneOutTransition = (place) =>
      Object.keys(this.outNodeMap[place.path]).filter(
        (transition) => this.outNodeMap[place.path][transition]
      ).length === 1;

    return this.net.places.every(
      (place) =>
        placesHaveOneInTransition(place) && placesHaveOneOutTransition(place)
    );
  }

  get isStateMachine() {
    const transitionsHaveOneInPlace = (transition) =>
      Object.keys(this.inNodeMap[transition.path]).filter(
        (place) => this.inNodeMap[place][transition.path]
      ).length === 1;
    const transitionsHaveOneOutPlace = (transition) =>
      Object.keys(this.outNodeMap[transition.path]).filter(
        (place) => this.outNodeMap[place][transition.path]
      ).length === 1;

    return this.net.transitions.every(
      (transition) =>
        transitionsHaveOneInPlace(transition) &&
        transitionsHaveOneOutPlace(transition)
    );
  }

  get isWorkflow() {
    const places = this.net.places.map((place) => place.path);
    const transitions = this.net.transitions.map(
      (transition) => transition.path
    );

    const removeItem = (item, array) => {
      const index = array.indexOf(item);

      if (index > -1) array.splice(index, 1);
    };

    if (places.length === 1 && transitions.length === 0) return true;

    const sources = Object.keys(this.inNodeMap).filter((place) => {
      return Object.keys(this.inNodeMap[place]).every(
        (transition) => !this.inNodeMap[place][transition]
      );
    });

    const sinks = Object.keys(this.outNodeMap).filter((place) => {
      return Object.keys(this.outNodeMap[place]).every(
        (transition) => !this.outNodeMap[place][transition]
      );
    });

    if (sources.length !== 1 || sinks.length !== 1) return false;

    const placesAndTransitions = [...places, ...transitions];
    const startingId = source[0];
    const queue = new Queue(placesAndTransitions.length);
    const visited = new Set();

    visited.add(startingId);
    removeItem(startingId, placesAndTransitions);
    queue.enqueue(startingId);
    let result;

    while (!queue.isEmpty) {
      let nodeId = queue.dequeue();

      result = nodeId;

      if (places.includes(nodeId)) {
        Object.keys(this.outNodeMap[nodeId])
          .filter((transition) => !visited.has(transition))
          .forEach((transition) => {
            visited.add(transition);
            removeItem(transition, placesAndTransitions);
            queue.enqueue(transition);
            Object.keys(this.inNodeMap)
              .filter(
                (place) =>
                  this.inNodeMap[place][transition] && !visited.has(place)
              )
              .forEach((place) => {
                visited.add(place);
                removeItem(place, placesAndTransitions);
                queue.enqueue(place);
              });
          });
      }
    }

    return result === sinks[0] && placesAndTransitions.length == 0;
  }

  buildNodeMap(direction = "in") {
    const { ArcToPlace, ArcToTransition } = this.net.arcs;

    return this.net.places.reduce((map, place) => {
      const placePath = place.path;

      map[place.path] = this.net.transitions.reduce(
        (transitions, transition) => {
          const transitionPath = transition.path;

          const srcPath = destination === "in" ? transitionPath : placePath;
          const dstPath = destination === "in" ? placePath : transitionPath;
          const arcs = direction === "in" ? ArcToPlace : ArcToTransition;

          transitions[transitionPath] = arcs.some(
            (arc) => arc.src === srcPath && arc.dst === dstPath
          );

          return transitions;
        },
        {}
      );

      return map;
    }, {});
  }
};
