module.exports = class Notifier {
  constructor(notifyFn, classifier) {
    this.notifyFn = notifyFn;
    this.classifier = classifier;
  }

  notify() {
    const classifications = [];

    if (this.classifier.isFreeChoice()) classifications.push("Free Choice");
    if (this.classifier.isStateMachine()) classifications.push("State Machine");
    if (this.classifier.isMarkedGraph()) classifications.push("Marked Graph");
    if (this.classifier.isWorkflow()) classifications.push("Workflow");

    this.notifyFn({
      message: `This is a valid ${classifications.join(", ")} Petri Net.`,
      severity: "info",
    });
  }
};
