function getMetaAttr(core, node) {
  return core.getAttribute(core.getMetaType(node), "name");
}

module.exports = {
  getMetaAttr,
};
