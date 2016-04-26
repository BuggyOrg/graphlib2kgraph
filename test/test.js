/* global describe, it */

import chai from 'chai'
import * as api from '../src/api.js'
import grlib from 'graphlib'
import fs from 'fs'
import _ from 'lodash'

var expect = chai.expect

describe('Graphlib to KGraph conversion', () => {
  it('can convert a node into the KGraph format', () =>{
    var knode = api.convertNode({v: 'a', value: {inputPorts: {b: 'c'}}})
    expect(knode.id).to.equal('a')
    expect(knode.labels).to.have.length(1)
    expect(knode.labels[0].text).to.equal('a')
    expect(knode.ports).to.have.length(1)
    expect(knode.ports[0].id).to.equal('a_b')
  })

  it('can convert graphlib graphs', () => {
    var g = grlib.json.read(JSON.parse(fs.readFileSync('test/fixtures/fac.json')))
    var newGraph = api.convertGraph(g)
    // TODO write test
  })
})