import { wrappingInputRule } from '@tiptap/core';
const r1 = /^([a-z])\.\s$/i
console.log(r1.test('a. '))
console.log(r1.test('i. '))
console.log(r1.test('1. '))
