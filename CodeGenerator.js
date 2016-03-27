'use strict';

// TODO: make every function return an object with data or code (or both)
// TODO: add @returns to all function comments

class CodeGenerator {

  /*
    @param Object data {
      {string} name,
      {array} args,
      {function} body
    }
  */
  static firstClassFunction(data) {
    var code =
      `var ${data.name} = function(${ data.args && data.args.join(",") || "" }) {` + "\n" +
        `${data.body()}` + "\n" +
      `};`
    
    return {
      data: data,
      code: CodeGenerator.indent(code)
    }
  }

  /* 
    @param Object data {
      {string} type
    }

    @returns Object {
      {string} code
    }
  */
  static newObjectInstance(data) {
    var code = `new ${data.type}();`;

    return {
      code: code
    }
  }
  
  /*
    @param Object data {
      {string} objName
      {string} funcName,
      {array} args,
      {function} body
    }
  */
  static objectFunction(data) {
    var code =
      `${data.objName || "this"}.${data.funcName} = function(${ data.args && data.args.join(", ") || "" }) {` + "\n" +
        `${data.body()}` + "\n" +
      `};`

    return {
      data: data,
      code: CodeGenerator.indent(code)
    }
  }
  
  /*
    @param Object data {
      {string} condition,
      {function} body
    }
  */
  static ifStatement(data) {
    var code =
      `if (${data.condition}) {` + "\n" +
        `${data.body()}` + "\n" +
      `}`;

    return {
      data: data,
      code: CodeGenerator.indent(code)
    }
  }

  /*
    @param Object data {
      {string} startCondition,
      {string} stopCondition,
      {string} incrementAction,
      {function} body
    }
  */
  static forLoop(data) {
    var code = 
      `for (${data.startCondition}; ${data.stopCondition}; ${data.incrementAction}) {` + "\n" +
        `${data.body()}` + "\n" +
      `}`
    

    return {
      data: data,
      code: CodeGenerator.indent(code)
    }
  }

  /* 
    @param Object data {
      {function} body,
    }
  */
  static tryBlock(data) {
    var code =
      `try {` + "\n" +
        `${data.body()}` + "\n" +
      `}`;

    return {
      code: CodeGenerator.indent(code)
    }

  }

  /* 
    @param Object data {
      {string} arg
      {function} body,
    }
  */
  static catchBlock(data) {
    var code = 
      `catch(${ data.arg || "" }) {`  + "\n" +
        `${data.body(data.arg)}`  + "\n" +
      `}`;

    return CodeGenerator.indent(code)
  }


  /*
    @param Object data {
      {string} objName
      {string} funcName,
      {array} args
    }
  */
  static objectFunctionCall(data) {
    return (
      CodeGenerator.clean(
        `${data.objName || "this"}.${data.funcName}(${ data.args && data.args.join(", ") || "" });`
      )
    );
  }

  /*
    @param Object data {
      {string} name
      {array} args (optional)
    }
  */
  static chainFunction(data) {
    return `.${data.name}(${ (data.args && data.args.join(", ")) || "" })`;
  }

  /*
    @param Object data {
      {string} objName (Optional. Defaults to "this")
      {string} propName,
      {string} value,
      {boolean} dotNotation
    }
  */
  static objectPropertyAssignment(data) {
    var code;
    if ( data.hasOwnProperty("dotNotation") && data.dotNotation == false){
      code = `${data.objName || "this"}["${data.propName}"] = ${data.value};`;
      data.name = `${data.objName}["${data.propName}"]`;
    }
    else {
      code = `${data.objName || "this"}.${data.propName} = ${data.value};`;
      data.name = `${data.objName}.${data.propName}`;
    }

    return {
      data: data,
      code: CodeGenerator.clean(code)
    }
  }


  /*
    @param Object data {
      {string} name,
      {string} value
    }
  */
  static variable(data) {
    var code = `var ${data.name}` + (data.value ? ` = ${data.value};` : ";");

    return {
      data: data,
      code: CodeGenerator.clean(code)
    }
  }

  /*
    @param Object data {
      {string} name,
      {string} value
    }
  */
  static reassignVariable(data) {
    var code = `${data.name} = ${data.value};`;

    return {
      data: data,
      code: CodeGenerator.clean(code)
    }
  }

  /*
    @param Object data {
      {string} value
    }
  */
  static returnStatement(data) {
    return `return ${data && data.value};`
  }

  /*
    @param {string} code

    @description: 
      Takes a rendered code and indents lines 2 through (n - 2), 
      where n is the number of lines

    @returns: {string}
  */
  static indent(code) {
    return (
      code
      .split("\n")
      .map(function(line, i, arr){
        if (i == 0 || i == arr.length - 1) {
          return (CodeGenerator.generateTabs(0) + CodeGenerator.clean(line) );
        }
        else {
          return (CodeGenerator.generateTabs(CodeGenerator.numTabs) + CodeGenerator.clean(line) );
        }
      })
      .join("\n")
    )
  }

  /*
    @param: {integer} numTabs
    @description: generates a string containing the number of tabs requested
    @returns: {string}
  */
  static generateTabs(numTabs) {
    var tabs = "";
    for (var i = 0; i < CodeGenerator.numSpacesPerTab * numTabs; i += 1) {
      tabs += " ";
    }
    
    return tabs;
  }

  /*
    @param: {string} line
    @description: Cleans a line of code. 
    @returns: {string}
  */
  static clean(line) {
    return line.replace(/;{2,}/g, ";");
  }

  /*
    @description:
      returns a name for an iterator variable that hasn't been used.
      An example of an iterator variable would be `var i` in a for loop.
      This function is used to prevent undesired behavior in a nested
      loop. Starts at 'i'

    @returns: {string} iterator
  */
  static uniqueIteratorName() {
    var numChars = 1;
    var idx = CodeGenerator.iteratorPos;

    var iterator = "";

    if (CodeGenerator.iteratorPos >= 26) {
      numChars =
        CodeGenerator.iteratorPos % 26 == 0
        ?
        (CodeGenerator.iteratorPos / 26) + 1
        :
        (CodeGenerator.iteratorPos / 26);

      var idx = CodeGenerator.iteratorPos % 26;
    }

    for (var i = 0; i < numChars; i += 1) {
      iterator += CodeGenerator.iterators[idx];
    }

    CodeGenerator.iteratorPos += 1;

    return iterator;
  }

  /*
    @desecription: resets the position of the current iterator to return back to 'i'
  */
  static resetIteratorPos() {
    CodeGenerator.iteratorPos = 8;
  }
}


CodeGenerator.numSpacesPerTab = 4;
CodeGenerator.numTabs = 1;
CodeGenerator.iteratorPos = 8;
CodeGenerator.iterators = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];


module.exports = CodeGenerator;