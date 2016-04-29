/* global describe, it */

import chai from 'chai'
import * as api from '../src/api.js'
import grlib from 'graphlib'
import fs from 'fs'
import _ from 'lodash'

var expect = chai.expect

describe('Graphlib to KGraph conversion', () => {
  it('can convert a node into the KGraph format', () => {
    var knode = api.convertNode({v: 'a', value: {inputPorts: {b: 'c'}}})
    expect(knode.id).to.equal('a')
    expect(knode.labels).to.have.length(1)
    expect(knode.labels[0].text).to.equal('a')
    expect(knode.ports).to.have.length(1)
    expect(knode.ports[0].id).to.equal('a_b_in')
  })

  it('can convert graphlib graphs', () => {
    var g = grlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/fac.json')))
    var newGraph = api.convertGraph(g)
    var facEdges = newGraph.children[2].edges
    expect(facEdges[0].sourcePort).to.equal('fac_n_in')
    expect(facEdges[2].sourcePort).to.equal('fac_n_in')
    expect(facEdges[4].targetPort).to.equal('fac_fac_out')
    expect(facEdges[facEdges.length - 1].targetPort).to.equal('fac_fac_out')
  })

  it('can store meta information inside the KGraph', () => {
    var g = grlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/fac.json')))
    var newGraph = api.convertGraph(g)
    var facEdges = newGraph.children[2].edges
    expect(facEdges[0].meta.sourceType).to.equal('number')
    expect(facEdges[2].meta.targetType).to.equal('generic')
    expect(newGraph.edges[0].meta.sourceType).to.equal('string')
    expect(newGraph.children[2].ports).to.have.length(2)
    expect(newGraph.children[2].ports[0].meta.type).to.equal('number')
  })

  it('keeps edges for nodes without parents', () => {
    var g = grlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/fac2.json')))
    var newGraph = api.convertGraph(g)
    expect(newGraph.edges).to.have.length(4)
  })
})
