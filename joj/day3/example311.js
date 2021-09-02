const UpperCaseFormatter = {
  format: function(msg) {
    return msg.toUpperCase();
  } 
};

const Foo = Object.create(UpperCaseFormatter);
Foo.saySomething = function saySomething(msg) {
    console.log(this.format(msg));
}
Foo.saySomething('hello'); // Prints HELLO
