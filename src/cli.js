#!/usr/bin/env node
/* global __dirname, process */

import program from 'commander'
import fs from 'fs'
import graphlib from 'graphlib'
import {convertGraph} from './api.js'

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json'))['version'])
  .option('-f, --graphfile <graphfile>', 'Set graph file to parse. If none is given stdin is read')
  .parse(process.argv)

var processGraph = str => {
  var graph = graphlib.json.read(JSON.parse(str))
  return Promise.resolve(JSON.stringify(convertGraph(graph), null, 2))
}

if (program.graphfile) {
  var str = fs.readFileSync(program.graphfile)
  processGraph(str).then((code) => console.log(code))
  .catch((e) => {
    console.log('Error while processing: ', e.stack)
  })
} else {
  getStdin().then(str => {
    processGraph(str).then((code) => console.log(code))
    .catch((e) => {
      console.log('Error while processing: ', e.stack)
    })
  })
}
