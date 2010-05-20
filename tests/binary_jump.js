#!/usr/bin/env node
// Jumping around in a binary parser
var assert = require('assert');

var Buffer = require('buffer').Buffer;
var BufferList = require('bufferlist').BufferList;
var Binary = require('bufferlist/binary').Binary;

Number.prototype.upTo = function (n) {
    var acc = [];
    for (var i = Number(this); i <= n; i++) {
        acc.push(i);
    }
    return acc;
};

Number.prototype.downTo = function (n) {
    var acc = [];
    for (var i = Number(this); i >= n; i--) {
        acc.push(i);
    }
    return acc;
};

Array.prototype.zip = function (xs) {
    var arr = this;
    return (0).upTo(this.length - 1).map(function (i) {
        return [ arr[i], xs[i] ];
    });
};

var tapped = 0;

var bList = new BufferList;

Binary(bList)
    .skip(3)
    .getWord16be('de')
    .tap(function (vars) {
        var de = 256 * 'd'.charCodeAt(0) + 'e'.charCodeAt(0);
        assert.equal(
            vars.de, de,
            'getWord16be at 3 should be ' + de + ', not ' + vars.de
        );
        tapped ++;
    })
    .rewind(4)
    .getWord32le('bcde')
    .tap(function (vars) {
        var bcde = 'bcde'.split('').zip((0).upTo(3)).reduce(function (acc,xx) {
            return acc + Math.pow(256,xx[1]) * xx[0].charCodeAt(0);
        }, 0);
        
        assert.equal(
            vars.bcde, bcde,
            'rewind 2, "bcde" as a 32le should be ' + bcde + ', is ' + vars.bcde
        )
        tapped ++;
    })
;

var buf1 = new Buffer(5); buf1.write('abcde');
var buf2 = new Buffer(3); buf2.write('xyz');
var buf3 = new Buffer(5); buf3.write('11358');
bList.push(buf1,buf2,buf3);
assert.equal(tapped, 2, 'not tapped');
