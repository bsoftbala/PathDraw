import SVG from 'svgjs';

SVG.wrap = function (node) {
  /* Wrap an existing node in an SVG.js element. This is a slight hack
   * because svg.js does not (in general) provide a way to create an
   * Element of a specific type (eg SVG.Ellipse, SVG.G, ...) from an
   * existing node and still call the Element's constructor.
   *
   * So instead, we call the Element's constructor and delete the node
   * it created (actually, just leaving it to garbage collection, since it
   * hasn't been inserted into the doc yet), replacing it with the given node.
   *
   * Returns the newly created SVG.Element instance.
   */
  if (node.length) node = node[0]; // Allow using with or without jQuery selections
  const element_class = capitalize(node.nodeName);
  try {
    var element = new SVG[element_class]();
  } catch (e) {
    throw (`No such SVG type '${element_class}'`);
  }
  element.node = node;
  return element;
};

function capitalize(string) {
  if (!string) return string;
  return string[0].toUpperCase() + string.slice(1);
}

export default SVG;
