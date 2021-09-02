
function doSomething(config = {}) {
  config = Object.assign(
    {
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    }, config);

   console.log(`Using config ${config.foo}, ${config.bar}, ${config.bar}`);
}

doSomething();               // Prints Using config foo, bar, bar
doSomething({foo: 'hello'}); // Prints Using config hello, bar, bar
