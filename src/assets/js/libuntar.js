// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under a MIT License
// https://github.com/workhorsy/uncompress.js
// Based on the information from:
// https://en.wikipedia.org/wiki/Tar_(computing)
"use strict";
(function(){function e(h,d,c){return h.slice(d,d+c)}var a=null;"object"===typeof window?a=window:"function"===typeof importScripts&&(a=self);a.tarGetEntries=function(h,d){for(var c=new Uint8Array(d),b=0,a=[];b+512<c.byteLength;){var f=saneMap(e(c,b+0,100),String.fromCharCode);f=f.join("").replace(/\0/g,"");if(0===f.length)break;var k=parseInt(saneJoin(saneMap(e(c,b+124,12),String.fromCharCode),""),8),g=saneMap(e(c,b+156,1),String.fromCharCode)|0;0!==g&&5!==g||a.push({name:f,size:k,is_file:0==g,offset:b});
b+=k+512;0<b%512&&(b=512*((b/512|0)+1))}return a};a.tarGetEntryData=function(a,d){var c=new Uint8Array(d);return e(c,a.offset+512,a.size)}})();
