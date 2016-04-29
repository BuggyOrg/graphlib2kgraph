
import {utils} from '@buggyorg/graphtools'
import _ from 'lodash'

export function convertPort (nodeName, type, port, portType) {
  return {
    id: nodeName + '_' + port + '_' + portType
  }
}

export function convertNode (node) {
  return {
    id: node.v,
    labels: [{text: node.v}],
    ports: _.concat(
      _.map(node.value.inputPorts, _.partial(convertPort, node.v, _, _, 'in')),
      _.map(node.value.outputPorts, _.partial(convertPort, node.v, _, _, 'out'))
    )
  }
}

export function convertNodes (nodes) {
  return _.map(nodes, convertNode)
}

export function convertEdge (graph, edge) {
  if (graph.parent(edge.v) === edge.w) {
    return {
      id: edge.v + edge.w,
      source: edge.v,
      sourcePort: edge.v + '_' + edge.value.outPort + '_out',
      target: edge.w,
      targetPort: edge.w + '_' + edge.value.inPort + '_out'
    }
  } else if (graph.parent(edge.w) === edge.v) {
    return {
      id: edge.v + edge.w,
      source: edge.v,
      sourcePort: edge.v + '_' + edge.value.outPort + '_in',
      target: edge.w,
      targetPort: edge.w + '_' + edge.value.inPort + '_in'
    }
  } else {
    return {
      id: edge.v + edge.w,
      source: edge.v,
      sourcePort: edge.v + '_' + edge.value.outPort + '_out',
      target: edge.w,
      targetPort: edge.w + '_' + edge.value.inPort + '_in'
    }
  }
}

export function convertEdges (graph, edges) {
  return _.map(edges, _.partial(convertEdge, graph, _))
}

function combineNodes (graph, node, childMap, edgeMap) {
  if (_.has(childMap, node.id)) {
    node.children = _.map(childMap[node.id], _.partial(combineNodes, graph, _, childMap, edgeMap))
  }
  if (_.has(edgeMap, node.id)) {
    node.edges = convertEdges(graph, edgeMap[node.id])
  }
  return node
}

var edgeParent = function (graph, edge) {
  var outP = edge.v
  var inP = edge.w
  if (graph.parent(outP) === graph.parent(inP)) {
    return graph.parent(outP)
  } else if (graph.parent(outP) === inP) {
    return inP
  } else {
    return outP
  }
}

function setEdgeParent (edge, graph) {
  return _.merge({}, edge, {parent: edgeParent(graph, edge)})
}

export function convertGraph (graph) {
  var editGraph = utils.edit(graph)
  var nodes = _(editGraph.nodes)
    .groupBy('parent')
    .mapValues(convertNodes)
    .value()
  var edges = _(editGraph.edges)
    .map(_.partial(setEdgeParent, _, graph))
    .groupBy('parent')
    .value()
  return {
    id: 'root',
    // nodes[undefined] returns all nodes that have no parent
    children: _.map(nodes[undefined], _.partial(combineNodes, graph, _, nodes, edges)),
    edges: convertEdges(edges[undefined])
  }
}
